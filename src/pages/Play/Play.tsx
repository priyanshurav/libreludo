import { Navigate, useLocation } from 'react-router-dom';
import Game from './components/Game/Game';
import { useEffect } from 'react';
import { useCleanup } from '../../hooks/useCleanup';
import type { TPlayerInitData } from '../../types';

function Play() {
  const cleanup = useCleanup();
  const location = useLocation();
  const { initData } = (location.state as { initData: TPlayerInitData[] }) ?? {};
  const shouldLoad = location.state === 'LOAD_SAVE';

  useEffect(() => {
    document.title = 'Play LibreLudo';
    return () => cleanup();
  }, [cleanup]);

  if (shouldLoad) {
    return <Game initData={[]} loadSave={true} />;
  } else if (initData && initData?.length !== 0) {
    return <Game initData={initData} loadSave={false} />;
  } else {
    return <Navigate to="/setup" />;
  }
}

export default Play;
