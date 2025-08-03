import type { TPlayerColour, TPlayer, TCoordinate } from '../../types';
import type { TToken } from '../../types';
import { areCoordsEqual } from '../coords/logic';
import { ERRORS } from '../../utils/errors';
import { getDistanceInTokenPath, getHomeCoordForColour } from '../coords/logic';

export function isAnyTokenActiveOfColour(colour: TPlayerColour, players: TPlayer[]): boolean {
  const player = players.find((p) => p.colour === colour);
  if (!player || !player.tokens) return false;
  return player.tokens.some((t) => t.isActive);
}

export function getOnlyTokenMovable(
  colour: TPlayerColour,
  diceNumber: number,
  players: TPlayer[]
): TToken | null {
  const player = players.find((p) => p.colour === colour);
  if (!player) throw new Error(ERRORS.playerDoesNotExist(colour));
  const movableTokens = player.tokens.filter((t) => isTokenMovable(t, diceNumber));
  return movableTokens.length === 1 ? movableTokens[0] : null;
}

export function tokensWithCoord(coord: TCoordinate, players: TPlayer[]): TToken[] {
  const allTokens = players.flatMap((p) => p.tokens);
  return allTokens.filter((t) => areCoordsEqual(t.coordinates, coord));
}

export function getAvailableSteps({ colour, coordinates }: TToken): number {
  return getDistanceInTokenPath(colour, coordinates, getHomeCoordForColour(colour));
}

export function isTokenMovable(token: TToken, diceNumber: number): boolean {
  const areSufficientStepsAvailable = getAvailableSteps(token) >= diceNumber;
  return !token.isLocked && !token.hasTokenReachedHome && areSufficientStepsAvailable;
}
