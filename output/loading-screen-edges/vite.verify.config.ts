import { defineConfig } from 'vite';
import baseConfig from '../../vite.config';
export default defineConfig(env => ({ ...baseConfig(env), server: { watch: null } }));
