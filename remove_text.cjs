const fs = require('fs');
let r = fs.readFileSync('src/pages/Recruitment.tsx', 'utf8');
r = r.replace(/<span className="eyebrow">.*?<\/span>/g, '');
fs.writeFileSync('src/pages/Recruitment.tsx', r);

let e = fs.readFileSync('src/pages/EventsPage.tsx', 'utf8');
e = e.replace('<footer className="events-footer"><span>Open a story. Relive a moment.</span><span>Made of many minds.</span></footer>', '<footer className="events-footer"></footer>');
fs.writeFileSync('src/pages/EventsPage.tsx', e);
console.log('Removed text from both files');
