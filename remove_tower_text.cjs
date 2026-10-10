const fs = require('fs');

let towerStr = fs.readFileSync('src/lib/people-tower.ts', 'utf8');
towerStr = towerStr.replace('<span>NUCLEUS / SJEC</span>', '<span></span>');
towerStr = towerStr.replace('<span>The people / Nucleus</span>', '<span></span>');
towerStr = towerStr.replace('<span>Keep scrolling ↗</span>', '<span></span>');
fs.writeFileSync('src/lib/people-tower.ts', towerStr);

let blocksStr = fs.readFileSync('src/lib/people-tower-blocks.ts', 'utf8');
blocksStr = blocksStr.replace("ctx.fillText('NUCLEUS / SJEC', 38, 56);", "");
fs.writeFileSync('src/lib/people-tower-blocks.ts', blocksStr);

console.log('Removed text from people-tower files');
