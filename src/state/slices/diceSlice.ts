import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TPlayerColour } from '../../types';
import { ERRORS } from '../../utils/errors';
import type { TDice } from '../../types';

export type TDiceState = {
  dice: TDice[];
  rollBag: Record<TPlayerColour, number[]>;
};

export const initialState: TDiceState = {
  dice: [],
  rollBag: { blue: [], red: [], green: [], yellow: [] },
};

export function getDice(state: TDiceState, colour: TPlayerColour): TDice {
  const dice = state.dice.find((d) => d.colour === colour);
  if (!dice) throw new Error(ERRORS.diceDoesNotExist(colour));
  return dice;
}

export function generateRollBag(): number[] {
  const diceNumbers = Array(36)
    .fill(null)
    .map((_, i) => (i % 6) + 1);
  return diceNumbers;
}

const reducers = {
  registerDice: (state: TDiceState, action: PayloadAction<TPlayerColour>) => {
    state.dice.push({
      colour: action.payload,
      diceNumber: 1,
      isPlaceholderShowing: false,
    });
    state.rollBag[action.payload] = generateRollBag();
  },
  setIsPlaceholderShowing: (
    state: TDiceState,
    action: PayloadAction<{ colour: TPlayerColour; isPlaceholderShowing: boolean }>
  ) => {
    const dice = getDice(state, action.payload.colour);
    dice.isPlaceholderShowing = action.payload.isPlaceholderShowing;
  },
  setDiceNumber: (
    state: TDiceState,
    action: PayloadAction<{ colour: TPlayerColour; randomIndex: number }>
  ) => {
    const dice = getDice(state, action.payload.colour);
    dice.diceNumber = state.rollBag[action.payload.colour][action.payload.randomIndex];
    state.rollBag[action.payload.colour] = state.rollBag[action.payload.colour].filter(
      (_, i) => i !== action.payload.randomIndex
    );
  },
  renewRollBag: (state: TDiceState, action: PayloadAction<TPlayerColour>) => {
    state.rollBag[action.payload] = generateRollBag();
  },
  clearDiceState: () => structuredClone(initialState),
};

const diceSlice = createSlice({
  name: 'dice',
  initialState,
  reducers,
});

export const {
  registerDice,
  setDiceNumber,
  setIsPlaceholderShowing,
  renewRollBag,
  clearDiceState,
} = diceSlice.actions;

export default diceSlice.reducer;
