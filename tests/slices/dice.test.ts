import { describe, expect, it } from 'vitest';
import diceReducer, {
  clearDiceState,
  generateRollBag,
  getDice,
  initialState,
  registerDice,
  renewRollBag,
  setDiceNumber,
  setIsPlaceholderShowing,
  type TDiceState,
} from '../../src/state/slices/diceSlice';
import type { TDice } from '../../src/types';

describe('Test dice slice reducers', () => {
  describe('registerDice', () => {
    it('should register a new die for the given player color', () => {
      const newState = diceReducer(initialState, registerDice('blue'));
      expect(newState.dice).toHaveLength(1);
      expect(newState.dice[0]).toEqual({
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
      expect(newState.dice[0].isPlaceholderShowing).toBe(true);
    });
  });
  describe('setDiceNumber', () => {
    it('should update the dice number for the specified player colour', () => {
      const state = diceReducer(initialState, registerDice('blue'));
      const newState = diceReducer(state, setDiceNumber({ colour: 'blue', randomIndex: 0 }));
      expect(getDice(newState, 'blue').diceNumber).toBe(state.rollBag.blue[0]);
    });
  });
  describe('renewRollBag', () => {
    it('should refill the roll bag with a fresh set of 36 dice numbers for the given player', () => {
      const previousState: TDiceState = {
        ...initialState,
        rollBag: {
          ...initialState.rollBag,
          blue: [1, 2],
        },
      };
      const newState = diceReducer(previousState, renewRollBag('blue'));
      expect(newState.rollBag.blue).toEqual(generateRollBag());
    });
  });
  describe('clearDiceState', () => {
    it('should clear dice state', () => {
      const initState: TDiceState = {
        dice: [
          { colour: 'blue', diceNumber: 1, isPlaceholderShowing: false },
          { colour: 'green', diceNumber: 1, isPlaceholderShowing: false },
        ],
        rollBag: {
          blue: [1, 2, 3, 4, 5],
          red: [6, 4, 3, 2, 5],
          green: [5, 4, 2, 4, 6, 4, 2],
          yellow: [1, 2, 1, 3, 4, 3],
        },
      };

      expect(diceReducer(initState, clearDiceState())).toEqual(initialState);
    });
  });
});

describe('Test dice helpers', () => {
  describe('getDice', () => {
    it('should return the dice matching the specified player color', () => {
      const state: TDiceState = {
        dice: [
          { colour: 'blue', diceNumber: 1, isPlaceholderShowing: false },
          { colour: 'green', diceNumber: 1, isPlaceholderShowing: false },
        ],
        rollBag: { blue: [], red: [], green: [], yellow: [] },
      };

      expect(getDice(state, 'blue')).toEqual(state.dice[0]);
    });
    it('should throw an error if no dice matches the specified player color', () => {
      const state: TDiceState = {
        dice: [
          { colour: 'blue', diceNumber: 1, isPlaceholderShowing: false },
          { colour: 'green', diceNumber: 1, isPlaceholderShowing: false },
        ],
        rollBag: { blue: [], red: [], green: [], yellow: [] },
      };
      expect(() => getDice(state, 'white' as never)).toThrowError();
    });
    it('should throw an error if the dice state is empty', () => {
      expect(() => getDice(initialState, 'blue')).toThrowError();
    });
  });

  describe('generateRollBag', () => {
    it('should generate a bag of 36 numbers with equal distribution of 1-6', () => {
      const bag = generateRollBag();
      const freqMap = bag.reduce(
        (acc, curr) => {
          acc[curr] = (acc[curr] || 0) + 1;
          return acc;
        },
        {} as Record<number, number>
      );
      const expectedDistribution: Record<number, number> = {};
      for (let i = 1; i <= 6; i++) {
        expectedDistribution[i] = 6;
      }
      expect(freqMap).toEqual(expectedDistribution);
    });
  });
});
