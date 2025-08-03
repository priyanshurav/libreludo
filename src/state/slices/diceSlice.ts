import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TPlayerColour } from '../../types';
import { ERRORS } from '../../utils/errors';
import type { TDice } from '../../types';
import { getRandomNumberBetweenOneAndSix } from '../../utils/getRandomNumberBetweenOneAndSix';

// const blue = [6, 5, 5, 5];
// const red = [6, 6, 1, 1];
// const blue = [6, 6, 5, 6, 6].concat(Array(100).fill(4));
// const red = Array(100).fill(5);
// let i1 = 0;
// let i2 = 0;
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
    // let diceNumber = parseInt(
    //   document.querySelector<HTMLInputElement>('#dice-input')?.value as string
    // );
    const diceNumber = getRandomNumberBetweenOneAndSix();
    // if (action.payload.colour === 'green') diceNumber = Math.floor(Math.random() * 6) + 1;
    // let diceNumber = 0;
    // if (action.payload.colour === 'blue') {
    //   diceNumber = blue[i1];
    //   i1++;
    // }
    // if (action.payload.colour === 'red') {
    //   diceNumber = red[i2];
    //   i2++;
    // }
    // if (action.payload.colour === 'green') {
    //   diceNumber = red[i2];
    //   // i2++;
    // }
    // if (action.payload.colour === 'green')
    //   diceNumber = parseInt(
    //     document.querySelector<HTMLInputElement>('#dice-input-bot')?.value as string
    //   );
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
