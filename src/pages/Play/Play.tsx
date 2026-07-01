import { Navigate, useLocation } from 'react-router-dom';
import Game from './components/Game/Game';
import { useEffect } from 'react';
import { useCleanup } from '../../hooks/useCleanup';
import type { TPlayerInitData } from '../../types';
import { saveExists } from '../../game/storage/storage';

function Play() {
  const cleanup = useCleanup();
  const location = useLocation();
  const { initData } = (location.state as { initData: TPlayerInitData[] }) ?? {};

  useEffect(() => {
    document.title = 'Play LibreLudo';
    return () => cleanup();
  }, [cleanup]);

  if (initData?.length !== 0 || saveExists()) {
    return <Game initData={initData || []} />;
  } else {
    return <Navigate to="/setup" />;
  }
}

export default Play;
