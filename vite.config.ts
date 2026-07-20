import { defineConfig } from 'vitest/config';
import { reactRouter } from '@react-router/dev/vite';
import svgr from 'vite-plugin-svgr';
import checker from 'vite-plugin-checker';
import licenses from 'rollup-plugin-license';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { VitePWA } from 'vite-plugin-pwa';
import { pwaOptions } from './pwa.config';
import { version, license } from './package.json';
import { normalizePath } from 'vite';
import path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
  define: {
    __LIBRELUDO_VERSION__: JSON.stringify(version),
    __LIBRELUDO_LICENSE__: JSON.stringify(license),
  },
  plugins: [
    reactRouter(),
    svgr({
      svgrOptions: {
        plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
        svgoConfig: {
          plugins: ['preset-default'],
        },
      },
    }),
    checker({ typescript: { tsconfigPath: './tsconfig.app.json' } }),
    ViteImageOptimizer(),
    licenses({
      thirdParty: {
        output: normalizePath(
          path.resolve(import.meta.dirname, 'build/client/THIRD_PARTY_LICENSES.txt')
        ),
      },
    }),
    viteStaticCopy({
      targets: [
        {
          src: normalizePath(path.resolve(import.meta.dirname, 'LICENSE')),
          dest: normalizePath(path.resolve(import.meta.dirname, 'build/client')),
          rename: 'LICENSE.txt',
        },
      ],
    }),
    VitePWA(pwaOptions),
  ],
});
