const fs = require('fs');
let code = fs.readFileSync('src/pages/events-page.css', 'utf8');

const start = code.indexOf('.events-portal-dialog { position:fixed;');
const end = code.indexOf('.events-portal-dialog h2 { overflow-wrap:anywhere; }') + '.events-portal-dialog h2 { overflow-wrap:anywhere; }'.length;

const replacement = `.events-portal-dialog { position:fixed; inset:0; margin:auto; width: max-content; overflow: visible; padding: 0; background: transparent; border: none; outline: none; }
.events-portal-dialog::backdrop { background:#000b; backdrop-filter:blur(8px); }
.container-inner {
  background: #a4363e;
  box-sizing: border-box;
  border-radius: 30px;
  box-shadow: 5px 6px 0px -2px #620d15, -6px 5px 0px -2px #620d15,
    0px -2px 0px 2px #ee9191, 0px 10px 0px 0px #610c14,
    0px -10px 0px 1px #e66565, 0px 0px 180px 90px #0d2f66;
  padding: 20px;
  width: 310px;
}
.container-inner .content {
  background: radial-gradient(#fffbf3, #ffe19e);
  border-radius: 20px 18px 20px 18px;
  box-shadow: 0px 0px 0px 6px #5e1e21, 0px 0px 8px 6px #84222b,
    inset 0px 0px 15px 0px #614506, 6px 6px 1px 1px #e66565,
    -6px 6px 1px 1px #e66565;
  font-family: "Skranji", cursive, "Space Grotesk", sans-serif;
  padding: 25px;
}
.container-inner .content h2 {
  margin: 0;
  color: #461417;
  font-size: 30px;
  font-weight: 600;
  text-align: center;
}
.container-inner .buttons {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  gap: 40px;
}
.container-inner .buttons button {
  border-radius: 20px;
  border: 2px solid #49181e;
  color: #fff;
  cursor: pointer;
  font-size: 20px;
  padding-inline: 20px;
  padding-block: 15px;
  text-shadow: 1px 2px 3px #000000;
  display: flex;
  align-items: center;
  gap: 8px;
}
.container-inner .buttons .confirm {
  background: linear-gradient(#ced869, #536d1b);
  box-shadow: 0px 0px 0px 4px #7e1522, 0px 2px 0px 3px #e66565;
}
.container-inner .buttons .confirm:hover {
  box-shadow: 0px 0px 0px 4px #7e1522, 0px 2px 0px 3px #e66565,
    inset 2px 2px 10px 3px #4e6217;
}
.container-inner .buttons .cancel {
  background: linear-gradient(#ea7079, #891a1a);
  box-shadow: 0px 0px 0px 4px #7e1522, 0px 2px 0px 3px #e66565;
}
.container-inner .buttons .cancel:hover {
  box-shadow: 0px 0px 0px 4px #7e1522, 0px 2px 0px 3px #e66565,
    inset 2px 2px 10px 3px #822828;
}`;

if (start !== -1 && end !== -1) {
  code = code.substring(0, start) + replacement + code.substring(end);
  fs.writeFileSync('src/pages/events-page.css', code);
  console.log('done');
} else {
  console.log('Target not found', start, end);
}
