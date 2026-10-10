const fs = require('fs');
let code = fs.readFileSync('src/pages/PeoplePage.tsx', 'utf8');

const oldStructure = `      <div className="people-intro">
        <div className="people-groups" role="group" aria-label="Browse the community" style={{ margin: 0, padding: 0, border: 'none' }}>
          <div>{(['member', 'alumni'] as const).map(option => <button key={option} type="button" aria-pressed={group === option} aria-controls="people-roster"
            onClick={() => setGroup(option)}>{option === 'member' ? 'Members' : 'Alumni'}<ArrowUpRight size={16} /></button>)}</div>
        </div>

      </div>
      <section ref={roster} id="people-roster" className="people-directory__roster" aria-labelledby="people-roster-title" tabIndex={-1}>
        <div className="people-directory__heading">
          <h2 id="people-roster-title">{group === 'member' ? 'The minds behind it.' : 'Always part of the nucleus.'}</h2>

        </div>`;

const newStructure = `      <div className="people-intro" style={{ display: 'block', paddingBlock: '0 24px' }}>
        <h2 id="people-roster-title" style={{ fontSize: 'clamp(32px, 5vw, 56px)', marginBottom: '24px', fontWeight: 500, lineHeight: 1.1 }}>
          {group === 'member' ? 'The minds behind it.' : 'Always part of the nucleus.'}
        </h2>
        <div className="people-groups" role="group" aria-label="Browse the community" style={{ margin: 0, padding: 0, border: 'none', justifyContent: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '12px' }}>{(['member', 'alumni'] as const).map(option => <button key={option} type="button" aria-pressed={group === option} aria-controls="people-roster"
            onClick={() => setGroup(option)}>{option === 'member' ? 'Members' : 'Alumni'}<ArrowUpRight size={16} /></button>)}</div>
        </div>

      </div>
      <section ref={roster} id="people-roster" className="people-directory__roster" aria-labelledby="people-roster-title" tabIndex={-1} style={{ paddingTop: '16px' }}>`;

if (code.includes(oldStructure)) {
  code = code.replace(oldStructure, newStructure);
  fs.writeFileSync('src/pages/PeoplePage.tsx', code);
  console.log('Fixed DOM structure in PeoplePage');
} else {
  // Try CRLF replacement
  const oldStructureCRLF = oldStructure.replace(/\n/g, '\r\n');
  if (code.includes(oldStructureCRLF)) {
    code = code.replace(oldStructureCRLF, newStructure);
    fs.writeFileSync('src/pages/PeoplePage.tsx', code);
    console.log('Fixed DOM structure in PeoplePage (CRLF)');
  } else {
    console.log('Failed to find structure');
  }
}
