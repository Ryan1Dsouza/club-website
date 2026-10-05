import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Display-sized WebP files keep full-resolution AVIF decoding out of book turns.
// Originals remain available through each photograph's link.
const root = new URL('../', import.meta.url);
const destination = new URL('public/workshop_images/', root);
await mkdir(destination, { recursive: true });
const files = (await readdir(new URL('workshops/', root), { recursive: true }))
  .filter(path => /\.(avif|webp|jpe?g|png)$/i.test(path)).sort();
const manifest = {};
let originalBytes = 0, displayBytes = 0;
for (const file of files) {
  const path = file.replaceAll('\\', '/');
  const input = await readFile(new URL(`workshops/${path}`, root));
  originalBytes += input.length;
  const hash = createHash('sha256').update(input).update('webp-76-640-1440-v1').digest('hex').slice(0, 10);
  const name = path.replace(/\.[^.]+$/, '').replace(/[^a-z0-9_-]/gi, '-');
  const images = [];
  for (const width of [640, 1440]) {
    const { data, info } = await sharp(input).rotate().resize({ width, withoutEnlargement: true })
      .webp({ quality: 76, effort: 4 }).toBuffer({ resolveWithObject: true });
    const filename = `${name}-${hash}-${width}.webp`;
    await writeFile(new URL(filename, destination), data);
    if (!images.some(image => image.width === info.width)) images.push({ url: `/workshop_images/${filename}`, width: info.width });
    if (width === 1440) displayBytes += data.length;
  }
  const preview = await sharp(input).rotate().resize({ width: 32, height: 32, fit: 'inside' }).webp({ quality: 35 }).toBuffer();
  manifest[`/workshops/${path}`] = { images, preview: `data:image/webp;base64,${preview.toString('base64')}` };
}
await writeFile(fileURLToPath(new URL('src/events/workshop-images.json', root)), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`${files.length} photos: ${(originalBytes / 1e6).toFixed(2)} MB originals → ${(displayBytes / 1e6).toFixed(2)} MB at the largest display size.`);
