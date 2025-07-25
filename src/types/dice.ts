import type { TPlayerColour } from './players';

export type TDice = {
  colour: TPlayerColour;
  diceNumber: number;
  isPlaceholderShowing: boolean;
};
