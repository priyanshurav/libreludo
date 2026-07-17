import { Navigate, useLocation, type MetaFunction } from 'react-router';
import Game from './components/Game/Game';
import { useEffect } from 'react';
import { useCleanup } from '../../hooks/useCleanup';
import type { TPlayerInitData } from '../../types';
import { isStorageSupported, saveExists } from '../../game/storage/storage';

let hasWarnedAboutStorage = false;

export default function Play() {
  const cleanup = useCleanup();
  const location = useLocation();
  const { initData } = (location.state as { initData: TPlayerInitData[] }) ?? {};

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  useEffect(() => {
    const saveSupported = isStorageSupported();
    if (saveSupported === false && !hasWarnedAboutStorage) {
      hasWarnedAboutStorage = true;
      alert("Saving is currently unavailable. Your progress won't be saved this session.");
    }
  }, []);

  return !initData && !saveExists() ? <Navigate to="/setup" /> : <Game initData={initData} />;
}

export const meta: MetaFunction = () => [{ title: 'Play LibreLudo' }];
