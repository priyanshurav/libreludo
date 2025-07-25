import { configureStore } from '@reduxjs/toolkit';
import playersReducer from './state/slices/playersSlice';
import boardReducer from './state/slices/boardSlice';
import diceReducer from './state/slices/diceSlice';

export const gameStateStore = configureStore({
  reducer: {
    players: playersReducer,
    board: boardReducer,
    dice: diceReducer,
  },
});

export type RootState = ReturnType<typeof gameStateStore.getState>;
export type AppDispatch = typeof gameStateStore.dispatch;
