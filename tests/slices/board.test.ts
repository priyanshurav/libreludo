import { describe, expect, it } from 'vitest';
import boardReducer, {
  clearBoardState,
  initialState,
  NUMBER_OF_BLOCKS_IN_ONE_ROW,
  resizeBoard,
  TOKEN_WIDTH_HEIGHT_RATIO,
} from '../../src/state/slices/boardSlice';

describe('Test board slice reducers', () => {
  describe('resizeBoard', () => {
    it('should update board and token dimensions when board side length is set', () => {
      const newBoardSideLength = 550;
      const newBoardBlockSize = newBoardSideLength / NUMBER_OF_BLOCKS_IN_ONE_ROW;
      const newTokenHeight = newBoardBlockSize * 0.8;
      const newTokenWidth = newTokenHeight * TOKEN_WIDTH_HEIGHT_RATIO;
      const newState = boardReducer(initialState, resizeBoard(newBoardSideLength));

      expect(newState.boardSideLength).toBe(newBoardSideLength);
      expect(newState.boardTileSize).toBe(newBoardBlockSize);
      expect(newState.tokenHeight).toBe(newTokenHeight);
      expect(newState.tokenWidth).toBe(newTokenWidth);
    });
  });
  describe('clearBoardState', () => {
    it('should clear board state', () => {
      const newState = boardReducer(initialState, resizeBoard(550));
      expect(boardReducer(newState, clearBoardState())).toEqual(initialState);
    });
  });
});
