import { useEffect, useRef, type CSSProperties } from 'react';
import { cn } from '../../lib/utils';
import './background-ripple-effect.css';

type Cell = { row: number; col: number };
type Wave = { started: number; cells: Float32Array; count: number; active: boolean };
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
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    const lowEnd = (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4) || (memory !== undefined && memory > 0 && memory <= 4);
    let width = 0, height = 0, gridRows = 0, gridCols = 0;
    let frame = 0, lastPaint = 0, lastClick = -Infinity;
    // Reuse both waves and their shared radial stencil. Clicks fill existing
    // buffers; neither clicks nor paints allocate arrays of cell objects.
    const waves: Wave[] = Array.from({ length: MAX_WAVES }, () => ({ started: 0, cells: new Float32Array(25 * 25 * 4), count: 0, active: false }));
    let stencil = new Float32Array(0), radius = 12, nextWave = 0;
    let hovered: Cell | null = null;
    let bounds: DOMRect | undefined;

    const clearHover = () => {
      hovered = null;
      hover.hidden = true;
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      for (const wave of waves) wave.active = false;
      nextWave = 0; lastPaint = 0;
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
      const nextRadius = lowEnd ? 5 : touch.matches ? 7 : 12;
      if (!stencil.length || nextRadius !== radius) {
        radius = nextRadius;
        const values: number[] = [];
        for (let row = -radius; row <= radius; row++) {
          for (let col = -radius; col <= radius; col++) {
            const distance = Math.hypot(row, col);
            if (distance <= radius) values.push(col * cellSize, row * cellSize, distance * 45, 1 - distance / (radius + 1));
          }
        }
        stencil = new Float32Array(values);
      }
      // One small backing surface, including on Retina and 4K displays.
      const scale = Math.min(devicePixelRatio || 1, lowEnd ? .75 : touch.matches ? 1 : 1.5, Math.sqrt((lowEnd ? 350_000 : 1_500_000) / Math.max(1, width * height)));
      canvas.width = Math.max(1, Math.floor(width * scale));
      canvas.height = Math.max(1, Math.floor(height * scale));
      context.setTransform(scale, 0, 0, scale, 0, 0);
    };
    const paint = (time: number) => {
      frame = 0;
      if (document.hidden || motion.matches) { stop(); return; }
      if (time - lastPaint < 1000 / (lowEnd ? 24 : touch.matches ? 30 : 60) - 1) {
        frame = requestAnimationFrame(paint);
        return;
      }
      lastPaint = time;
      context.clearRect(0, 0, width, height);
      context.fillStyle = '#c3e5c8';
      let activeCount = 0;
      for (const wave of waves) {
        if (!wave.active) continue;
        const elapsed = time - wave.started;
        if (elapsed >= radius * 45 + PULSE_MS) { wave.active = false; continue; }
        activeCount++;
        for (let index = 0; index < wave.count; index += 4) {
          const progress = (elapsed - wave.cells[index + 2]) / PULSE_MS;
          if (progress <= 0 || progress >= 1) continue;
          context.globalAlpha = Math.sin(progress * Math.PI) * wave.cells[index + 3] * .22;
          context.fillRect(wave.cells[index] + 1, wave.cells[index + 1] + 1, cellSize - 2, cellSize - 2);
        }
      }
      context.globalAlpha = 1;
      const count = String(activeCount);
      if (container.dataset.activeWaves !== count) container.dataset.activeWaves = count;
      if (activeCount) frame = requestAnimationFrame(paint);
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
      const wave = waves[nextWave]; nextWave = (nextWave + 1) % (lowEnd ? 1 : MAX_WAVES);
      wave.started = now; wave.active = true; wave.count = 0;
      const edgeX = Math.min(width, gridCols * cellSize), edgeY = Math.min(height, gridRows * cellSize);
      // Cull once per click into the reusable buffer, not on every paint.
      for (let index = 0; index < stencil.length; index += 4) {
        const x = origin.col * cellSize + stencil[index], y = origin.row * cellSize + stencil[index + 1];
        if (x < 0 || y < 0 || x >= edgeX || y >= edgeY) continue;
        wave.cells[wave.count++] = x; wave.cells[wave.count++] = y;
        wave.cells[wave.count++] = stencil[index + 2]; wave.cells[wave.count++] = stencil[index + 3];
      }
      let activeCount = 0;
      for (const item of waves) if (item.active) activeCount++;
      container.dataset.activeWaves = String(activeCount);
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
