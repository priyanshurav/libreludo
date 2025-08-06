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

export type TToken = {
  id: number;
  colour: TPlayerColour;
  coordinates: TCoordinate;
  initialCoords: TCoordinate;
  tokenAlignmentData: TTokenAlignmentData;
  isLocked: boolean;
  isActive: boolean;
  isDirectionForward: boolean;
  hasTokenReachedHome: boolean;
}; // import { getMinDistanceBetweenCoordsInGeneralTokenPath } from './logic';
export type TTokenPath = {
  startCoords: TCoordinate;
  endCoords: TCoordinate;
};

export type TTokenTriggerCoordinates = {
  newPathTriggerCoord: TCoordinate;
  winningCoord: TCoordinate;
};
export type TMoveData = { isCaptured: boolean; hasTokenReachedHome: boolean };
export type TTokenClickData = { id: number; colour: TPlayerColour; coords: TCoordinate };
