const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `    const refresh = () => api<SiteData>('/site', { signal: abort.signal }).then(site => {
      if (!disposed) { setData(site); }
    }).catch(() => { /* Recruitment verifies availability before accepting input. */ });`;

const replacement = `    const refresh = () => Promise.all([
      api<SiteData>('/site', { signal: abort.signal }),
      supabase.from('team_members').select('id, name, role, photo_url, created_at').order('created_at', { ascending: true })
    ]).then(([site, { data, error }]) => {
      if (error) {
        console.error('Failed to load team from Supabase', error);
        if (!disposed) { setData(site); }
        return;
      }
      const team = (data || []).map((member: any) => ({
        id: member.id,
        name: member.name,
        role: member.role,
        image: member.photo_url ?? undefined,
        createdAt: member.created_at,
        initials: member.name.trim().split(/\\s+/).slice(0, 2).map((part: string) => part[0]).join('').toUpperCase(),
      }));
      if (!disposed) { setData({ ...site, team }); }
    }).catch(() => { /* Recruitment verifies availability before accepting input. */ });`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Success");
} else {
    // Try a more flexible regex replace
    code = code.replace(/const refresh = \(\) => api<SiteData>\('\/site', \{ signal: abort\.signal \}\)\.then\(site => \{\s*if \(!disposed\) \{ setData\(site\); \}\s*\}\)\.catch\(\(\) => \{ \/\* Recruitment verifies availability before accepting input\. \*\/ \}\);/g, replacement);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Success with Regex");
}
