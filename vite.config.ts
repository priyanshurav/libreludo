import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import checker from 'vite-plugin-checker';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { VitePWA, type VitePWAOptions } from 'vite-plugin-pwa';

const pwaConfig: Partial<VitePWAOptions> = {
  registerType: 'autoUpdate',
  manifest: {
    name: 'LibreLudo',
    short_name: 'LibreLudo',
    description:
      'Discover LibreLudo, your go-to open-source site for free Ludo fun. Dive into the classic board game with clever dice strategies and local play-great for players of all ages',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#7C5FFF',
    icons: [
      {
        src: '/icons/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icons/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  },
  workbox: {
    globPatterns: [
      'assets/**/*.{js,css,ico,png,jpg,jpeg,svg,webp,gif,woff2,woff,ttf,eot,json}',
      '*.{html,txt}',
      'icons/**/*.{png,svg,ico}',
      '_redirects',
    ],
    globIgnores: ['icons/**/web*'],
    navigateFallback: '/index.html',
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
    cleanupOutdatedCaches: true,
    clientsClaim: true,
    skipWaiting: true,
    runtimeCaching: [
      {
        // Cache Google Fonts CSS
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-stylesheets',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        // Cache Google Fonts files (e.g., woff2)
        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-webfonts',
          expiration: {
            maxEntries: 20,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
    ],
  },
};

// https://vite.dev/config/
export default defineConfig({
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
    },
  },
  plugins: [
    react(),
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
    VitePWA(pwaConfig),
  ],
});
