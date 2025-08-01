import type { TCoordinate, TPlayerColour, TToken } from '../../types';
import { TOKEN_SAFE_COORDINATES } from '../tokens/constants';
import { tokenPaths, expandedGeneralTokenPath, expandedTokenHomeEntryPath } from '../tokens/paths';

export function getDistanceInTokenPath(
  colour: TPlayerColour,
  initialCoords: TCoordinate,
  targetCoord: TCoordinate
) {
  const currentCoordIndex = tokenPaths[colour].findIndex((v) => areCoordsEqual(v, initialCoords));
  const startCoordIndex = tokenPaths[colour].findIndex((v) => areCoordsEqual(v, targetCoord));
  return Math.abs(currentCoordIndex - startCoordIndex);
}

export function getDistanceBetweenTokens(token1: TToken, token2: TToken): number {
  const { coordinates: coord1 } = token1;
  const { coordinates: coord2 } = token2;
  const tokenPath1 = tokenPaths[token1.colour];
  const tokenPath2 = tokenPaths[token2.colour];
  const areCoordsOverlapping =
    tokenPath1.find((c) => areCoordsEqual(c, coord2)) &&
    tokenPath2.find((c) => areCoordsEqual(c, coord1));
  if (!areCoordsOverlapping) return -1;
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
  const coord1 = token1.coordinates;
  const coord2 = token2.coordinates;

  const tokenPath1 = tokenPaths[token1.colour];
  const tokenPath2 = tokenPaths[token2.colour];

  const areCoordsOverlapping =
    tokenPath1.find((c) => areCoordsEqual(c, coord2)) &&
    tokenPath2.find((c) => areCoordsEqual(c, coord1));

  if (!areCoordsOverlapping) return false;

  const coord1Index = expandedGeneralTokenPath.findIndex((c) =>
    areCoordsEqual(token1.coordinates, c)
  );
  const coord2Index = expandedGeneralTokenPath.findIndex((c) =>
    areCoordsEqual(token2.coordinates, c)
  );

  return coord1Index > coord2Index;
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
