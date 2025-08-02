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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
