import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type TBoardState = {
  boardSideLength: number;
  boardBlockSize: number;
  tokenHeight: number;
  tokenWidth: number;
};

export const initialState: TBoardState = {
  boardSideLength: 0,
  boardBlockSize: 0,
  tokenHeight: 0,
  tokenWidth: 0,
};

export const NUMBER_OF_BLOCKS_IN_ONE_ROW = 15;
export const TOKEN_WIDTH_HEIGHT_RATIO = 0.625;

const reducers = {
  resizeBoard: (state: TBoardState, action: PayloadAction<number>) => {
    state.boardSideLength = action.payload;
    state.boardBlockSize = action.payload / NUMBER_OF_BLOCKS_IN_ONE_ROW;
    state.tokenHeight = (action.payload / NUMBER_OF_BLOCKS_IN_ONE_ROW) * 0.8;
    state.tokenWidth =
      (action.payload / NUMBER_OF_BLOCKS_IN_ONE_ROW) * 0.8 * TOKEN_WIDTH_HEIGHT_RATIO;
  },
  clearBoardState: () => JSON.parse(JSON.stringify(initialState)),
};

const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers,
});

export const { resizeBoard, clearBoardState } = boardSlice.actions;

export default boardSlice.reducer;
