import type { TToken } from './tokens';

export type TPlayerColour = 'blue' | 'red' | 'green' | 'yellow';

export type TPlayerNameAndColour = {
  name: string;
  colour: TPlayerColour;
};

export type TPlayer = {
  name: string;
  colour: TPlayerColour;
  isBot: boolean;
  numberOfConsecutiveSix: number;
  playerFinishTime: number;
  tokens: TToken[];
};

export type TCoordinate = {
  // The origin is located at the top-left corner of the board
  x: number;
  y: number;
};

export type TPlayerInitData = {
  isBot: boolean;
  name: string;
};

export type TPlayerCount = 'two' | 'three' | 'four';
