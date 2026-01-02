import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './state/store.ts';
import { RouterProvider } from 'react-router-dom';
import { router } from './router.tsx';
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

console.log(
  `%c LibreLudo v${__APP_VERSION__} %c License: ${__APP_LICENSE__}`,
  'background: #4caf50; color: #fff; padding: 5px 10px; border-radius: 3px 0 0 3px; font-weight: bold;',
  'background: #e65100; color: #fff; padding: 5px 10px; font-weight: bold;'
);
console.log(
  '%cSource: https://github.com/priyanshurav/libreludo',
  'font-style: italic; color: white; padding-top: 5px;'
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
