import type { TPlayerColour } from '../../types';

export const playerColours = {
  blue: '#1295e7ff',
  red: '#ff0002ff',
  green: '#049645ff',
  yellow: '#ffde15ff',
};

export const FORWARD_TOKEN_TRANSITION_TIME = 500;
export const BACKWARD_TOKEN_TRANSITION_TIME = 100;
export const playerSequenceForFourPlayers: TPlayerColour[] = ['blue', 'red', 'green', 'yellow'];
export const playerSequenceForThreePlayers: TPlayerColour[] = ['blue', 'red', 'green'];
export const playerSequenceForTwoPlayers: TPlayerColour[] = ['blue', 'green'];
export const MAX_PLAYER_NAME_LENGTH = 15;
