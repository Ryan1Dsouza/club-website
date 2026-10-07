import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { randomBytes, scrypt, scryptSync, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const deriveKey = promisify(scrypt);
const passwordOptions = { N: 32768, maxmem: 64 * 1024 * 1024 };

export function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  return `scrypt:${salt}:${scryptSync(password, salt, 64, passwordOptions).toString('hex')}`;
}
function passwordParts(stored) {
  if (typeof stored !== 'string' || !/^(scrypt:)?[a-f0-9]{32}:[a-f0-9]{128}$/.test(stored)) return null;
  const modern = stored.startsWith('scrypt:');
  const [salt, key] = (modern ? stored.slice(7) : stored).split(':');
  return { salt, key: Buffer.from(key, 'hex'), options: modern ? passwordOptions : {} };
}
export function verifyPassword(password, stored) {
  const parts = passwordParts(stored);
  return !!parts && timingSafeEqual(scryptSync(password, parts.salt, 64, parts.options), parts.key);
}
export async function verifyPasswordAsync(password, stored) {
  const parts = passwordParts(stored);
  return !!parts && timingSafeEqual(await deriveKey(password, parts.salt, 64, parts.options), parts.key);
}

export function openDatabase(path = process.env.DATABASE_PATH || './data/nucleus.sqlite') {
  if (path !== ':memory:') mkdirSync(dirname(resolve(path)), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS content (kind TEXT NOT NULL, id TEXT NOT NULL, body TEXT NOT NULL, position INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(kind,id));
    CREATE TABLE IF NOT EXISTS event_photos (id TEXT PRIMARY KEY, kind TEXT NOT NULL DEFAULT 'events' CHECK(kind='events'), event_id TEXT NOT NULL, name TEXT NOT NULL, mime TEXT NOT NULL, data BLOB NOT NULL, position INTEGER NOT NULL, FOREIGN KEY(kind,event_id) REFERENCES content(kind,id) ON DELETE CASCADE);
    CREATE INDEX IF NOT EXISTS event_photo_event ON event_photos(event_id,position);
    CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY CHECK(id=1), body TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS admins (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, admin_id TEXT NOT NULL REFERENCES admins(id) ON DELETE CASCADE, csrf TEXT NOT NULL, expires_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS applications (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, year TEXT NOT NULL, domain TEXT NOT NULL CHECK(domain IN ('aiml','web','dsa')), motivation TEXT NOT NULL, portfolio TEXT NOT NULL DEFAULT '', cycle TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new', created_at TEXT NOT NULL, UNIQUE(email,cycle));
    CREATE INDEX IF NOT EXISTS application_date ON applications(created_at DESC);
    CREATE TABLE IF NOT EXISTS schema_version (version INTEGER PRIMARY KEY);
    INSERT OR IGNORE INTO schema_version VALUES(1);`);
  // Additive migrations preserve existing applications and club content.
  db.exec('BEGIN IMMEDIATE');
  try {
    const columns = db.prepare('PRAGMA table_info(applications)').all().map(column => column.name);
    for (const name of ['linkedin', 'github', 'leetcode']) {
      if (!columns.includes(name)) db.exec(`ALTER TABLE applications ADD COLUMN ${name} TEXT NOT NULL DEFAULT ''`);
    }
    if (!db.prepare('PRAGMA table_info(sessions)').all().some(column => column.name === 'last_seen')) {
      db.exec('ALTER TABLE sessions ADD COLUMN last_seen INTEGER NOT NULL DEFAULT 0');
      // Older sessions lack an activity timestamp; require a fresh sign-in.
      db.exec('DELETE FROM sessions');
    }
    db.exec(`CREATE TABLE IF NOT EXISTS member_photos (
      id TEXT PRIMARY KEY, kind TEXT NOT NULL DEFAULT 'team' CHECK(kind='team'), member_id TEXT NOT NULL UNIQUE,
      mime TEXT NOT NULL, data BLOB NOT NULL,
      FOREIGN KEY(kind,member_id) REFERENCES content(kind,id) ON DELETE CASCADE);
      CREATE INDEX IF NOT EXISTS session_expiry ON sessions(expires_at);
      INSERT OR IGNORE INTO schema_version VALUES(2);`);
    db.exec('COMMIT');
  } catch (error) { db.exec('ROLLBACK'); db.close(); throw error; }
  if (!db.prepare('SELECT id FROM settings WHERE id=1').get()) {
    const seed = JSON.parse(readFileSync(new URL('../shared/public-data.json', import.meta.url), 'utf8'));
    db.exec('BEGIN');
    try {
      db.prepare('INSERT INTO settings(id,body) VALUES(1,?)').run(JSON.stringify(seed.settings));
      const insert = db.prepare('INSERT INTO content(kind,id,body,position) VALUES(?,?,?,?)');
      for (const kind of ['events', 'projects', 'team']) seed[kind].forEach((item, index) => insert.run(kind, item.id, JSON.stringify(item), index));
      db.exec('COMMIT');
    } catch (error) { db.exec('ROLLBACK'); throw error; }
  }
  return db;
}

export function getSite(db, admin = false) {
  const site = { settings: JSON.parse(db.prepare('SELECT body FROM settings WHERE id=1').get().body) };
  if (site.settings.recruitmentDeadline && new Date(site.settings.recruitmentDeadline).getTime() < Date.now()) site.settings.recruitmentOpen = false;
  for (const kind of ['events', 'projects', 'team']) {
    site[kind] = db.prepare('SELECT body FROM content WHERE kind=? ORDER BY position,id').all(kind).map(row => JSON.parse(row.body)).filter(item => admin || item.published !== false);
  }
  const photos = db.prepare('SELECT id,event_id,name FROM event_photos ORDER BY position').all();
  site.events.forEach(event => { const selected = photos.filter(photo => photo.event_id === event.id); if (selected.length) event.photos = selected.map(photo => ({ id: photo.id, name: photo.name, url: `/api/event-photos/${photo.id}` })); });
  return site;
}
