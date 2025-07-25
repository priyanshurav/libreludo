import type { TCoordinate } from '../types';

export function areCoordsEqual(coord1: TCoordinate, coord2: TCoordinate): boolean {
  return coord1.x === coord2.x && coord1.y === coord2.y;
}
