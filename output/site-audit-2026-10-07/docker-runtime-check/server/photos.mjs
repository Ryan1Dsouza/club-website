import sharp from 'sharp';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

export const photoSchema = z.object({
  name: z.string().trim().min(1).max(180),
  mime: z.enum(['image/webp', 'image/jpeg', 'image/png']),
  data: z.string().max(700_000).regex(/^[A-Za-z0-9+/]+={0,2}$/),
});

export async function decodePhotos(photos) {
  let bytes = 0;
  const images = [];
  for (const photo of photos) {
    const source = Buffer.from(photo.data, 'base64');
    bytes += source.length;
    if (source.length > 500_000 || bytes > 6_000_000) {
      throw new z.ZodError([{ code: 'custom', path: ['photos'], message: 'Use photos under 500 KB each and 6 MB per album after compression.' }]);
    }
    try {
      const image = sharp(source, { limitInputPixels: 16_000_000, failOn: 'warning' });
      const metadata = await image.metadata();
      if (`image/${metadata.format}` !== photo.mime || (metadata.pages ?? 1) > 1) throw new Error('Unsupported image');
      // Decode and re-encode raster pixels, removing metadata and trailing payloads.
      const data = await image.rotate().resize({ width: 1280, height: 1280, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
      if (data.length > 500_000) throw new Error('Image too large');
      images.push({ id: randomUUID(), name: photo.name, mime: 'image/webp', data });
    } catch {
      throw new z.ZodError([{ code: 'custom', path: ['photos'], message: 'Use a readable JPG, PNG or WebP photo, up to 16 megapixels.' }]);
    }
  }
  return images;
}
