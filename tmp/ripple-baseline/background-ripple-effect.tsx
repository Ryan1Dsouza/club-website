// Adapted from https://ui.aceternity.com/components/background-ripple-effect
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { cn } from '../../src/lib/utils';
import './rendered.css';

type Cell = { row: number; col: number };

export const BackgroundRippleEffect = ({
  className,
  rows,
  cols,
  cellSize = 56,
}: {
  className?: string;
  rows?: number;
  cols?: number;
  cellSize?: number;
}) => {
  const [clickedCell, setClickedCell] = useState<Cell | null>(null);
  const [rippleKey, setRippleKey] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [dimensions, setDimensions] = useState({ rows: 8, cols: 27 });
  const ref = useRef<HTMLDivElement>(null);
  const gridRows = rows ?? dimensions.rows;
  const gridCols = cols ?? dimensions.cols;

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setReducedMotion(preference.matches);
      setClickedCell(null);
    };
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const next = {
        rows: Math.max(1, Math.ceil(entry.contentRect.height / cellSize)),
        cols: Math.max(1, Math.ceil(entry.contentRect.width / cellSize)),
      };
      setDimensions(previous => previous.rows === next.rows && previous.cols === next.cols ? previous : next);
    });
    observer.observe(ref.current!);
    return () => observer.disconnect();
  }, [cellSize]);

  useEffect(() => {
    const container = ref.current;
    const surface = container?.parentElement;
    const grid = container?.querySelector<HTMLElement>('.background-ripple-effect__grid');
    if (!surface || !grid || reducedMotion) return;

    // Listen through the page: its foreground canvas and controls keep their
    // own pointer events, and the decorative grid never intercepts them.
    let hovered: HTMLElement | null = null;
    const getCell = (event: MouseEvent): Cell | null => {
      if (event.target instanceof Element && event.target.closest('a, button, input, textarea, select, [role="button"], [role="dialog"], dialog')) return null;
      const bounds = grid.getBoundingClientRect();
      const col = Math.floor((event.clientX - bounds.left) / cellSize);
      const row = Math.floor((event.clientY - bounds.top) / cellSize);
      return row >= 0 && row < gridRows && col >= 0 && col < gridCols ? { row, col } : null;
    };
    const clearHover = () => {
      hovered?.removeAttribute('data-hovered');
      hovered = null;
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const cell = getCell(event);
      const next = cell ? grid.children.item(cell.row * gridCols + cell.col) as HTMLElement : null;
      if (next === hovered) return;
      clearHover();
      hovered = next;
      hovered?.setAttribute('data-hovered', 'true');
    };
    const click = (event: MouseEvent) => {
      const cell = getCell(event);
      if (!cell) return;
      setClickedCell(cell);
      setRippleKey(key => key + 1);
    };
    surface.addEventListener('click', click);
    surface.addEventListener('pointermove', move, { passive: true });
    surface.addEventListener('pointerleave', clearHover);
    surface.addEventListener('pointercancel', clearHover);
    return () => {
      clearHover();
      surface.removeEventListener('click', click);
      surface.removeEventListener('pointermove', move);
      surface.removeEventListener('pointerleave', clearHover);
      surface.removeEventListener('pointercancel', clearHover);
    };
  }, [cellSize, gridRows, gridCols, reducedMotion, rippleKey]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        'background-ripple-effect',
        'ripple-pointer-events-none ripple-absolute ripple-inset-0 ripple-z-0 ripple-h-full ripple-w-full ripple-overflow-hidden ripple-bg-transparent',
        className,
      )}
    >
      <DivGrid
        key={`base-${rippleKey}`}
        rows={gridRows}
        cols={gridCols}
        cellSize={cellSize}
        borderColor="var(--cell-border-color)"
        fillColor="var(--cell-fill-color)"
        clickedCell={reducedMotion ? null : clickedCell}
      />
    </div>
  );
};

type DivGridProps = {
  className?: string;
  rows: number;
  cols: number;
  cellSize: number;
  borderColor: string;
  fillColor: string;
  clickedCell: Cell | null;
};

type CellStyle = CSSProperties & {
  '--delay'?: string;
  '--duration'?: string;
};

const DivGrid = ({
  className,
  rows,
  cols,
  cellSize,
  borderColor,
  fillColor,
  clickedCell,
}: DivGridProps) => {
  const cells = useMemo(
    () => Array.from({ length: rows * cols }, (_, index) => index),
    [rows, cols],
  );

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
    gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
    width: '100%',
    height: '100%',
  };

  return (
    <div className={cn('background-ripple-effect__grid ripple-relative', className)} style={gridStyle}>
      {cells.map(index => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        const distance = clickedCell ? Math.hypot(clickedCell.row - row, clickedCell.col - col) : 0;
        const delay = clickedCell ? Math.max(0, distance * 55) : 0;
        const duration = 200 + distance * 80;

        const style: CellStyle = clickedCell
          ? { '--delay': `${delay}ms`, '--duration': `${duration}ms` }
          : {};

        return (
          <div
            key={index}
            className={cn(
              'background-ripple-effect__cell ripple-relative ripple-opacity-40 ripple-transition-opacity ripple-duration-150',
              clickedCell && 'motion-safe:ripple-animate-cell-ripple',
            )}
            style={{ backgroundColor: fillColor, borderColor, ...style }}
          />
        );
      })}
    </div>
  );
};
