import { defaultTokenAlignmentData } from '../../src/game/tokens/alignment';
import type { TToken } from '../../src/types';

export const DUMMY_TOKEN: TToken = {
  colour: 'blue',
  coordinates: { x: 0, y: 0 },
  hasTokenReachedHome: false,
  id: 0,
  initialCoords: { x: 0, y: 0 },
  isActive: false,
  isLocked: true,
  tokenAlignmentData: defaultTokenAlignmentData,
};
