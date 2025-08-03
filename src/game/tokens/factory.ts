import type { TPlayerColour, TCoordinate } from '../../types';
import type { TToken } from '../../types';
import { ERRORS } from '../../utils/errors';
import { defaultTokenAlignmentData } from './alignment';
import { TOKEN_LOCKED_COORDINATES } from './constants';

export function genLockedTokens(colour: TPlayerColour): TToken[] {
  const tokens: TToken[] = [];
  const coordinateList: TCoordinate[] = TOKEN_LOCKED_COORDINATES[colour];

  if (!coordinateList) throw new Error(ERRORS.invalidPlayerColour(colour));

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
      tokenAlignmentData: defaultTokenAlignmentData,
    });
  }

  return tokens;
}
