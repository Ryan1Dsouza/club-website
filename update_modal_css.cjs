const fs = require('fs');
let code = fs.readFileSync('src/pages/events-page.css', 'utf8');

// Find everything from .container-inner { to the end of .cancel:hover { ... }
const startIndex = code.indexOf('.container-inner {');
const endIndexStr = '.container-inner .buttons .cancel:hover {';
const endIndex = code.indexOf('}', code.indexOf(endIndexStr)) + 1;

if (startIndex !== -1 && endIndex !== -1) {
  const newCss = `.container-inner {
    background: var(--surface);
    box-sizing: border-box;
    border-radius: 16px;
    border: 1px solid var(--line-strong);
    box-shadow: 0 20px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05);
    padding: 32px 28px;
    width: 360px;
  }
  .container-inner .content {
    font-family: "Space Grotesk", sans-serif;
  }
  .container-inner .content h2 {
    margin: 0;
    color: var(--fg);
    font-size: 22px;
    font-weight: 500;
    text-align: center;
    letter-spacing: -0.01em;
    line-height: 1.3;
  }
  .container-inner .buttons {
    margin-top: 32px;
    display: flex;
    justify-content: center;
    gap: 12px;
  }
  .container-inner .buttons button {
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-size: 15px;
    font-weight: 500;
    padding-inline: 20px;
    padding-block: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s ease;
  }
  .container-inner .buttons .confirm {
    background: var(--mint);
    color: var(--bg);
  }
  .container-inner .buttons .confirm:hover {
    background: #4cc273;
    box-shadow: 0 4px 12px rgba(80,200,120,0.2);
    transform: translateY(-1px);
  }
  .container-inner .buttons .cancel {
    background: var(--surface-raised);
    color: var(--fg);
    border: 1px solid var(--line-strong);
  }
  .container-inner .buttons .cancel:hover {
    background: var(--line-strong);
    border-color: var(--muted);
  }`;
  
  code = code.slice(0, startIndex) + newCss + code.slice(endIndex);
  fs.writeFileSync('src/pages/events-page.css', code);
  console.log('Successfully replaced modal css!');
} else {
  console.log('Could not find indices');
}
