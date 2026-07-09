import { initialState as boardInitialState } from '../../src/state/slices/boardSlice';
import { initialState as diceInitialState } from '../../src/state/slices/diceSlice';
import { initialState as playersInitialState } from '../../src/state/slices/playersSlice';
import { initialState as sessionInitialState } from '../../src/state/slices/sessionSlice';
import type { RootState } from '../../src/state/store';

export const DUMMY_STATE: RootState = {
  board: boardInitialState,
  dice: diceInitialState,
  players: playersInitialState,
  session: sessionInitialState,
};
