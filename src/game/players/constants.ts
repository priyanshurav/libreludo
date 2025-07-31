import type { TPlayerColour, TPlayerCount } from '../../types';

export const playerColours = {
  blue: '#1295e7ff',
  red: '#ff0002ff',
  green: '#049645ff',
  yellow: '#ffde15ff',
};

export const MAX_PLAYER_NAME_LENGTH = 15;
export const playerSequences: Record<TPlayerCount, TPlayerColour[]> = {
  two: ['blue', 'green'],
  three: ['blue', 'red', 'green'],
  four: ['blue', 'red', 'green', 'yellow'],
};
