"""Build native, compositor-played loader clips from the existing artwork.

Requires Pillow and ffmpeg. Run after build-loading-frames.py.
The silent H.264 clips retain all 17 cuts at 20fps and work with playsInline on iOS.
"""
from pathlib import Path
from tempfile import TemporaryDirectory
import argparse
import subprocess
import re
from PIL import Image, ImageColor, ImageOps

project = Path(__file__).resolve().parents[1]
root = project / 'src/assets/loading'
styles = (project / 'src/styles.css').read_text(encoding='utf-8')


def palette_color(token):
    match = re.search(rf'--{re.escape(token)}:\s*([^;]+);', styles)
    if not match:
        raise ValueError(f'Missing palette token: --{token}')
    value = match.group(1).strip()
    if re.fullmatch(r'#[0-9a-fA-F]{6}', value):
        return ImageColor.getrgb(value)
    # Resolve the site's sRGB backdrop mix so baked video backgrounds stay in
    # sync with the shared page palette instead of using the darker card surface.
    mix = re.fullmatch(
        r'color-mix\(in srgb,\s*var\(--([\w-]+)\)\s+([\d.]+)%,\s*var\(--([\w-]+)\)\)', value)
    if mix:
        first, percentage, second = mix.groups()
        weight = float(percentage) / 100
        return tuple(round(a * weight + b * (1 - weight))
                     for a, b in zip(palette_color(first), palette_color(second)))
    raise ValueError(f'Unsupported palette value for --{token}: {value}')


ink = palette_color('mint')
background = palette_color('page-backdrop')
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--mobile-only', action='store_true', help='Rebuild only the portrait clip and poster')
args = parser.parse_args()
for compact in ((True,) if args.mobile_only else (False, True)):
    size = (480, 1040) if compact else (1440, 810)
    destination = root / ('mobile' if compact else 'desktop')
    destination.mkdir(exist_ok=True)
    with TemporaryDirectory(prefix='nucleus-loader-') as temporary:
        for index in range(17):
            alpha = Image.open(root / f'frame-{index:02}.webp').getchannel('A')
            # Crop the original full-height composition to the viewport ratio.
            # Containing each sketch inside 400 x 600 and padding to 480 x 1040
            # baked empty bands into the mobile video that CSS cover cannot fix.
            # Peripheral strokes may bleed offscreen; the wordmark stays central.
            alpha = ImageOps.fit(alpha, size, Image.Resampling.LANCZOS)
            frame = Image.new('RGB', size, background)
            frame.paste(ink, (0, 0, *size), alpha)
            frame.save(Path(temporary) / f'{index:02}.png')
            if index == 6:
                frame.save(destination / 'still.webp', lossless=True, method=6)
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y',
                        '-framerate', '20', '-i', str(Path(temporary) / '%02d.png'),
                        '-an', '-c:v', 'libx264', '-profile:v', 'baseline', '-pix_fmt', 'yuv420p',
                        '-crf', '16', '-preset', 'slow', '-movflags', '+faststart',
                        str(destination / 'sequence.mp4')], check=True)
    print(f'{destination.name}: {(destination / "sequence.mp4").stat().st_size:,} bytes')
