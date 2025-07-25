import type { TToken, TCoordinate, TPlayerColour } from '../../types';
import { areCoordsEqual } from '../../utils/areCoordsEqual';
import { TOKEN_SAFE_COORDINATES } from '../tokens/constants';
import { tokenPaths, expandedGeneralTokenPath, expandedTokenHomeEntryPath } from '../tokens/paths';

export function getDistanceFromCurrentCoord(token: TToken, targetCoord: TCoordinate) {
  const { colour, coordinates } = token;
  const currentCoordIndex = tokenPaths[colour].findIndex((v) => areCoordsEqual(v, coordinates));
  const startCoordIndex = tokenPaths[colour].findIndex((v) => areCoordsEqual(v, targetCoord));
  return Math.abs(currentCoordIndex - startCoordIndex);
}

export function getMinDistanceBetweenCoordsInGeneralTokenPath(
  coord1: TCoordinate,
  coord2: TCoordinate
) {
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
 * Returns true if coord1 is ahead of coord2 in general token path
 */
export function isAheadInTokenPath(coord1: TCoordinate, coord2: TCoordinate): boolean {
  const coord1Index = expandedGeneralTokenPath.findIndex((c) => areCoordsEqual(coord1, c));
  const coord2Index = expandedGeneralTokenPath.findIndex((c) => areCoordsEqual(coord2, c));
  return coord1Index > coord2Index;
}

export function isCoordASafeSpot(coord: TCoordinate): boolean {
  return TOKEN_SAFE_COORDINATES.some((c) => areCoordsEqual(coord, c));
}

export function getHomeCoordForColour(colour: TPlayerColour): TCoordinate {
  const tokenPath = tokenPaths[colour];
  return tokenPath[tokenPath.length - 1];
}
