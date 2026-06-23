import type { Easing, MotionValue } from 'framer-motion';

type TokenMotionEntry = {
  x: MotionValue<number>;
  y: MotionValue<number>;
  setExternallyAnimating: (v: boolean) => void;
  animateTo: (
    x: number,
    y: number,
    transition: { duration: number; ease: Easing }
  ) => Promise<void>;
};

export const tokenMotionRegistry = new Map<string, TokenMotionEntry>();
