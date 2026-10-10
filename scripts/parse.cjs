const fs = require('fs');
const data = JSON.parse(fs.readFileSync('tmp/network-data.json'));

// In old site, it might be in the JSON data responses or RSC
const search = JSON.stringify(data);

const teams = [];

// Try to extract object structures
const regex = /\{[^{}]*\"name\":\"([^\"]+)\"[^{}]*\}/g;
const matches = [...search.matchAll(regex)];

for (const m of matches) {
  try {
    const obj = JSON.parse(m[0].replace(/\\\"/g, '"').replace(/\\\\/g, '\\'));
    if (obj.role && obj.name) {
      teams.push(obj);
    }
  } catch (e) {
    // Sometimes it's malformed due to regex
    const name = m[1];
    let quote = search.match(new RegExp(`\"name\":\"${name}\".*?\"quote\":\"([^\"]+)\"`))?.[1] || '';
    let linkedin = search.match(new RegExp(`\"name\":\"${name}\".*?\"linkedin\":\"([^\"]+)\"`))?.[1] || '';
    let github = search.match(new RegExp(`\"name\":\"${name}\".*?\"github\":\"([^\"]+)\"`))?.[1] || '';
    teams.push({ name, quote, linkedin, github });
  }
}

// deduplicate
const unique = [];
for (const t of teams) {
  if (!unique.find(u => u.name === t.name)) unique.push(t);
}

fs.writeFileSync('tmp/parsed-teams.json', JSON.stringify(unique, null, 2));
