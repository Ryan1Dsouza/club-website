import sharp from 'sharp';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Keep the originals for other uses. Regenerate the banner variants whenever
// bundled team photos change: node scripts/build-team-portraits.mjs
const root = new URL('../', import.meta.url);
const site = JSON.parse(await readFile(new URL('shared/public-data.json', root), 'utf8'));
const manifest = JSON.parse(await readFile(new URL('src/lib/team-portraits.json', root), 'utf8'));
await mkdir(new URL('public/team_images/banner/', root), { recursive: true });
for (const member of site.team) {
  if (!member.image?.startsWith('/team_images/core/')) continue;
  const name = member.image.split('/').pop().replace(/\.[^.]+$/, '');
  const variants = {};
  for (const [size, width] of [['small', 480], ['large', 800]]) {
    const path = `/team_images/banner/${name}-${width}.webp`;
    await sharp(await readFile(new URL(`public${member.image}`, root)))
      .rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 65, effort: 5 })
      .toFile(fileURLToPath(new URL(`public${path}`, root)));
    variants[size] = path;
  }
  const preview = await sharp(await readFile(new URL(`public${member.image}`, root)))
    .rotate().resize({ width: 32, height: 40, fit: 'inside' }).webp({ quality: 35 }).toBuffer();
  manifest[member.image] = { ...manifest[member.image], ...variants, preview: `data:image/webp;base64,${preview.toString('base64')}` };
}
await writeFile(new URL('src/lib/team-portraits.json', root), `${JSON.stringify(manifest, null, 2)}\n`);
