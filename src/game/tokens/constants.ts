import type { TPlayerColour, TCoordinate } from '../../types';
import type { TTokenPath } from '../../types/tokens';

export const GENERAL_TOKEN_PATH: TTokenPath[] = [
  {
    startCoords: { x: 6, y: 1 },
    endCoords: { x: 6, y: 5 },
  },
  {
    startCoords: { x: 5, y: 6 },
    endCoords: { x: 1, y: 6 },
  },
  {
    startCoords: { x: 0, y: 6 },
    endCoords: { x: 0, y: 8 },
  },
  {
    startCoords: { x: 1, y: 8 },
    endCoords: { x: 5, y: 8 },
  },
  {
    startCoords: { x: 6, y: 9 },
    endCoords: { x: 6, y: 13 },
  },
  {
    startCoords: { x: 6, y: 14 },
    endCoords: { x: 8, y: 14 },
  },
  {
    startCoords: { x: 8, y: 13 },
    endCoords: { x: 8, y: 9 },
  },
  {
    startCoords: { x: 9, y: 8 },
    endCoords: { x: 13, y: 8 },
  },
  {
    startCoords: { x: 14, y: 8 },
    endCoords: { x: 14, y: 6 },
  },
  {
    startCoords: { x: 13, y: 6 },
    endCoords: { x: 9, y: 6 },
  },
  {
    startCoords: { x: 8, y: 5 },
    endCoords: { x: 8, y: 1 },
  },
  {
    startCoords: { x: 8, y: 0 },
    endCoords: { x: 6, y: 0 },
  },
];
export const TOKEN_HOME_ENTRY_PATH: Record<TPlayerColour, TTokenPath> = {
  blue: {
    startCoords: { x: 7, y: 1 },
    endCoords: { x: 7, y: 6 },
  },
  red: {
    startCoords: { x: 1, y: 7 },
    endCoords: { x: 6, y: 7 },
  },
  green: {
    startCoords: { x: 7, y: 13 },
    endCoords: { x: 7, y: 8 },
  },
  yellow: {
    startCoords: { x: 13, y: 7 },
    endCoords: { x: 8, y: 7 },
  },
};

export const TOKEN_START_COORDINATES: Record<TPlayerColour, TCoordinate> = {
  blue: { x: 6, y: 1 },
  red: { x: 1, y: 8 },
  green: { x: 8, y: 13 },
  yellow: { x: 13, y: 6 },
};

export const TOKEN_SAFE_COORDINATES: TCoordinate[] = [
  ...Object.values(TOKEN_START_COORDINATES),
  { x: 8, y: 2 },
  { x: 2, y: 6 },
  { x: 6, y: 12 },
  { x: 12, y: 8 },
];
export const blueTokensLockedCoords: TCoordinate[] = [
  {
    x: 1.5,
    y: 1.8,
  },
  {
    x: 3.5,
    y: 1.8,
  },
  {
    x: 3.5,
    y: 3.8,
  },
  {
    x: 1.5,
    y: 3.8,
  },
];
export const redTokensLockedCoords: TCoordinate[] = [
  {
    x: 1.5,
    y: 12.8,
  },
  {
    x: 3.5,
    y: 12.8,
  },
  {
    x: 1.5,
    y: 10.8,
  },
  {
    x: 3.5,
    y: 10.8,
  },
];
export const greenTokensLockedCoords: TCoordinate[] = [
  {
    x: 10.5,
    y: 12.8,
  },
  {
    x: 12.5,
    y: 12.8,
  },
  {
    x: 10.5,
    y: 10.8,
  },
  {
    x: 12.5,
    y: 10.8,
  },
];
export const yellowTokensLockedCoords: TCoordinate[] = [
  {
    x: 10.5,
    y: 3.8,
  },
  {
    x: 12.5,
    y: 3.8,
  },
  {
    x: 10.5,
    y: 1.8,
  },
  {
    x: 12.5,
    y: 1.8,
  },
];
export const FORWARD_TOKEN_TRANSITION_TIME = 500;
export const BACKWARD_TOKEN_TRANSITION_TIME = 100;
