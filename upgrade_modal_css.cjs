const fs = require('fs');
let code = fs.readFileSync('src/pages/events-page.css', 'utf8');

const startIndex = code.indexOf('.container-inner {');
const endIndexStr = '.container-inner .buttons .cancel:hover {';
const endIndex = code.indexOf('}', code.indexOf(endIndexStr)) + 1;

if (startIndex !== -1 && endIndex !== -1) {
  const newCss = `.container-inner {
    background: linear-gradient(145deg, var(--surface-raised), var(--surface));
    box-sizing: border-box;
    border-radius: 24px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 30px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 40px rgba(80, 200, 120, 0.05);
    padding: 36px 32px;
    width: 380px;
    position: relative;
    overflow: hidden;
  }
  .container-inner::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(80, 200, 120, 0.5), transparent);
  }
  .container-inner .content {
    font-family: "Space Grotesk", sans-serif;
  }
  .container-inner .content h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    text-align: center;
    letter-spacing: -0.02em;
    line-height: 1.4;
    background: linear-gradient(135deg, #fff 20%, var(--mint) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .container-inner .buttons {
    margin-top: 36px;
    display: flex;
    justify-content: center;
    gap: 16px;
  }
  .container-inner .buttons button {
    border-radius: 12px;
    border: none;
    cursor: pointer;
    font-size: 15px;
    font-weight: 600;
    padding-inline: 22px;
    padding-block: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .container-inner .buttons .confirm {
    background: var(--mint);
    color: var(--bg);
    box-shadow: 0 4px 14px rgba(80, 200, 120, 0.2);
  }
  .container-inner .buttons .confirm:hover {
    background: #50d884;
    box-shadow: 0 6px 20px rgba(80, 200, 120, 0.3);
    transform: translateY(-2px);
  }
  .container-inner .buttons .cancel {
    background: rgba(255, 255, 255, 0.03);
    color: var(--muted);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  .container-inner .buttons .cancel:hover {
    background: rgba(255, 255, 255, 0.08);
    color: var(--fg);
    border-color: rgba(255, 255, 255, 0.2);
  }`;
  
  code = code.slice(0, startIndex) + newCss + code.slice(endIndex);
  fs.writeFileSync('src/pages/events-page.css', code);
  console.log('Successfully upgraded modal css!');
} else {
  console.log('Could not find indices');
}
