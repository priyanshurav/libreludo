import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import checker from 'vite-plugin-checker';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

const fullReloadAlways: PluginOption = {
  name: 'full-reload-always',
  handleHotUpdate({ server }) {
    server.ws.send({ type: 'full-reload' });
    return [];
  },
} as PluginOption;

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr(),
    checker({ typescript: { tsconfigPath: './tsconfig.app.json' } }),
    ViteImageOptimizer(),
    // fullReloadAlways,
  ],
});
