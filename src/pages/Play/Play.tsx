import { Navigate, useLocation } from 'react-router-dom';
import Game from './components/Game/Game';
import { useEffect } from 'react';
import { useCleanup } from '../../hooks/useCleanup';
import type { TPlayerInitData } from '../../types';

function Play() {
  const cleanup = useCleanup();
  const location = useLocation();
  const { initData } = (location.state as { initData: TPlayerInitData[] }) ?? {};
  useEffect(() => {
    document.title = 'Play LibreLudo';
    return () => cleanup();
  }, [cleanup]);
  return initData && initData?.length !== 0 ? (
    <Game initData={initData} />
  ) : (
    <Navigate to="/setup" />
  );
}

export default Play;
