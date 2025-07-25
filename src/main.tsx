import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { gameStateStore } from './gameStateStore.ts';
import { RouterProvider } from 'react-router-dom';
import { router } from './router.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={gameStateStore}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
