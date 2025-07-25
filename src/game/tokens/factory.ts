import type { TPlayerColour, TCoordinate } from '../../types';
import type { TToken } from '../../types';
import { ERRORS } from '../../utils/errors';
import {
  blueTokensLockedCoords,
  redTokensLockedCoords,
  greenTokensLockedCoords,
  yellowTokensLockedCoords,
} from './constants';

export function genLockedTokens(colour: TPlayerColour): TToken[] {
  const tokens: TToken[] = [];
  let coordinateList: TCoordinate[] = [];

  switch (colour) {
    case 'blue':
      coordinateList = blueTokensLockedCoords;
      break;
    case 'red':
      coordinateList = redTokensLockedCoords;
      break;
    case 'green':
      coordinateList = greenTokensLockedCoords;
      break;
    case 'yellow':
      coordinateList = yellowTokensLockedCoords;
      break;
    default:
      throw new Error(ERRORS.invalidPlayerColour(colour));
  }

  for (let i = 0; i < coordinateList.length; i++) {
    tokens.push({
      id: i,
      colour,
      coordinates: coordinateList[i],
      isLocked: true,
      isActive: false,
      isDirectionForward: true,
      hasTokenReachedHome: false,
      initialCoords: coordinateList[i],
      tokenAlignmentData: {
        xOffset: 0,
        yOffset: 0,
        scaleFactor: 1,
      },
    });
  }

  return tokens;
}
