import type { RootState } from '../state/store';
import type { TPlayerColour, TCoordinate } from './players';

export type TTokenAlignmentData = {
  // The X and Y offsets are defined relative to the center of the tile containing the token.
  xOffset: number;
  yOffset: number;
  scaleFactor: number;
};

export type TTokenColourAndId = {
  colour: TPlayerColour;
  id: number;
};

export type TTokenDirection = 'forward' | 'backward';

export type TSequenceCalculationResult = {
  nextState: RootState;
  moveSequence: TCoordinate[];
  captureData: { token: TToken; moveSequence: TCoordinate[] }[];
};

export type TToken = {
  id: number;
  colour: TPlayerColour;
  coordinates: TCoordinate;
  initialCoords: TCoordinate;
  tokenAlignmentData: TTokenAlignmentData;
  isLocked: boolean;
  isActive: boolean;
  hasTokenReachedHome: boolean;
  direction: TTokenDirection | null;
};

export type TTokenPath = {
  startCoords: TCoordinate;
  endCoords: TCoordinate;
};

export type TMoveData = {
  isCaptured: boolean;
  hasTokenReachedHome: boolean;
  hasPlayerWon: boolean;
};

export type TTokenClickData = { timestamp: number; id: number; colour: TPlayerColour };
