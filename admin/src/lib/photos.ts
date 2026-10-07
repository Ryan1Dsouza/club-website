export const MAX_PHOTO_BYTES = 5 * 1024 * 1024
const photoTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

export async function preparePhoto(file: File): Promise<Blob> {
  if (!photoTypes.includes(file.type)) throw new Error('Choose a JPG, PNG, WebP, or AVIF image.')
  if (!file.size || file.size > MAX_PHOTO_BYTES)
    throw new Error('Choose an image smaller than 5 MB.')
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    throw new Error('This image could not be opened. Please choose another photo.')
  }
  try {
    if (bitmap.width * bitmap.height > 32_000_000 || bitmap.width > 8000 || bitmap.height > 8000)
      throw new Error(
        'This image is too large. Use a photo up to 8,000 pixels per side and 32 megapixels.',
      )
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Your browser could not prepare this photo.')
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    // Re-encode decoded pixels, discarding metadata and avoiding active image formats.
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Unable to prepare this photo.'))),
        'image/webp',
        0.88,
      ),
    )
  } finally {
    bitmap.close()
  }
}
