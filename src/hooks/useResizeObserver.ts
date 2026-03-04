import { useEffect, useRef } from 'react';

export const useResizeObserver = (node: HTMLElement | null, callback: () => unknown): void => {
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!node) return;
    if (!resizeObserverRef.current) {
      resizeObserverRef.current = new ResizeObserver(() => {
        callbackRef.current();
      });
    }
    const resizeObserver = resizeObserverRef.current;
    resizeObserver.observe(node);
    return () => {
      resizeObserver.unobserve(node);
    };
  }, [node]);

  useEffect(() => {
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
    };
  }, []);
};
