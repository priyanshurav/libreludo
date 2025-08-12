import type { TCoordinate, TPlayerColour, TToken } from '../../types';
import { TOKEN_SAFE_COORDINATES } from '../tokens/constants';
import { tokenPaths, expandedGeneralTokenPath, expandedTokenHomeEntryPath } from '../tokens/paths';

export function getDistanceInTokenPath(
  colour: TPlayerColour,
  initialCoord: TCoordinate,
  targetCoord: TCoordinate
): number {
  const initialCoordIndex = tokenPaths[colour].findIndex((v) => areCoordsEqual(v, initialCoord));
  const targetCoordIndex = tokenPaths[colour].findIndex((v) => areCoordsEqual(v, targetCoord));
  if (initialCoordIndex === -1 || targetCoordIndex === -1) return -1;
  return Math.abs(initialCoordIndex - targetCoordIndex);
}

export function areTokensOnOverlappingPaths(token1: TToken, token2: TToken): boolean {
  const coord1 = token1.coordinates;
  const coord2 = token2.coordinates;

  const tokenPath1 = tokenPaths[token1.colour];
  const tokenPath2 = tokenPaths[token2.colour];

  const tokenPath1CoordIndex = tokenPath1.findIndex((c) => areCoordsEqual(c, coord1));
  const tokenPath2CoordIndex = tokenPath2.findIndex((c) => areCoordsEqual(c, coord2));

  const areCoordsOverlapping =
    tokenPath1
      .slice(tokenPath1CoordIndex, tokenPath1.length)
      .find((c) => areCoordsEqual(c, coord2)) ||
    tokenPath2
      .slice(tokenPath2CoordIndex, tokenPath2.length)
      .find((c) => areCoordsEqual(c, coord1));

  return Boolean(areCoordsOverlapping);
}

export function getDistanceBetweenTokens(token1: TToken, token2: TToken): number {
  const { coordinates: coord1 } = token1;
  const { coordinates: coord2 } = token2;
  if (!areTokensOnOverlappingPaths(token1, token2)) return -1;
  const index1 = expandedGeneralTokenPath.findIndex((c) => areCoordsEqual(c, coord1));
  const index2 = expandedGeneralTokenPath.findIndex((c) => areCoordsEqual(c, coord2));
  const pathLength = expandedGeneralTokenPath.length;
  const forwardDistance = (index2 - index1 + pathLength) % pathLength;
  const backwardDistance = (index1 - index2 + pathLength) % pathLength;

  return Math.min(forwardDistance, backwardDistance);
}

export function isCoordInHomeEntryPathForColour(
  coord: TCoordinate,
  colour: TPlayerColour
): boolean {
  const tokenHomeEntryPath = expandedTokenHomeEntryPath[colour];
  return tokenHomeEntryPath.some((c) => areCoordsEqual(coord, c));
}

/**
 * Returns true if token1 is ahead of token2
 */
export function isAheadInTokenPath(token1: TToken, token2: TToken): boolean {
  if (areCoordsEqual(token1.coordinates, token2.coordinates)) return false;
  if (!areTokensOnOverlappingPaths(token1, token2)) return false;

  const token1Path = tokenPaths[token1.colour];
  const token2Path = tokenPaths[token2.colour];
  const token2CoordIndex = token2Path.findIndex((c) => areCoordsEqual(c, token2.coordinates));
  const token1CoordIndex = token1Path.findIndex((c) => areCoordsEqual(c, token1.coordinates));
  const minDist = getDistanceBetweenTokens(token1, token2);

  if (token2CoordIndex === -1 || token1CoordIndex === -1) return false;

  for (let i = token2CoordIndex; i < token2Path.length; i++) {
    if (i - token2CoordIndex > minDist) break;
    if (areCoordsEqual(token2Path[i], token1.coordinates)) return true;
  }
  for (let i = token1CoordIndex; i < token1Path.length; i++) {
    if (i - token1CoordIndex > minDist) break;
    if (areCoordsEqual(token1Path[i], token2.coordinates)) return false;
  }
  return false;
}

export function isCoordASafeSpot(coord: TCoordinate): boolean {
  return TOKEN_SAFE_COORDINATES.some((c) => areCoordsEqual(coord, c));
}

export function getHomeCoordForColour(colour: TPlayerColour): TCoordinate {
  const tokenPath = tokenPaths[colour];
  return tokenPath[tokenPath.length - 1];
}

export function areCoordsEqual(coord1: TCoordinate, coord2: TCoordinate): boolean {
  return coord1.x === coord2.x && coord1.y === coord2.y;
}
