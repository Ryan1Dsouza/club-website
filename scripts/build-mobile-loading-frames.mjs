import sharp from 'sharp';
import { mkdir, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Keep phone decodes below 16 MB for the whole loop (desktop is about 80 MB).
const source = new URL('../src/assets/loading/', import.meta.url);
const destination = new URL('mobile/', source);
await mkdir(destination, { recursive: true });
for (const name of await readdir(source)) {
  if (!/^frame-\d+\.webp$/.test(name)) continue;
  await sharp(fileURLToPath(new URL(name, source)))
    .resize({ width: 640 })
    .webp({ lossless: true, effort: 6 })
    .toFile(fileURLToPath(new URL(name, destination)));
}
