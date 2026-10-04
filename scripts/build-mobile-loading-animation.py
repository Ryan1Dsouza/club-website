"""Build the mobile loader's portrait composition and native WebP animation.

Run after build-loading-frames.py: python scripts/build-mobile-loading-animation.py
Requires Pillow with animated WebP support. No runtime image processing is needed.
"""

from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[1]
source = root / 'src/assets/loading'
destination = source / 'mobile'
destination.mkdir(exist_ok=True)
size = (480, 600)
frames = []

# Keep the subject and its annotations. Long, decorative curves can run to the
# edge of the phone composition; the wordmark and brain marks stay fully inside.
focus = {
    0: (350, 0, 1190, 810),
    3: (475, 140, 1330, 810),
    4: (475, 0, 1295, 810),
    8: (475, 100, 1335, 810),
    10: (325, 0, 1225, 810),
    11: (95, 175, 1035, 710),
}
for index in range(17):
    alpha = Image.open(source / f'frame-{index:02}.webp').getchannel('A')
    alpha = alpha.crop(focus.get(index, alpha.getbbox()))
    # Trim empty source margins before fitting, instead of shrinking a whole
    # widescreen drawing onto a phone. Leave room around every main subject.
    alpha = ImageOps.contain(alpha, (440, 540), Image.Resampling.LANCZOS)
    # Sixteen alpha levels preserve the scanned strokes without a large download.
    alpha = alpha.point(lambda value: min(255, round(value * 1.25 / 16) * 16))
    frame = Image.new('RGBA', size, (195, 229, 200, 0))
    frame.putalpha(Image.new('L', size))
    frame.paste(Image.new('RGBA', alpha.size, (195, 229, 200, 255)),
                ((size[0] - alpha.width) // 2, (size[1] - alpha.height) // 2), alpha)
    frames.append(frame)

# A complete 850 ms loop in one request; Chrome advances it without a JS clock.
frames[0].save(destination / 'sequence.webp', save_all=True, append_images=frames[1:],
               duration=50, loop=0, lossless=True, method=6, minimize_size=True)
frames[6].save(destination / 'poster.webp', lossless=True, method=6)
print(f"Mobile sequence: {(destination / 'sequence.webp').stat().st_size:,} bytes")
