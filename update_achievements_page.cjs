const fs = require('fs');
let code = fs.readFileSync('admin/src/pages/AchievementsPage.tsx', 'utf8');

if (!code.includes('useAuth')) {
  code = code.replace(
    `import { Plus, Pencil, Trash2, Trophy, Search, X } from 'lucide-react'`,
    `import { Plus, Pencil, Trash2, Trophy, Search, X, UploadCloud } from 'lucide-react'`
  );
  code = code.replace(
    `deleteAchievement,`,
    `deleteAchievement, uploadAchievementPhoto,`
  );
  code = code.replace(
    `import type { TeamMember } from '../lib/database.types'`,
    `import type { TeamMember } from '../lib/database.types'\nimport { useAuth } from '../auth/AuthContext'`
  );
}

if (!code.includes('const { user } = useAuth()')) {
  code = code.replace(
    `const [message, setMessage] = useState('')`,
    `const [message, setMessage] = useState('')\n  const { user } = useAuth()\n  const [newPhotos, setNewPhotos] = useState<File[]>([])`
  );
}

if (!code.includes('setNewPhotos([])')) {
  code = code.replace(
    `setActionError('')\n    setEditor(`,
    `setActionError('')\n    setNewPhotos([])\n    setEditor(`
  );
}

if (!code.includes('photos: []')) {
  code = code.replace(
    `href: '',`,
    `href: '',\n          photos: [],`
  );
}

if (!code.includes('photos: achievement.photos')) {
  code = code.replace(
    `href: achievement.href?.trim() || null,`,
    `href: achievement.href?.trim() || null,\n        photos: achievement.photos || [],`
  );
}

if (!code.includes('uploadAchievementPhoto(file, user!.id)')) {
  // Update handleSave logic
  const saveBlock = `      if (!input.title || !input.result || !input.year)
        throw new Error('Enter a title, result, and year.')`;
        
  const newSaveBlock = `      if (!input.title || !input.result || !input.year)
        throw new Error('Enter a title, result, and year.')
      
      const uploadedUrls: string[] = []
      for (const file of newPhotos) {
        const url = await uploadAchievementPhoto(file, user!.id)
        uploadedUrls.push(url)
      }
      input.photos = [...(input.photos || []), ...uploadedUrls]`;
      
  code = code.replace(saveBlock, newSaveBlock);
}

// Add UI for photo upload
const photoUI = `              <fieldset className="member-picker">
                <legend>Photos</legend>
                <div className="event-photo-grid">
                  {editor.achievement.photos?.map((url, i) => (
                    <div key={url} className="event-photo-thumb">
                      <img src={url} alt="Achievement" />
                      <button
                        type="button"
                        aria-label="Remove photo"
                        onClick={() => {
                          const p = [...editor.achievement.photos!];
                          p.splice(i, 1);
                          setEditor({ ...editor, achievement: { ...editor.achievement, photos: p }});
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {newPhotos.map((f, i) => (
                    <div key={f.name + i} className="event-photo-thumb">
                      <img src={URL.createObjectURL(f)} alt="New upload" />
                      <button
                        type="button"
                        aria-label="Remove new photo"
                        onClick={() => setNewPhotos(newPhotos.filter((_, index) => index !== i))}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <label className="upload-zone event-photo-upload" style={{ minHeight: '80px', flex: 1, padding: '10px' }}>
                    <input
                      type="file"
                      multiple
                      accept="image/png, image/webp, image/avif, image/jpeg"
                      onChange={e => {
                        if (e.target.files) setNewPhotos([...newPhotos, ...Array.from(e.target.files)]);
                      }}
                      disabled={saving}
                    />
                    <UploadCloud size={20} style={{margin: '0 auto'}} />
                    <span style={{fontSize: '12px'}}>Add photos</span>
                  </label>
                </div>
              </fieldset>`;

if (!code.includes('<legend>Photos</legend>')) {
  code = code.replace(
    '<fieldset className="member-picker">',
    photoUI + '\n              <fieldset className="member-picker">'
  );
}

fs.writeFileSync('admin/src/pages/AchievementsPage.tsx', code);
console.log('Modified AchievementsPage.tsx');
