import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';

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
    if (!shouldBlock) return false;
    if (currentLocation.pathname === nextLocation.pathname) return false;
    const userWantsToLeave = confirm(
      'Are you sure you want to exit? Any progress made will be lost.'
    );
    return !userWantsToLeave;
  });
};
