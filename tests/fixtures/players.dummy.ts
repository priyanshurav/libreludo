import { genLockedTokens } from '../../src/game/tokens/factory';
import type { TPlayer } from '../../src/types';

export const DUMMY_PLAYERS: TPlayer[] = [
  {
    colour: 'blue',
    isBot: false,
    name: 'Player 1',
    numberOfConsecutiveSix: 0,
    tokens: genLockedTokens('blue'),
    playerFinishTime: -1,
  },
  {
    colour: 'red',
    isBot: false,
    name: 'Player 2',
    numberOfConsecutiveSix: 0,
    tokens: genLockedTokens('red'),
    playerFinishTime: -1,
  },
  {
    colour: 'green',
    isBot: false,
    name: 'Player 3',
    numberOfConsecutiveSix: 0,
    tokens: genLockedTokens('green'),
    playerFinishTime: -1,
  },
  {
    colour: 'yellow',
    isBot: false,
    name: 'Player 4',
    numberOfConsecutiveSix: 0,
    tokens: genLockedTokens('yellow'),
    playerFinishTime: -1,
  },
];
