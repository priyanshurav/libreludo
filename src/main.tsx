import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './state/store.ts';
import { RouterProvider } from 'react-router-dom';
import { router } from './router.tsx';
import { registerSW } from 'virtual:pwa-register';
import './index.css';

// Disable React DevTools in production
if (import.meta.env.PROD) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (hook && typeof hook === 'object') {
    for (const key in hook) {
      hook[key] = typeof hook[key] === 'function' ? () => {} : null;
    }
  }
}

const PROMPT_SHOWN_KEY = 'pwa-update-prompt-shown';

const updateSW = registerSW({
  immediate: import.meta.env.PROD,
  onNeedRefresh: () => {
    if (sessionStorage.getItem(PROMPT_SHOWN_KEY)) return;
    sessionStorage.setItem(PROMPT_SHOWN_KEY, 'true');
    const shouldUpdate = confirm('A new version is available. Reload now?');
    if (shouldUpdate) updateSW(true);
  },
  onOfflineReady: () => {
    console.log('App is ready to work offline.');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
