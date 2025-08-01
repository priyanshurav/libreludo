/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />
declare module 'virtual:pwa-register' {
  export function registerSW(options?: {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
  }): void;
}
