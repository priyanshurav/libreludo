import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TPlayerColour } from '../../types';
import { ERRORS } from '../../utils/errors';
import type { TDice } from '../../types';

export const initialState: TDice[] = [];

const diceNumberStore: Record<TPlayerColour, number[]> = {
  blue: [],
  red: [],
  green: [],
  yellow: [],
};

export function getDice(state: TDice[], colour: TPlayerColour): TDice {
  const dice = state.find((d) => d.colour === colour);
  if (!dice) throw new Error(ERRORS.diceDoesNotExist(colour));
  return dice;
}

function fillDiceNumberStore(playerColour: TPlayerColour): void {
  const diceNumbers = Array(36)
    .fill(null)
    .map((_, i) => (i % 6) + 1);
  diceNumberStore[playerColour] = diceNumbers;
}

const reducers = {
  registerDice: (state: TDice[], action: PayloadAction<TPlayerColour>) => {
    state.push({
      colour: action.payload,
      diceNumber: 1,
      isPlaceholderShowing: false,
    });
    fillDiceNumberStore(action.payload);
  },
  setIsPlaceholderShowing: (
    state: TDice[],
    action: PayloadAction<{ colour: TPlayerColour; isPlaceholderShowing: boolean }>
  ) => {
    const dice = getDice(state, action.payload.colour);
    dice.isPlaceholderShowing = action.payload.isPlaceholderShowing;
  },
  rollDice: (state: TDice[], action: PayloadAction<{ colour: TPlayerColour }>) => {
    if (diceNumberStore[action.payload.colour].length === 0)
      fillDiceNumberStore(action.payload.colour);

    const index = Math.floor(Math.random() * diceNumberStore[action.payload.colour].length);
    const diceNumber = diceNumberStore[action.payload.colour][index];
    diceNumberStore[action.payload.colour] = diceNumberStore[action.payload.colour].filter(
      (_, i) => i !== index
    );
    const dice = getDice(state, action.payload.colour);
    dice.diceNumber = diceNumber;
  },
  clearDiceState: () => {
    (Object.keys(diceNumberStore) as TPlayerColour[]).forEach(
      (colour) => (diceNumberStore[colour] = [])
    );
    return structuredClone(initialState);
  },
};

const diceSlice = createSlice({
  name: 'dice',
  initialState,
  reducers,
});

export const { registerDice, rollDice, setIsPlaceholderShowing, clearDiceState } =
  diceSlice.actions;

export default diceSlice.reducer;
