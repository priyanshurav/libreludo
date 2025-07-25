import type { TPlayerColour, TPlayer, TCoordinate } from '../../types';
import type { TToken } from '../../types';
import { areCoordsEqual } from '../../utils/areCoordsEqual';
import { ERRORS } from '../../utils/errors';
import { getDistanceFromCurrentCoord, getHomeCoordForColour } from '../coords/logic';

export function isAnyTokenActiveOfColour(colour: TPlayerColour, players: TPlayer[]): boolean {
  const player = players.find((p) => p.colour === colour);
  if (!player || !player.tokens) return false;
  return player.tokens.some((t) => t.isActive);
}

export const getOnlyTokenMovable = (
  colour: TPlayerColour,
  diceNumber: number,
  players: TPlayer[]
) => {
  const player = players.find((p) => p.colour === colour);
  if (!player) throw new Error(ERRORS.playerDoesNotExist(colour));
  const movableTokens: TToken[] = [];
  player.tokens.forEach((t) => {
    if (isTokenMovable(t, diceNumber)) movableTokens.push(t);
  });
  return movableTokens.length === 1 ? movableTokens[0] : null;
};

export const tokensWithCoord = (coord: TCoordinate, allTokens: TToken[]) => {
  return allTokens.filter((t) => areCoordsEqual(t.coordinates, coord));
};

export function isTokenMovable(token: TToken, diceNumber: number): boolean {
  const areSufficientStepsAvailable =
    getDistanceFromCurrentCoord(token, getHomeCoordForColour(token.colour)) >= diceNumber;
  if (token.id === 0 && token.colour === 'blue')
    console.log(token, diceNumber, areSufficientStepsAvailable);
  return !token.isLocked && !token.hasTokenReachedHome && areSufficientStepsAvailable;
}
