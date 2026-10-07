"""Build native, compositor-played loader clips from the existing artwork.

Requires Pillow and ffmpeg. Run after the desktop/mobile frame builders.
The silent H.264 clips retain all 17 cuts at 20fps and work with playsInline on iOS.
"""
from pathlib import Path
from tempfile import TemporaryDirectory
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
for compact in (False, True):
    size = (480, 1040) if compact else (1440, 810)
    destination = root / ('mobile' if compact else 'desktop')
    destination.mkdir(exist_ok=True)
    source = Image.open(root / 'mobile/sequence.webp') if compact else None
    with TemporaryDirectory(prefix='nucleus-loader-') as temporary:
        for index in range(17):
            if source:
                source.seek(index)
                alpha = source.convert('RGBA').getchannel('A')
                # A tall, full-bleed canvas replaces the old 4:5 video panel.
                # Keep the subjects inside the crop shared by tall phones and
                # 4:3 tablets; only the surrounding background is trimmed.
                subject = ImageOps.contain(alpha.crop(alpha.getbbox()), (400, 600), Image.Resampling.LANCZOS)
                alpha = Image.new('L', size)
                alpha.paste(subject, ((size[0] - subject.width) // 2, (size[1] - subject.height) // 2))
            else:
                alpha = Image.open(root / f'frame-{index:02}.webp').getchannel('A')
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
