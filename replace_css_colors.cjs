const fs = require('fs');
let code = fs.readFileSync('src/pages/events-page.css', 'utf8');

const startStr = '.container-inner {';
const endStr = '.container-inner .buttons .cancel:hover';

let startIndex = code.indexOf(startStr);
let endIndex = code.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  endIndex = code.indexOf('}', endIndex) + 1; // find the closing brace of the last block
  
  const replacement = `.container-inner {
  background: var(--surface);
  box-sizing: border-box;
  border-radius: 30px;
  box-shadow: 5px 6px 0px -2px #000, -6px 5px 0px -2px #000,
    0px -2px 0px 2px var(--mint), 0px 10px 0px 0px #000,
    0px -10px 0px 1px var(--mint), 0px 0px 180px 90px rgba(80,200,120,0.06);
  padding: 20px;
  width: 330px;
}
.container-inner .content {
  background: radial-gradient(var(--surface-raised), var(--surface));
  border-radius: 20px 18px 20px 18px;
  box-shadow: 0px 0px 0px 6px #030d08, 0px 0px 8px 6px #000,
    inset 0px 0px 15px 0px #000, 6px 6px 1px 1px var(--mint),
    -6px 6px 1px 1px var(--mint);
  font-family: "Space Grotesk", sans-serif;
  padding: 25px;
}
.container-inner .content h2 {
  margin: 0;
  color: var(--mint);
  font-size: 26px;
  font-weight: 600;
  text-align: center;
}
.container-inner .buttons {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  gap: 30px;
}
.container-inner .buttons button {
  border-radius: 20px;
  border: 2px solid var(--mint);
  color: var(--bg);
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  padding-inline: 18px;
  padding-block: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.container-inner .buttons .confirm {
  background: linear-gradient(to bottom, var(--mint), #1e7d44);
  box-shadow: 0px 0px 0px 4px #030d08, 0px 2px 0px 3px var(--mint);
}
.container-inner .buttons .confirm:hover {
  box-shadow: 0px 0px 0px 4px #030d08, 0px 2px 0px 3px var(--mint),
    inset 2px 2px 10px 3px #13522c;
}
.container-inner .buttons .cancel {
  background: linear-gradient(to bottom, var(--surface-raised), var(--surface));
  box-shadow: 0px 0px 0px 4px #030d08, 0px 2px 0px 3px var(--line-strong);
  border-color: var(--line-strong);
  color: var(--muted);
}
.container-inner .buttons .cancel:hover {
  box-shadow: 0px 0px 0px 4px #030d08, 0px 2px 0px 3px var(--line-strong),
    inset 2px 2px 10px 3px #000;
  color: var(--mint);
  border-color: var(--mint);
}`;

  code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
  fs.writeFileSync('src/pages/events-page.css', code);
  console.log('Successfully updated color palette!');
} else {
  console.log('Could not find start or end string', startIndex, endIndex);
}
