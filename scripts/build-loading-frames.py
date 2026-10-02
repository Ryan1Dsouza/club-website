"""Build palette-independent loader masks with the official Nucleus favicon.

Usage: python scripts/build-loading-frames.py path/to/reference-frames
The input is frame-00.webp through frame-16.webp. See docs/loading-screen.md.
Requires Pillow and the project's Playwright Chromium installation.
"""

from io import BytesIO
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw


source = Path(sys.argv[1])
root = Path(__file__).resolve().parents[1]
destination = root / "src/assets/loading"
destination.mkdir(parents=True, exist_ok=True)

# Rasterize the same SVG paths used by the browser tab. No tracing or alternate
# hand-drawn logo: the frame masks retain the official mark's internal openings.
render_logo = """
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
const svg = await readFile(process.argv[1], 'utf8');
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } });
  await page.setContent(`<style>html,body{margin:0;width:100%;height:100%}svg{display:block;width:100%;height:100%}</style>${svg}`);
  process.stdout.write(await page.screenshot({ type: 'png', omitBackground: true }));
} finally { await browser.close(); }
"""
logo_png = subprocess.check_output(
    ["node", "--input-type=module", "-e", render_logo, str(root / "public/favicon.svg")],
    cwd=root,
)
logo_alpha = Image.open(BytesIO(logo_png)).getchannel("A")
logo_alpha = logo_alpha.crop(logo_alpha.getbbox())


def nucleus_word(draw):
    # Hand-lettered NUCLEUS, replacing the reference's name in frame 06.
    letters = [
        [(0, 43), (2, 0), (24, 43), (28, -2)],
        [(0, 1), (0, 34), (5, 44), (19, 43), (25, 32), (28, 0)],
        [(28, 5), (17, 0), (4, 6), (0, 26), (6, 41), (21, 43), (29, 36)],
        [(2, 0), (0, 43), (28, 41)],
        [(28, 0), (2, 1), (0, 43), (29, 41)],
        [(0, 0), (0, 33), (6, 43), (21, 42), (28, 30), (29, -1)],
        [(28, 3), (16, 0), (3, 5), (0, 16), (22, 26), (28, 36), (17, 44), (0, 41)],
    ]
    for index, points in enumerate(letters):
        x, y = 1310 + index * 42, 775 + [0, 2, -2, 1, 3, -1, 0][index]
        draw.line([(x + px, y + py) for px, py in points], fill=255, width=6, joint="curve")
        if index == 4:
            draw.line([(x + 2, y + 22), (x + 22, y + 20)], fill=255, width=5)


def nucleus_logo(alpha, cx, cy, radius):
    width = radius * 2
    height = round(width * logo_alpha.height / logo_alpha.width)
    mark = logo_alpha.resize((width, height), Image.Resampling.LANCZOS)
    alpha.paste(mark, (round(cx - width / 2), round(cy - height / 2)))


for index in range(17):
    original = Image.open(source / f"frame-{index:02}.webp").convert("RGBA")
    alpha = original.getchannel("A")
    draw = ImageDraw.Draw(alpha)
    if index == 6:
        draw.rectangle((1292, 758, 1608, 844), fill=0)
        # Restore the fine oval passing behind the lettering.
        draw.line([(1292, 801), (1608, 808)], fill=220, width=2)
        nucleus_word(draw)
    for frame, bounds, center, radius in [
        (7, (1305, 713, 1563, 905), (1437, 807), 84),
        (12, (1317, 735, 1562, 906), (1438, 820), 75),
        (14, (1935, 596, 2132, 758), (2032, 677), 67),
    ]:
        if index == frame:
            draw.rectangle(bounds, fill=0)
            nucleus_logo(alpha, *center, radius)
    # Half-resolution masks preserve the scanned strokes and cut decoded memory
    # from ~317 MB to ~80 MB for the complete 17-frame sequence.
    size = (1440, round(original.height / 2))
    alpha = alpha.resize(size, Image.Resampling.LANCZOS)
    mask = Image.new("RGBA", size, (255, 255, 255, 0))
    mask.putalpha(alpha)
    mask.save(destination / f"frame-{index:02}.webp", lossless=True, method=6)

print(f"Built 17 masks: {sum(p.stat().st_size for p in destination.glob('*.webp')):,} bytes")
