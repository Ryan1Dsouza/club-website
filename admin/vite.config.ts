import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Keep this standalone app independent of the main site's PostCSS/Tailwind config.
  css: { postcss: { plugins: [] } },
  server: {
    port: 3001,
  },
})
