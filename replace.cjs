const fs = require('fs');
let code = fs.readFileSync('src/pages/EventsPage.tsx', 'utf8');

const target = `{portal !== null && <dialog ref={dialog} className="events-portal-dialog" aria-labelledby="portal-title" onCancel={event => { event.preventDefault(); setPortal(null); }}>
        <button className="events-portal-dialog__close" aria-label="Close ride invitation" onClick={() => setPortal(null)}><X size={18} /></button>
        <Orbit size={38} aria-hidden="true" /><p className="events-eyebrow">A different perspective</p>
        <h2 id="portal-title">Do you want to hop into the Nucleus Ride?</h2>
        <p>Seven stations. One journey through Nucleus.</p>
        <div className="events-portal-dialog__actions"><button onClick={enterRide}>Yes, Let's Go<ArrowUpRight size={16} /></button><button onClick={() => setPortal(null)}>Maybe Later</button></div>
      </dialog>}`;

const replacement = `{portal !== null && <dialog ref={dialog} className="events-portal-dialog" aria-labelledby="portal-title" onCancel={event => { event.preventDefault(); setPortal(null); }}>
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

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/EventsPage.tsx', code);
console.log('done');
