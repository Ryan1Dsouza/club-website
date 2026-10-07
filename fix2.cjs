const fs = require('fs');
const file = 'src/components/achievements/AchievementCard.tsx';
let lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
lines[98] = '              <span className={`ach-honours__symbol ach-honours__symbol--${record.category === \\\'Hackathons\\\' ? \\\'award\\\' : record.category === \\\'Open source\\\' ? \\\'code\\\' : record.category === \\\'Research\\\' ? \\\'research\\\' : \\\'rank\\\'}`} aria-hidden="true">';
lines[109] = '        <button type="button" className="ach-record__open" style={{ transform: "translateZ(60px)" }} aria-label={`View ${profile.member.name}\\\'s achievements`} aria-haspopup="dialog">';
fs.writeFileSync(file, lines.join('\n'));
