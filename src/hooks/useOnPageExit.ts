import { useEffect, useRef } from 'react';
import { useBlocker, useLocation } from 'react-router-dom';

export function useOnPageExit(callback: () => boolean) {
  useBlocker(() => callback());
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      const shouldBlock = callback();
      if (shouldBlock) e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  });
}
