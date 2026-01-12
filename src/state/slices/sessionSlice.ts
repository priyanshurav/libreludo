import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type TSessionState = {
  gameStartTime: number;
  gameInactiveTime: number;
};

export const initialState: TSessionState = {
  gameInactiveTime: 0,
  gameStartTime: 0,
};

const reducers = {
  setGameStartTime: (state: TSessionState, action: PayloadAction<number>) => {
    state.gameStartTime = action.payload;
  },
  addToGameInactiveTime: (state: TSessionState, action: PayloadAction<number>) => {
    state.gameInactiveTime += action.payload;
  },
  clearSessionState: () => structuredClone(initialState),
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers,
});

export const { setGameStartTime, addToGameInactiveTime, clearSessionState } = sessionSlice.actions;

export default sessionSlice.reducer;
