import { describe, expect, it } from 'vitest';
import {
  clearSessionState,
  initialState,
  addToGameInactiveTime,
  setGameStartTime,
} from '../../src/state/slices/sessionSlice';
import { cloneDeep } from 'lodash-es';
import sessionReducer from '../../src/state/slices/sessionSlice';

describe('Test players slice reducers', () => {
  describe('setGameStartTime', () => {
    it('should set gameStartTime when called with a valid payload', () => {
      const initState = cloneDeep(initialState);
      const newState = sessionReducer(initState, setGameStartTime(47));
      expect(newState.gameStartTime).toBe(47);
    });
  });
  describe('addToGameInactiveTime', () => {
    it('should increment gameInactiveTime by the provided amount', () => {
      const initState = cloneDeep(initialState);
      expect(initState.gameInactiveTime).toBe(0);
      const newState = sessionReducer(initState, addToGameInactiveTime(25));
      expect(newState.gameInactiveTime).toBe(25);
    });
  });
  describe('clearSessionState', () => {
    it('should clear session state', () => {
      const initState = cloneDeep(initialState);
      initState.gameStartTime = 248;
      initState.gameInactiveTime = 293;
      const newState = sessionReducer(initState, clearSessionState());
      expect(newState).toEqual(initialState);
    });
  });
});
