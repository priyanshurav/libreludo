import { useEffect, useState } from 'react';

type TDimensions = { width: number; height: number };

export const useWindowDimensions = (): TDimensions => {
  const [dimensions, setDimensions] = useState<TDimensions>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return dimensions;
};
