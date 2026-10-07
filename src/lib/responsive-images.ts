/** Request display-sized variants of public Supabase images, keeping the source
 * as the fallback. The original image and its aspect ratio are preserved. */
export function storageImageAttributes(source: string | undefined, widths: readonly number[], sizes: string) {
  if (!source) return {};
  try {
    const url = new URL(source);
    if (url.protocol !== 'https:' || !url.hostname.endsWith('.supabase.co') || !url.pathname.startsWith('/storage/v1/object/public/')) return {};
    url.pathname = url.pathname.replace('/object/public/', '/render/image/public/');
    url.searchParams.set('quality', '85');
    url.searchParams.set('resize', 'contain');
    return {
      srcSet: widths.map(width => { url.searchParams.set('width', String(width)); return `${url.href} ${width}w`; }).join(', '),
      sizes,
    };
  } catch { return {}; }
}

/** If transformations are unavailable, retry the original exactly once. */
export function restoreOriginalImage(image: HTMLImageElement) {
  if (!image.srcset) return false;
  image.removeAttribute('srcset');
  image.removeAttribute('sizes');
  return true;
}
