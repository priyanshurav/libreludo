import { configureStore } from '@reduxjs/toolkit';
import playersReducer from './slices/playersSlice';
import boardReducer from './slices/boardSlice';
import diceReducer from './slices/diceSlice';

export const store = configureStore({
  reducer: {
    players: playersReducer,
    board: boardReducer,
    dice: diceReducer,
  },
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
