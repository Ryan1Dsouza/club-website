"""Build native, compositor-played loader clips from the existing artwork.

Requires Pillow and ffmpeg. Run after the desktop/mobile frame builders.
The silent H.264 clips retain all 17 cuts at 20fps and work with playsInline on iOS.
"""
from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess
from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[1] / 'src/assets/loading'
for compact in (False, True):
    size = (480, 600) if compact else (1440, 810)
    destination = root / ('mobile' if compact else 'desktop')
    destination.mkdir(exist_ok=True)
    source = Image.open(root / 'mobile/sequence.webp') if compact else None
    with TemporaryDirectory(prefix='nucleus-loader-') as temporary:
        for index in range(17):
            if source:
                source.seek(index)
                artwork = source.convert('RGBA')
            else:
                alpha = Image.open(root / f'frame-{index:02}.webp').getchannel('A')
                alpha = ImageOps.fit(alpha, size, Image.Resampling.LANCZOS)
                artwork = Image.new('RGBA', size, (195, 229, 200, 255))
                artwork.putalpha(alpha)
            frame = Image.new('RGB', size, 'black')
            frame.paste(artwork, mask=artwork.getchannel('A'))
            frame.save(Path(temporary) / f'{index:02}.png')
            if index == 6:
                frame.save(destination / 'still.webp', lossless=True, method=6)
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y',
                        '-framerate', '20', '-i', str(Path(temporary) / '%02d.png'),
                        '-an', '-c:v', 'libx264', '-profile:v', 'baseline', '-pix_fmt', 'yuv420p',
                        '-crf', '16', '-preset', 'slow', '-movflags', '+faststart',
                        str(destination / 'sequence.mp4')], check=True)
    print(f'{destination.name}: {(destination / "sequence.mp4").stat().st_size:,} bytes')
