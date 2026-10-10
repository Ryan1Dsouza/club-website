const fs = require('fs');
let code = fs.readFileSync('admin/src/lib/achievements.ts', 'utf8');

if (!code.includes('uploadAchievementPhoto')) {
  code += `\n
export async function uploadAchievementPhoto(file: Blob, userId: string): Promise<string> {
  const extension = file.type === 'image/webp' ? 'webp' : file.type === 'image/avif' ? 'avif' : 'png'
  const path = \`\${userId}/\${crypto.randomUUID()}.\${extension}\`
  
  const { error: uploadError } = await getSupabase().storage
    .from('event-photos')
    .upload(path, file, { contentType: file.type, cacheControl: '31536000', upsert: false })
    
  if (uploadError) throw new Error('The photo could not be uploaded.')
  
  const { data: { publicUrl } } = getSupabase().storage.from('event-photos').getPublicUrl(path)
  return publicUrl
}\n`;

  fs.writeFileSync('admin/src/lib/achievements.ts', code);
}
