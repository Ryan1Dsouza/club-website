const fs = require('fs');
let lines = fs.readFileSync('src/pages/EventsPage.tsx', 'utf8').split('\n');

const replacement = `    {portal !== null && <dialog ref={dialog} className="events-portal-dialog" aria-labelledby="portal-title" onCancel={event => { event.preventDefault(); setPortal(null); }}>
      <div className="container-inner">
        <div className="content">
          <h2 id="portal-title">Do you want to hop into the Nucleus Ride?</h2>
        </div>
        <div className="buttons">
          <button className="confirm" type="button" onClick={enterRide}>Yes, Let's Go<ArrowUpRight size={16} /></button>
          <button className="cancel" type="button" onClick={() => setPortal(null)}>Maybe Later</button>
        </div>
      </div>
    </dialog>}`;

// Search for the dialog block since CRLF split might have left \r in the strings
let startIndex = lines.findIndex(line => line.includes('<dialog ref={dialog} className="events-portal-dialog"'));
let endIndex = lines.findIndex((line, idx) => idx > startIndex && line.includes('</dialog>}'));

if (startIndex !== -1 && endIndex !== -1) {
  lines.splice(startIndex, endIndex - startIndex + 1, replacement);
  fs.writeFileSync('src/pages/EventsPage.tsx', lines.join('\n'));
  console.log('Replaced lines from', startIndex, 'to', endIndex);
} else {
  console.log('Could not find block', startIndex, endIndex);
}
