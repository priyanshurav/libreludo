import { describe, expect, it, vi } from 'vitest';
import diceReducer, {
  clearDiceState,
  getDice,
  initialState,
  registerDice,
  rollDice,
  setIsPlaceholderShowing,
} from '../../src/state/slices/diceSlice';
import type { TDice } from '../../src/types';

describe('Test dice slice reducers', () => {
  describe('registerDice', () => {
    it('should register a new die for the given player color', () => {
      const newState = diceReducer(initialState, registerDice('blue'));
      expect(newState).toHaveLength(1);
      expect(newState[0]).toEqual({
        colour: 'blue',
        diceNumber: 1,
        isPlaceholderShowing: false,
      } as TDice);
    });
  });
  describe('setIsPlaceholderShowing', () => {
    it('should update isPlaceholderShowing for the specified player color', () => {
      const newState = diceReducer(
        diceReducer(initialState, registerDice('blue')),
        setIsPlaceholderShowing({ colour: 'blue', isPlaceholderShowing: true })
      );
      expect(newState[0].isPlaceholderShowing).toBe(true);
    });
  });
  describe('rollDice', () => {
    it('should generate a random number and update the diceNumber for the specified player', () => {
      let newState = diceReducer(initialState, registerDice('blue'));
      newState = diceReducer(newState, registerDice('green'));

      vi.spyOn(Math, 'random').mockReturnValue(0);
      newState = diceReducer(newState, rollDice({ colour: 'blue' }));

      expect(getDice(newState, 'blue').diceNumber).toBe(1);
      expect(getDice(newState, 'green').diceNumber).toBe(1);
      newState = diceReducer(newState, rollDice({ colour: 'blue' }));
      expect(getDice(newState, 'blue').diceNumber).toBe(2);
    });
  });
  describe('clearDiceState', () => {
    it('should clear dice state', () => {
      const initState: TDice[] = [
        { colour: 'blue', diceNumber: 1, isPlaceholderShowing: false },
        { colour: 'green', diceNumber: 1, isPlaceholderShowing: false },
      ];

      expect(diceReducer(initState, clearDiceState())).toEqual(initialState);
    });
  });
});

describe('Test dice helpers', () => {
  describe('getDice', () => {
    it('should return the dice matching the specified player color', () => {
      const state: TDice[] = [
        { colour: 'blue', diceNumber: 1, isPlaceholderShowing: false },
        { colour: 'green', diceNumber: 1, isPlaceholderShowing: false },
      ];

      expect(getDice(state, 'blue')).toEqual(state[0]);
    });
    it('should throw an error if no dice matches the specified player color', () => {
      const state: TDice[] = [
        { colour: 'blue', diceNumber: 1, isPlaceholderShowing: false },
        { colour: 'green', diceNumber: 1, isPlaceholderShowing: false },
      ];

      expect(() => getDice(state, 'white' as never)).toThrowError();
    });
    it('should throw an error if the dice state is empty', () => {
      expect(() => getDice([], 'blue')).toThrowError();
    });
  });
});
