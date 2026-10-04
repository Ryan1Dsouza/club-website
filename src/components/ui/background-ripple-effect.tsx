import { useEffect, useRef, type CSSProperties } from 'react';
import { cn } from '../../lib/utils';
import './background-ripple-effect.css';

type Cell = { row: number; col: number };
type Wave = { started: number; cells: { x: number; y: number; delay: number; strength: number }[] };
const PULSE_MS = 420;
const MAX_WAVES = 2;
const CLICK_INTERVAL_MS = 120;

export const BackgroundRippleEffect = ({ className, rows, cols, cellSize = 56 }: {
  className?: string;
  rows?: number;
  cols?: number;
  cellSize?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current!;
    const surface = container.parentElement!;
    const canvas = canvasRef.current!;
    const hover = hoverRef.current!;
    const context = canvas.getContext('2d');
    if (!context) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const touch = matchMedia('(pointer: coarse)');
    let width = 0, height = 0, gridRows = 0, gridCols = 0;
    let frame = 0, lastPaint = 0, lastClick = -Infinity;
    let waves: Wave[] = [];
    let hovered: Cell | null = null;
    let bounds: DOMRect | undefined;

    const clearHover = () => {
      hovered = null;
      hover.hidden = true;
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      waves = [];
      lastClick = -Infinity;
      context.clearRect(0, 0, width, height);
      container.dataset.activeWaves = '0';
      clearHover();
    };
    const resize = () => {
      stop();
      bounds = undefined;
      width = container.clientWidth;
      height = container.clientHeight;
      gridRows = rows ?? Math.ceil(height / cellSize);
      gridCols = cols ?? Math.ceil(width / cellSize);
      // One small backing surface, including on Retina and 4K displays.
      const scale = Math.min(devicePixelRatio || 1, touch.matches ? 1 : 1.5, Math.sqrt(1_500_000 / Math.max(1, width * height)));
      canvas.width = Math.max(1, Math.floor(width * scale));
      canvas.height = Math.max(1, Math.floor(height * scale));
      context.setTransform(scale, 0, 0, scale, 0, 0);
    };
    const paint = (time: number) => {
      frame = 0;
      if (document.hidden || motion.matches) { stop(); return; }
      if (time - lastPaint < (touch.matches ? 1000 / 30 : 1000 / 60) - 1) {
        frame = requestAnimationFrame(paint);
        return;
      }
      lastPaint = time;
      context.clearRect(0, 0, width, height);
      waves = waves.filter(wave => time - wave.started < wave.cells.at(-1)!.delay + PULSE_MS);
      context.fillStyle = '#c3e5c8';
      for (const wave of waves) {
        const elapsed = time - wave.started;
        for (const cell of wave.cells) {
          const progress = (elapsed - cell.delay) / PULSE_MS;
          if (progress <= 0 || progress >= 1) continue;
          context.globalAlpha = Math.sin(progress * Math.PI) * cell.strength * .22;
          context.fillRect(cell.x + 1, cell.y + 1, cellSize - 2, cellSize - 2);
        }
      }
      context.globalAlpha = 1;
      const count = String(waves.length);
      if (container.dataset.activeWaves !== count) container.dataset.activeWaves = count;
      if (waves.length) frame = requestAnimationFrame(paint);
    };
    const getCell = (event: MouseEvent): Cell | null => {
      if (motion.matches || document.hidden || surface.closest('[inert]')) return null;
      if (event.target instanceof Element && event.target.closest('a, button, input, textarea, select, [role="button"], [role="dialog"], dialog, [inert]')) return null;
      // Reuse layout measurements through pointer bursts; invalidate on scroll/resize.
      bounds ??= container.getBoundingClientRect();
      const col = Math.floor((event.clientX - bounds.left) / cellSize);
      const row = Math.floor((event.clientY - bounds.top) / cellSize);
      return row >= 0 && row < gridRows && col >= 0 && col < gridCols ? { row, col } : null;
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const cell = getCell(event);
      if (!cell) { clearHover(); return; }
      if (cell.row === hovered?.row && cell.col === hovered.col) return;
      hovered = cell;
      hover.style.transform = `translate(${cell.col * cellSize}px, ${cell.row * cellSize}px)`;
      hover.hidden = false;
    };
    const click = (event: MouseEvent) => {
      const now = performance.now();
      if (now - lastClick < CLICK_INTERVAL_MS) return;
      const origin = getCell(event);
      if (!origin) return;
      lastClick = now;
      const radius = touch.matches ? 7 : 12;
      const cells: Wave['cells'] = [];
      for (let row = Math.max(0, origin.row - radius); row < Math.min(gridRows, origin.row + radius + 1); row++) {
        for (let col = Math.max(0, origin.col - radius); col < Math.min(gridCols, origin.col + radius + 1); col++) {
          const distance = Math.hypot(row - origin.row, col - origin.col);
          if (distance > radius) continue;
          cells.push({ x: col * cellSize, y: row * cellSize, delay: distance * 45, strength: 1 - distance / (radius + 1) });
        }
      }
      cells.sort((a, b) => a.delay - b.delay);
      waves = [...waves.slice(-(MAX_WAVES - 1)), { started: now, cells }];
      container.dataset.activeWaves = String(waves.length);
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const invalidate = () => { bounds = undefined; clearHover(); };
    const visibility = () => { if (document.hidden) stop(); };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();
    surface.addEventListener('click', click);
    surface.addEventListener('pointermove', move, { passive: true });
    surface.addEventListener('pointerleave', clearHover);
    surface.addEventListener('pointercancel', clearHover);
    window.addEventListener('scroll', invalidate, { passive: true, capture: true });
    motion.addEventListener('change', stop);
    touch.addEventListener('change', resize);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      stop();
      observer.disconnect();
      surface.removeEventListener('click', click);
      surface.removeEventListener('pointermove', move);
      surface.removeEventListener('pointerleave', clearHover);
      surface.removeEventListener('pointercancel', clearHover);
      window.removeEventListener('scroll', invalidate, true);
      motion.removeEventListener('change', stop);
      touch.removeEventListener('change', resize);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [cellSize, rows, cols]);

  return <div ref={ref} aria-hidden="true" data-active-waves="0"
    className={cn('background-ripple-effect', className)}
    style={{ '--cell-size': `${cellSize}px` } as CSSProperties}>
    <div className="background-ripple-effect__grid">
      <div ref={hoverRef} className="background-ripple-effect__hover" hidden />
      <canvas ref={canvasRef} className="background-ripple-effect__canvas" />
    </div>
  </div>;
};
