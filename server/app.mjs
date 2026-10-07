import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { randomBytes, randomUUID, createHash, timingSafeEqual } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getSite, hashPassword, verifyPasswordAsync } from './db.mjs';
import { photoSchema, decodePhotos } from './photos.mjs';
import { createCoasterTrack } from '../src/lib/event-coaster.ts';
import { createStationPlanner } from '../src/lib/event-layout.ts';
import { createEventStations } from '../src/lib/event-stations.ts';
import { pageMeta } from '../shared/page-meta.ts';
import { routeAssets } from '../shared/route-assets.mjs';

const safeUrl = z.union([z.literal(''), z.string().trim().max(500).pipe(z.url()).refine(value => {
  const url = new URL(value);
  return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password;
}, 'Use an http:// or https:// URL without credentials')]);
const isoDate = z.union([z.literal(''), z.iso.datetime({ offset: true })]);
const eventSchema = z.object({ title: z.string().trim().min(2).max(120), description: z.string().trim().min(20).max(1600), startsAt: z.iso.datetime({ offset: true }), endsAt: isoDate, location: z.string().trim().min(2).max(200), category: z.string().trim().min(2).max(60), registrationUrl: safeUrl, albumUrl: safeUrl.optional(), published: z.boolean() }).refine(e => !e.endsAt || new Date(e.endsAt) >= new Date(e.startsAt), 'End date must follow the start date');
const projectSchema = z.object({ title: z.string().trim().min(2).max(120), description: z.string().trim().min(20).max(1600), domain: z.string().trim().min(2).max(60), status: z.string().trim().min(2).max(60), url: safeUrl, repositoryUrl: safeUrl, published: z.boolean() });
const memberSchema = z.object({ name: z.string().trim().min(2).max(100), role: z.string().trim().min(2).max(100), initials: z.string().trim().min(1).max(4), status: z.enum(['member', 'alumni']).optional() });
const settingsSchema = z.object({ recruitmentOpen: z.boolean(), recruitmentMessage: z.string().trim().min(10).max(600), recruitmentNextOpening: z.string().trim().max(200).optional(), recruitmentDeadline: isoDate, cycle: z.string().trim().min(1).max(50), contactEmail: z.email().max(254), instagramUrl: safeUrl, githubUrl: safeUrl, linkedinUrl: safeUrl });
const applicationSchema = z.object({ name: z.string().trim().min(2).max(100), email: z.string().trim().pipe(z.email().max(254)).transform(e => e.toLowerCase()), year: z.enum(['1', '2', '3']), domain: z.enum(['aiml', 'web', 'dsa']), motivation: z.string().trim().min(30).max(1600), portfolio: safeUrl.default(''), linkedin: safeUrl.default(''), github: safeUrl.default(''), leetcode: safeUrl.default(''), consent: z.literal(true), website: z.literal('').optional() });
const hashToken = token => createHash('sha256').update(token).digest('hex');
const applicationRow = row => ({ id: row.id, name: row.name, email: row.email, year: row.year, domain: row.domain, motivation: row.motivation, portfolio: row.portfolio, linkedin: row.linkedin, github: row.github, leetcode: row.leetcode, cycle: row.cycle, status: row.status, createdAt: row.created_at });
const experienceTrack = createCoasterTrack(), stationPlanner = createStationPlanner(experienceTrack);
const idleTimeout = 30 * 60_000;

export function createApp(db, { production = process.env.NODE_ENV === 'production', origin = process.env.APP_ORIGIN, dist = resolve('dist/client'), limits = true, render } = {}) {
  const app = express();
  if (production && (!origin || new URL(origin).origin !== origin || !origin.startsWith('https://'))) throw new Error('Production requires APP_ORIGIN as an exact HTTPS origin.');
  app.disable('x-powered-by');
  app.use(compression({ threshold: 1024 }));
  if (process.env.TRUST_PROXY === '1') app.set('trust proxy', 1);
  app.use(helmet({ contentSecurityPolicy: production ? { directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'"], imgSrc: ["'self'", 'data:', 'blob:', 'https://*.supabase.co'], mediaSrc: ["'self'", 'blob:'], connectSrc: ["'self'", 'https://*.supabase.co'], fontSrc: ["'self'"], objectSrc: ["'none'"], frameAncestors: ["'none'"] } } : false, strictTransportSecurity: production }));
  const smallJson = express.json({ limit: '48kb' });
  app.use('/api', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  const allowed = new Set(production ? [origin] : [origin, 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3001', 'http://127.0.0.1:3001']);
  app.use('/api', (req, res, next) => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      if (req.headers['sec-fetch-site'] === 'cross-site' || (req.headers.origin && !allowed.has(req.headers.origin))) return res.status(403).json({ error: 'This request did not come from the Nucleus website.' });
      if ((req.headers['content-length'] > 0 || req.headers['transfer-encoding']) && !req.is('application/json')) return res.status(415).json({ error: 'Send form data as application/json.' });
    }
    next();
  });
  const limiter = (limit, windowMs) => limits ? rateLimit({ limit, windowMs, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: 'Too many attempts. Please try again later.' } }) : (_req, _res, next) => next();
  app.use('/api', limiter(400, 60_000));
  app.get('/api/health', (_req, res) => { db.prepare('SELECT 1').get(); res.json({ status: 'ok' }); });
  app.get('/api/site', (_req, res) => res.json(getSite(db)));
  app.get('/api/event-photos/:id', (req, res) => {
    const photo = db.prepare("SELECT p.mime,p.data,c.body FROM event_photos p JOIN content c ON c.kind=p.kind AND c.id=p.event_id WHERE p.id=?").get(req.params.id);
    if (!photo || !JSON.parse(photo.body).published) return res.status(404).json({ error: 'Photo not found.' });
    res.type(photo.mime).send(Buffer.from(photo.data));
  });
  app.get('/api/member-photos/:id', (req, res) => {
    const photo = db.prepare('SELECT mime,data FROM member_photos WHERE id=?').get(req.params.id);
    if (!photo) return res.status(404).json({ error: 'Photo not found.' });
    res.type(photo.mime).send(Buffer.from(photo.data));
  });

  const cookieName = production ? '__Host-nucleus_session' : 'nucleus_session';
  const cookieOptions = { httpOnly: true, sameSite: 'strict', secure: production, path: '/', maxAge: 12 * 60 * 60 * 1000 };
  const dummyPassword = hashPassword(randomBytes(32).toString('hex'));
  const sessionToken = req => (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
  function auth(req, res, next) {
    const token = sessionToken(req);
    if (!token || !/^[a-f0-9]{64}$/.test(token)) return res.status(401).json({ error: 'Please sign in to the control room.' });
    const now = Date.now();
    const session = db.prepare('SELECT s.*,a.email FROM sessions s JOIN admins a ON s.admin_id=a.id WHERE s.token_hash=? AND s.expires_at>? AND s.last_seen>?').get(hashToken(token), now, now - idleTimeout);
    if (!session) {
      db.prepare('DELETE FROM sessions WHERE token_hash=?').run(hashToken(token));
      res.clearCookie(cookieName, { ...cookieOptions, maxAge: undefined });
      return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
    }
    const csrf = req.headers['x-csrf-token'];
    if (!['GET', 'HEAD'].includes(req.method) && (typeof csrf !== 'string' || !/^[a-f0-9]{64}$/.test(csrf) || !timingSafeEqual(Buffer.from(csrf), Buffer.from(session.csrf)))) return res.status(403).json({ error: 'Session verification failed. Refresh and try again.' });
    db.prepare('UPDATE sessions SET last_seen=? WHERE token_hash=?').run(now, session.token_hash);
    req.session = session; next();
  }
  app.post('/api/admin/login', limiter(8, 15 * 60_000), smallJson, async (req, res) => {
    const input = z.object({ email: z.string().trim().pipe(z.email().max(254)), password: z.string().min(1).max(256) }).parse(req.body);
    const admin = db.prepare('SELECT * FROM admins WHERE email=?').get(input.email.toLowerCase());
    const valid = await verifyPasswordAsync(input.password, admin?.password_hash || dummyPassword);
    if (!admin || !valid) return res.status(401).json({ error: 'Email or password is incorrect.' });
    db.prepare('DELETE FROM sessions WHERE expires_at<=? OR last_seen<=?').run(Date.now(), Date.now() - idleTimeout);
    const previous = sessionToken(req);
    if (previous) db.prepare('DELETE FROM sessions WHERE token_hash=?').run(hashToken(previous));
    const token = randomBytes(32).toString('hex'), csrf = randomBytes(32).toString('hex');
    db.prepare('INSERT INTO sessions(token_hash,admin_id,csrf,expires_at,last_seen) VALUES(?,?,?,?,?)').run(hashToken(token), admin.id, csrf, Date.now() + cookieOptions.maxAge, Date.now());
    res.cookie(cookieName, token, cookieOptions).json({ email: admin.email, csrf });
  });
  // Login is the only public admin endpoint. New admin routes inherit this guard.
  app.use('/api/admin', auth);
  app.use('/api', (req, res, next) => /^\/admin\/(experience-events\/|content\/(events|team)\/)/.test(req.path) ? next() : smallJson(req, res, next));
  app.get('/api/admin/session', (req, res) => res.json({ email: req.session.email, csrf: req.session.csrf }));
  app.post('/api/admin/logout', (req, res) => { db.prepare('DELETE FROM sessions WHERE token_hash=?').run(req.session.token_hash); res.clearCookie(cookieName, { ...cookieOptions, maxAge: undefined }).json({ ok: true }); });
  app.get('/api/admin/site', (_req, res) => res.json(getSite(db, true)));
  app.get('/api/admin/event-photos/:id', (req, res) => {
    const photo = db.prepare('SELECT mime,data FROM event_photos WHERE id=?').get(req.params.id);
    if (!photo) return res.status(404).json({ error: 'Photo not found.' });
    res.type(photo.mime).send(Buffer.from(photo.data));
  });
  app.put('/api/admin/experience-events/:id', limiter(20, 60_000), express.json({ limit: '9mb' }), async (req, res) => {
    const id = z.uuid().parse(req.params.id);
    const { event, photos } = z.object({ event: eventSchema, photos: z.array(photoSchema).max(20).default([]) }).parse(req.body);
    const images = await decodePhotos(photos);
    const existing = getSite(db, true).events.find(item => item.id === id);
    // A retried request cannot create duplicate events or duplicate photo blobs.
    if (existing) return res.json(existing);
    const stations = createEventStations(getSite(db, true).events.map(event => ({ ...event, published: true })));
    const occupied = stationPlanner.forEvents(stations.map(station => station.event)).filter(Boolean);
    const placement = stationPlanner.next(occupied);
    if (!placement) return res.status(409).json({ error: 'The track has no safe space for another station. Remove an unused event in the control room before adding one.' });
    const saved = { id, ...event, published: true, trackPosition: placement.distance / experienceTrack.getLength() };
    db.exec('BEGIN IMMEDIATE');
    try {
      const position = db.prepare("SELECT COALESCE(MAX(position),-1)+1 AS n FROM content WHERE kind='events'").get().n;
      db.prepare("INSERT INTO content(kind,id,body,position) VALUES('events',?,?,?)").run(id, JSON.stringify(saved), position);
      const insert = db.prepare('INSERT INTO event_photos(id,event_id,name,mime,data,position) VALUES(?,?,?,?,?,?)');
      images.forEach((photo, index) => insert.run(photo.id, id, photo.name, photo.mime, photo.data, index));
      db.exec('COMMIT');
    } catch (error) { db.exec('ROLLBACK'); throw error; }
    res.status(201).json(getSite(db).events.find(item => item.id === id));
  });
  app.put('/api/admin/settings', (req, res) => {
    const data = settingsSchema.parse(req.body);
    if (data.recruitmentOpen && data.recruitmentDeadline && new Date(data.recruitmentDeadline).getTime() <= Date.now()) return res.status(400).json({ error: 'Choose a future deadline before opening recruitment.' });
    db.prepare('UPDATE settings SET body=? WHERE id=1').run(JSON.stringify(data)); res.json(data);
  });
  const schemas = { events: eventSchema, projects: projectSchema, team: memberSchema };
  const albumJson = express.json({ limit: '9mb' }), portraitJson = express.json({ limit: '1mb' });
  app.put('/api/admin/content/:kind/:id', limiter(30, 60_000), (req, res, next) => req.params.kind === 'events' ? albumJson(req, res, next) : req.params.kind === 'team' ? portraitJson(req, res, next) : next(), async (req, res) => {
    const { kind, id } = req.params;
    if (!Object.hasOwn(schemas, kind) || !/^[a-zA-Z0-9_-]{1,80}$/.test(id)) return res.status(400).json({ error: 'Invalid content identifier.' });
    const fields = schemas[kind].parse(req.body);
    const photos = kind === 'events' && req.body.photos !== undefined ? await decodePhotos(z.array(photoSchema).max(20).parse(req.body.photos)) : undefined;
    const portrait = kind === 'team' && req.body.photo !== undefined ? (req.body.photo === null ? null : (await decodePhotos([photoSchema.parse(req.body.photo)]))[0]) : undefined;
    const previous = db.prepare('SELECT body FROM content WHERE kind=? AND id=?').get(kind, id);
    let trackPosition = kind === 'events' && previous ? JSON.parse(previous.body).trackPosition : undefined;
    if (kind === 'events' && !previous) {
      // Reserve a station for dashboard additions, including drafts, so they
      // never replace an archive chapter or collide when later published.
      const stations = createEventStations(getSite(db, true).events.map(event => ({ ...event, published: true })));
      const placement = stationPlanner.next(stationPlanner.forEvents(stations.map(station => station.event)).filter(Boolean));
      if (!placement) return res.status(409).json({ error: 'The track has no safe space for another station. Remove an unused event before adding one.' });
      trackPosition = placement.distance / experienceTrack.getLength();
    }
    // Creation order belongs to the server. Editing a role must not turn an
    // established member into a new foundation block; legacy dates stay absent.
    const createdAt = kind === 'team' ? (previous ? JSON.parse(previous.body).createdAt : new Date().toISOString()) : undefined;
    // Group/role edits retain the member's existing portraits and profile links.
    const profile = kind === 'team' && previous ? JSON.parse(previous.body) : {};
    const data = { ...profile, id, ...fields, ...(trackPosition !== undefined ? { trackPosition } : {}), ...(createdAt !== undefined ? { createdAt } : {}) };
    if (kind === 'events') {
      data.managed = true;
      // An explicit empty album suppresses the static archive fallback too.
      if (photos !== undefined || (previous && JSON.parse(previous.body).photos !== undefined)) data.photos = [];
    }
    if (portrait !== undefined) data.image = portrait ? `/api/member-photos/${portrait.id}` : '';
    const position = db.prepare('SELECT COALESCE(MAX(position),-1)+1 AS n FROM content WHERE kind=?').get(kind).n;
    db.exec('BEGIN IMMEDIATE');
    try {
      db.prepare('INSERT INTO content(kind,id,body,position) VALUES(?,?,?,?) ON CONFLICT(kind,id) DO UPDATE SET body=excluded.body').run(kind, id, JSON.stringify(data), position);
      if (photos !== undefined) {
        db.prepare('DELETE FROM event_photos WHERE event_id=?').run(id);
        const insert = db.prepare('INSERT INTO event_photos(id,event_id,name,mime,data,position) VALUES(?,?,?,?,?,?)');
        photos.forEach((photo, index) => insert.run(photo.id, id, photo.name, photo.mime, photo.data, index));
      }
      if (portrait !== undefined) {
        db.prepare('DELETE FROM member_photos WHERE member_id=?').run(id);
        if (portrait) db.prepare('INSERT INTO member_photos(id,member_id,mime,data) VALUES(?,?,?,?)').run(portrait.id, id, portrait.mime, portrait.data);
      }
      db.exec('COMMIT');
    } catch (error) { db.exec('ROLLBACK'); throw error; }
    res.json(getSite(db, true)[kind].find(item => item.id === id));
  });
  app.delete('/api/admin/content/:kind/:id', (req, res) => {
    if (!Object.hasOwn(schemas, req.params.kind)) return res.status(400).json({ error: 'Invalid content type.' });
    db.prepare('DELETE FROM content WHERE kind=? AND id=?').run(req.params.kind, req.params.id); res.json({ ok: true });
  });
  app.get('/api/admin/applications', (req, res) => {
    const cursor = z.coerce.number().int().nonnegative().default(0).parse(req.query.offset);
    const rows = db.prepare('SELECT * FROM applications ORDER BY created_at DESC LIMIT 100 OFFSET ?').all(cursor);
    res.json({ items: rows.map(applicationRow), total: db.prepare('SELECT COUNT(*) AS n FROM applications').get().n });
  });
  app.patch('/api/admin/applications/:id', (req, res) => {
    const { status } = z.object({ status: z.enum(['new', 'reviewing', 'accepted', 'declined']) }).parse(req.body);
    const result = db.prepare('UPDATE applications SET status=? WHERE id=?').run(status, req.params.id);
    if (!result.changes) return res.status(404).json({ error: 'Application not found.' });
    res.json({ ok: true });
  });
  app.delete('/api/admin/applications/:id', (req, res) => { db.prepare('DELETE FROM applications WHERE id=?').run(req.params.id); res.json({ ok: true }); });
  app.post('/api/applications', limiter(5, 60 * 60_000), (req, res) => {
    const settings = getSite(db).settings;
    if (!settings.recruitmentOpen) return res.status(409).json({ error: 'Recruitment is currently closed. Follow Nucleus for the next intake.' });
    const input = applicationSchema.parse(req.body), id = randomUUID();
    try {
      db.prepare('INSERT INTO applications(id,name,email,year,domain,motivation,portfolio,linkedin,github,leetcode,cycle,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').run(id, input.name, input.email, input.year, input.domain, input.motivation, input.portfolio, input.linkedin, input.github, input.leetcode, settings.cycle, new Date().toISOString());
    } catch (error) {
      if (String(error.message).includes('UNIQUE')) return res.status(409).json({ error: 'An application with this email already exists for this intake. Contact the club if you need to update it.' });
      throw error;
    }
    res.status(201).json({ id, message: 'Your application has been received. Keep your reference number for follow-up.' });
  });
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Endpoint not found.' }));
  app.use((error, _req, res, _next) => {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.issues.map(i => `${i.path.join('.') || 'Form'}: ${i.message}`).join('; ') });
    if (error.type === 'entity.too.large') return res.status(413).json({ error: 'The submitted form is too large.' });
    if (error instanceof SyntaxError && error.status === 400) return res.status(400).json({ error: 'Invalid JSON.' });
    console.error('Request failed:', error.message); res.status(500).json({ error: 'Something went wrong. Please try again.' });
  });
  if (existsSync(resolve(dist, 'index.html'))) {
    const template = readFileSync(resolve(dist, 'index.html'), 'utf8');
    const manifestPath = resolve(dist, '.vite/manifest.json');
    const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : null;
    app.use('/assets', express.static(resolve(dist, 'assets'), { immutable: true, maxAge: '1y' }));
    app.use(express.static(dist, { 
      index: false, 
      maxAge: '1h',
      setHeaders: (res, path) => {
        if (/\.(avif|webp|png|jpg|jpeg|svg|woff2?|ttf|ico)$/.test(path)) {
          res.set('Cache-Control', 'public, max-age=31536000, immutable');
        }
      }
    }));
    app.use((req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') return next();
      if (req.path.startsWith('/api') || req.path.startsWith('/assets')) return next();
      const meta = pageMeta(req.path);
      const admin = /^\/admin(?:\/|$)/.test(req.path);
      if (!meta.found && !admin) return next();
      const escape = value => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
      let html = template.replace(/<title>[^<]*<\/title>/, () => `<title>${escape(meta.title)}</title>`)
        .replace(/(<link rel="canonical" href=")[^"]*("\s*\/?>)/, (_match, start, end) => start + escape(meta.canonical) + end)
        .replace(/(<meta (?:name|property)="(description|og:title|og:description|og:url|twitter:title|twitter:description)" content=")[^"]*("\s*\/?>)/g,
          (_match, start, name, end) => start + escape(name.endsWith('title') ? meta.title : name === 'og:url' ? meta.canonical : meta.description) + end)
        .replace('</head>', `<meta name="robots" content="${meta.robots}"></head>`);
      if (!admin && render) {
        // Route CSS is split from the homepage bundle. Include it in SSR too,
        // so direct requests paint correctly before the client module arrives.
        if (manifest) {
          const styles = new Set(), visited = new Set();
          const collect = key => {
            if (!key || visited.has(key)) return;
            visited.add(key);
            const chunk = manifest[key];
            chunk?.css?.forEach(file => styles.add(file));
            chunk?.imports?.forEach(collect);
          };
          const entry = routeAssets[req.path.replace(/\/$/, '')];
          const name = entry?.split('/').pop().replace('.tsx', '');
          // Rollup may merge a dynamic entry with a shared module and key it by
          // chunk name instead of source path; its logical name stays available.
          if (entry) collect(manifest[entry] ? entry : Object.keys(manifest).find(key => manifest[key].name === name && manifest[key].isDynamicEntry));
          html = html.replace('</head>', [...styles].filter(file => !html.includes(`/${file}`)).map(file => `<link rel="stylesheet" href="/${file}">`).join('') + '</head>');
        }
        const data = getSite(db);
        const safeData = JSON.stringify(data).replace(/</g, '\\u003c');
        // Keep collected component styles in the head, outside the hydrated root.
        const markup = render(data, req.originalUrl).replace(/<style data-styled[\s\S]*?<\/style>/g, style => {
          html = html.replace('</head>', () => `${style}</head>`); return '';
        });
        html = html.replace(/<div id="root">[\s\S]*?<\/div>\s*<\/div>/, () => `<div id="root">${markup}</div><script id="nucleus-data" type="application/json">${safeData}</script>`);
        const organization = { '@context': 'https://schema.org', '@type': 'Organization', name: 'Nucleus SJEC', url: origin || 'https://nucleussjec.in', logo: `${origin || 'https://nucleussjec.in'}/brain-mark.svg`, email: data.settings.contactEmail, sameAs: [data.settings.instagramUrl, data.settings.githubUrl, data.settings.linkedinUrl].filter(Boolean), parentOrganization: { '@type': 'CollegeOrUniversity', name: 'St. Joseph Engineering College', address: { '@type': 'PostalAddress', addressLocality: 'Mangaluru', addressCountry: 'IN' } } };
        html = html.replace('</head>', () => `<script type="application/ld+json">${JSON.stringify(organization).replace(/</g, '\\u003c')}</script></head>`);
      }
      res.set('Cache-Control', 'no-cache').type('html').send(html);
    });
    app.use((_req, res) => res.status(404).type('html').send('<h1>Page not found</h1><a href="/">Return to Nucleus</a>'));
  }
  return app;
}
