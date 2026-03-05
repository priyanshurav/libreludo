import type { VitePWAOptions } from 'vite-plugin-pwa';

export const pwaOptions: Partial<VitePWAOptions> = {
  registerType: 'prompt',
  filename: 'sw.js',
  injectRegister: false,
  manifest: {
    name: 'LibreLudo',
    short_name: 'LibreLudo',
    description:
      'An ad-free, open-source Ludo game for the browser. Clean, privacy-focused local multiplayer — no downloads, no logins, no interruptions.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#7C5FFF',
    icons: [
      {
        src: '/icons/favicon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  },
  workbox: {
    globPatterns: [
      'assets/**/*.{js,css,ico,png,jpg,jpeg,svg,webp,gif,woff2,woff,ttf,eot,json}',
      '*.html',
      'icons/**/*.{png,svg,ico}',
    ],
    globIgnores: ['icons/favicon.png', 'icons/favicon.svg'],
    navigateFallbackDenylist: [
      /sitemap\.xml$/,
      /robots\.txt$/,
      /manifest\.webmanifest$/,
      /THIRD_PARTY_LICENSES\.txt$/,
    ],
    navigateFallback: '/index.html',
    mode: process.env.NODE_ENV,
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
    cleanupOutdatedCaches: true,
    clientsClaim: true,
    skipWaiting: false,
  },
};
