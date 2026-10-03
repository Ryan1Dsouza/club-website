import type { Config } from 'tailwindcss';
import type { PluginAPI } from 'tailwindcss/types/config';
import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette';

function addVariablesForColors({ addBase, theme }: PluginAPI) {
  const colors = flattenColorPalette(theme('colors'));
  addBase({
    ':root': Object.fromEntries(Object.entries(colors).map(([key, value]) => [`--${key}`, value])),
  });
}

export default {
  // Existing components use hand-written CSS. Keep these utilities isolated.
  content: ['./src/components/ui/background-ripple-effect.tsx'],
  prefix: 'ripple-',
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        bg: '#000000',
        mint: '#c3e5c8',
        muted: '#93ac97',
        surface: '#080b08',
        'surface-raised': '#101610',
        line: 'rgba(195, 229, 200, 0.14)',
        'line-strong': 'rgba(195, 229, 200, 0.34)',
        wash: 'rgba(195, 229, 200, 0.05)',
      },
      animation: {
        'cell-ripple': 'cell-ripple var(--duration, 200ms) ease-out var(--delay, 0ms) 1 none',
      },
      keyframes: {
        'cell-ripple': {
          '0%, 100%': {
            opacity: '0.4',
            backgroundColor: 'var(--cell-fill-color)',
            boxShadow: 'inset 0 0 24px 1px transparent',
          },
          '50%': {
            opacity: '0.8',
            backgroundColor: 'var(--cell-pulse-color)',
            boxShadow: 'inset 0 0 24px 1px color-mix(in srgb, var(--cell-shadow-color) 20%, transparent)',
          },
        },
      },
    },
  },
  plugins: [addVariablesForColors],
} satisfies Config;
