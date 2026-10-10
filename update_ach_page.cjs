const fs = require('fs');
let code = fs.readFileSync('src/pages/AchievementsPage.tsx', 'utf8');

const anchor = '<h3>{record.title}</h3><span className="ach-detail__result">{record.result}</span>{record.description && \\n<p>{record.description}</p>}';
// Actually, let's just insert it before the closing section tag.
const findStr = '          </section>)}</div>';
const replacement = `            {record.photos && record.photos.length > 0 && (
              <div className="ach-detail__photos" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px', marginBottom: '16px' }}>
                {record.photos.map(photoUrl => (
                  <img key={photoUrl} src={photoUrl} alt="Achievement highlight" style={{ width: '100%', maxWidth: '300px', borderRadius: '8px', border: '1px solid var(--line-strong)', objectFit: 'cover' }} />
                ))}
              </div>
            )}
          </section>)}</div>`;

if (code.includes('</section>)}</div>')) {
  code = code.replace('</section>)}</div>', replacement);
  fs.writeFileSync('src/pages/AchievementsPage.tsx', code);
  console.log('Updated AchievementsPage.tsx');
} else {
  console.log('Target string not found');
}
