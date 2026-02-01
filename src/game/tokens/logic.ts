import type { TPlayerColour, TPlayer, TCoordinate } from '../../types';
import type { TToken } from '../../types';
import { areCoordsEqual } from '../coords/logic';
import { getDistanceInTokenPath, getHomeCoordForColour } from '../coords/logic';

export function isAnyTokenActiveOfColour(colour: TPlayerColour, players: TPlayer[]): boolean {
  const player = players.find((p) => p.colour === colour);
  if (!player || !player.tokens) return false;
  return player.tokens.some((t) => t.isActive);
}

export function tokensWithCoord(coord: TCoordinate, players: TPlayer[]): TToken[] {
  const allTokens = players.flatMap((p) => p.tokens);
  return allTokens.filter((t) => areCoordsEqual(t.coordinates, coord));
}

export function getAvailableSteps({ colour, coordinates }: TToken): number {
  return getDistanceInTokenPath(colour, coordinates, getHomeCoordForColour(colour));
}

export function isTokenMovable(token: TToken, diceNumber?: number): boolean {
  if (!diceNumber) return !token.isLocked && !token.hasTokenReachedHome;
  return !token.isLocked && !token.hasTokenReachedHome && getAvailableSteps(token) >= diceNumber;
}

export function getTokenDOMId(colour: TPlayerColour, id: number): string {
  return `${colour}_${id}`;
}
