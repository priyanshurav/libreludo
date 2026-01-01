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
  `%c LibreLudo v${__APP_VERSION__} %c Source: https://github.com/priyanshurav/libreludo `,
  'background: #4caf50; color: #fff; padding: 5px 10px; border-radius: 3px 0 0 3px; font-weight: bold;',
  'background: #333; color: #fff; padding: 5px 10px; border-radius: 0 3px 3px 0;'
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
