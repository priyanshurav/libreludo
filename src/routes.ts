import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('pages/HomePage/HomePage.tsx'),
  route('play', 'pages/Play/Play.tsx'),
  route('setup', 'pages/PlayerSetup/PlayerSetup.tsx'),
  route('how-to-play', 'pages/HowToPlay/HowToPlay.tsx'),
  route('*', 'pages/NotFound/NotFound.tsx'),
] satisfies RouteConfig;
