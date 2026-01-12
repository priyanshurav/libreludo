import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';
import { EXIT_MESSAGE } from '../pages/Play/components/Game/Game';

export const usePageLeaveBlocker = (shouldBlock: boolean) => {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (shouldBlock) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [shouldBlock]);

  useBlocker(({ currentLocation, nextLocation }) => {
    if (!shouldBlock || currentLocation.pathname === nextLocation.pathname) return false;
    const userWantsToLeave = confirm(EXIT_MESSAGE);
    return !userWantsToLeave;
  });
};
