import { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import './loading-screen.css';

export type LoadingScreenProps = {
  /** Keep the component mounted and toggle active to play its exit transition. */
  active?: boolean;
  message?: string;
  onExitComplete?: () => void;
};

const LOOP_SECONDS = 5.2;

// Original, deliberately uneven pen strokes. No raster assets or icon fonts.
const WIRE = `M -80 650
  C 130 765 278 631 240 445 S 84 309 117 498
  S 361 820 481 679 S 397 440 263 323 S 4 291 96 161
  S 465 11 519 201 S 403 408 459 434
  C 516 451 548 260 578 219 S 644 36 736 84
  S 725 321 889 218 S 966 -95 1083 21 S 943 327 1110 415
  S 1526 416 1523 331 S 1253 99 1193 207 S 1364 532 1176 622
  S 869 518 875 686 S 1055 907 1076 726 S 906 557 778 666
  S 846 1042 660 912 S 685 581 538 717 S 346 921 297 825
  S 147 938 -70 782`;

const DOODLES = [
  {
    name: 'atom', label: 'Curiosity', viewBox: '0 0 160 160',
    paths: [
      `M 14 79 C 10 61 49 51 82 54 C 118 56 151 69 145 84
       C 139 100 103 106 71 101 C 34 97 12 90 14 79
       M 43 19 C 63 8 92 43 110 73 C 129 106 133 141 119 145
       C 102 152 72 120 56 90 C 37 57 28 29 43 19
       M 118 18 C 134 25 124 64 107 94 C 86 129 57 151 44 141
       C 29 128 44 88 61 61 C 82 29 106 10 118 18
       M 73 73 C 80 68 88 74 87 81 C 85 91 72 88 72 80 C 71 77 72 75 73 73`,
      'M 17 30 L 22 35 M 19 23 L 26 23 M 138 118 L 145 121 M 135 128 L 139 134',
    ],
  },
  {
    name: 'laptop', label: 'Make something', viewBox: '0 0 220 160',
    paths: [
      `M 36 25 Q 105 19 178 27 L 185 119 Q 106 114 29 121 L 36 25
       M 46 36 L 167 38 L 174 107 L 40 109 L 46 36
       M 29 121 L 10 139 Q 106 151 207 137 L 185 119
       M 10 139 Q 13 147 26 149 L 192 147 Q 204 146 207 137
       M 87 128 L 126 128 L 135 138 L 80 138 L 87 128
       M 83 56 L 67 70 L 84 81 M 133 56 L 149 69 L 134 83 M 116 51 L 103 87`,
      'M 21 17 L 15 9 M 13 29 L 4 27 M 194 43 Q 209 37 214 24 M 204 25 L 214 24 L 215 34',
    ],
  },
  {
    name: 'calendar', label: 'See you there', viewBox: '0 0 160 170',
    paths: [
      `M 27 35 Q 82 29 134 37 L 138 143 Q 82 151 22 143 L 27 35
       M 26 61 Q 80 56 135 64 M 49 22 L 48 45 Q 56 51 58 43 L 59 20
       M 103 22 L 102 44 Q 108 51 112 44 L 113 22
       M 40 78 L 55 78 L 54 92 L 39 91 L 40 78
       M 71 77 L 86 78 L 85 92 L 70 92 L 71 77
       M 41 109 L 55 108 L 55 123 L 40 123 L 41 109
       M 71 109 L 85 108 L 85 124 L 71 123 L 71 109
       M 100 111 L 107 119 L 122 102
       M 100 78 Q 112 66 123 78 Q 132 96 113 98 Q 95 99 97 85 Q 98 79 104 76`,
      'M 142 17 L 146 9 M 145 27 L 156 23 M 13 152 Q 51 160 88 155',
    ],
  },
  {
    name: 'community', label: 'Better together', viewBox: '0 0 240 170',
    paths: [
      `M 98 43 C 96 15 137 14 141 41 C 144 65 102 72 98 43
       M 42 64 C 40 41 75 39 79 61 C 83 84 46 91 42 64
       M 164 65 C 161 42 198 40 202 64 C 203 88 166 89 164 65
       M 83 143 L 85 95 Q 87 76 103 74 Q 120 89 136 74 Q 153 77 156 97 L 160 144
       M 20 145 L 24 108 Q 27 94 45 94 Q 60 106 77 93 L 86 99
       M 155 100 L 168 94 Q 185 106 201 94 Q 218 98 220 115 L 223 145
       M 43 118 L 42 143 M 105 101 L 104 143 M 136 102 L 139 144 M 199 119 L 201 144
       M 12 147 Q 117 154 230 146`,
      'M 75 27 L 68 19 M 160 27 L 168 17 M 111 6 L 116 1 L 123 7 M 8 92 L 1 88 M 229 93 L 237 87',
    ],
  },
] as const;

function SketchPath({ d, start, reduced }: { d: string; start: number; reduced: boolean }) {
  return <motion.path
    d={d}
    vectorEffect="non-scaling-stroke"
    initial={reduced ? false : { pathLength: 0, pathOffset: 0, opacity: 0 }}
    animate={reduced ? { pathLength: 1, pathOffset: 0, opacity: 1 } : {
      pathLength: [0, 0, 1, 1, 0],
      pathOffset: [0, 0, 0, 0, 1],
      opacity: [0, 0, 1, 1, 0],
    }}
    transition={reduced ? { duration: 0 } : {
      duration: LOOP_SECONDS, times: [0, start, start + .22, .82, 1],
      ease: 'easeInOut', repeat: Infinity,
    }}
  />;
}

function LoadingOverlay({ message }: { message: string }) {
  const reduced = useReducedMotion() === true;

  useEffect(() => {
    const root = document.documentElement, body = document.body;
    const rootOverflow = root.style.overflow, bodyOverflow = body.style.overflow;
    const gutter = root.style.scrollbarGutter;
    // Keep the layout width stable while the overlay owns scrolling.
    root.style.scrollbarGutter = 'stable';
    root.style.overflow = body.style.overflow = 'hidden';
    return () => {
      root.style.overflow = rootOverflow; body.style.overflow = bodyOverflow;
      root.style.scrollbarGutter = gutter;
    };
  }, []);

  return <motion.div
    className="nucleus-loader"
    data-loading-screen=""
    data-lenis-prevent=""
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: reduced ? 0 : .4, ease: 'easeOut' }}
  >
    <div className="nucleus-loader__art" aria-hidden="true">
      <svg className="nucleus-loader__wire" viewBox="0 0 1440 900" preserveAspectRatio="none" fill="none" focusable="false">
        <motion.path
          d={WIRE}
          vectorEffect="non-scaling-stroke"
          initial={reduced ? false : { pathLength: 0, pathOffset: 0, opacity: 0 }}
          animate={reduced ? { pathLength: 1, pathOffset: 0, opacity: .65 } : {
            pathLength: [0, 1, 1, 0], pathOffset: [0, 0, 0, 1], opacity: [.65, .65, .65, 0],
          }}
          transition={reduced ? { duration: 0 } : {
            duration: LOOP_SECONDS, times: [0, .6, .8, 1], ease: 'easeInOut', repeat: Infinity,
          }}
        />
      </svg>
      {DOODLES.map((doodle, index) => <div className={`nucleus-loader__doodle nucleus-loader__doodle--${doodle.name}`} key={doodle.name}>
        <svg viewBox={doodle.viewBox} fill="none" focusable="false">
          {doodle.paths.map((d, stroke) => <SketchPath key={stroke} d={d} start={.02 + index * .018 + stroke * .035} reduced={reduced} />)}
        </svg>
        <span>{doodle.label}</span>
      </div>)}
    </div>
    <div className="nucleus-loader__edition" aria-hidden="true"><span>SJEC / MANGALURU</span><span>TECH / COMMUNITY</span></div>
    <div className="nucleus-loader__center">
      <p className="nucleus-loader__wordmark" aria-hidden="true">NUCLEUS</p>
      <p className="nucleus-loader__tagline" aria-hidden="true">Made of many minds.</p>
      <p className="nucleus-loader__status" role="status" aria-live="polite" aria-atomic="true">
        <span className="nucleus-loader__dot" aria-hidden="true" />{message}
      </p>
    </div>
    <div className="nucleus-loader__footer" aria-hidden="true"><span>A connection worth making.</span><span>Just a moment</span></div>
  </motion.div>;
}

/** Mount once, outside transformed containers. The parent controls readiness. */
export default function LoadingScreen({ active = true, message = 'Connecting the dots…', onExitComplete }: LoadingScreenProps) {
  return <AnimatePresence onExitComplete={onExitComplete}>
    {active && <LoadingOverlay key="nucleus-loading-screen" message={message} />}
  </AnimatePresence>;
}
