import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TPlayerColour } from '../../types';
import { ERRORS } from '../../utils/errors';
import type { TDice } from '../../types';
import { getRandomNumberBetweenOneAndSix } from '../../utils/getRandomNumberBetweenOneAndSix';

export const initialState: TDice[] = [];

export function getDice(state: TDice[], colour: TPlayerColour): TDice {
  const dice = state.find((d) => d.colour === colour);
  if (!dice) throw new Error(ERRORS.diceDoesNotExist(colour));
  return dice;
}

const reducers = {
  registerDice: (state: TDice[], action: PayloadAction<TPlayerColour>) => {
    state.push({
      colour: action.payload,
      diceNumber: 1,
      isPlaceholderShowing: false,
    });
  },
  setIsPlaceholderShowing: (
    state: TDice[],
    action: PayloadAction<{ colour: TPlayerColour; isPlaceholderShowing: boolean }>
  ) => {
    const dice = getDice(state, action.payload.colour);
    dice.isPlaceholderShowing = action.payload.isPlaceholderShowing;
  },
  rollDice: (state: TDice[], action: PayloadAction<{ colour: TPlayerColour }>) => {
    const diceNumber = getRandomNumberBetweenOneAndSix();

    const dice = getDice(state, action.payload.colour);
    dice.diceNumber = diceNumber;
  },
  clearDiceState: () => JSON.parse(JSON.stringify(initialState)),
};

const diceSlice = createSlice({
  name: 'dice',
  initialState,
  reducers,
});

export const { registerDice, rollDice, setIsPlaceholderShowing, clearDiceState } =
  diceSlice.actions;

export default diceSlice.reducer;
