import { createBrowserRouter } from 'react-router-dom';
import LoadingScreen from './components/LoadingScreen/LoadingScreen.tsx';
import HomePage from './pages/HomePage/HomePage.tsx';
import NotFound from './pages/NotFound/NotFound.tsx';
import { lazy, Suspense, type LazyExoticComponent, type ReactElement } from 'react';

const Play = lazy(() => import('./pages/Play/Play.tsx'));
const PlayerSetup = lazy(() => import('./pages/PlayerSetup/PlayerSetup.tsx'));
const HowToPlay = lazy(() => import('./pages/HowToPlay/HowToPlay.tsx'));

const wrapWithSuspense = (Component: LazyExoticComponent<() => ReactElement>) => (
  <Suspense fallback={<LoadingScreen />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/play',
    element: wrapWithSuspense(Play),
  },
  {
    path: '/setup',
    element: wrapWithSuspense(PlayerSetup),
  },
  {
    path: '/how-to-play',
    element: wrapWithSuspense(HowToPlay),
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
