import { type RootState, type AppDispatch } from './../state/store';
import { useCallback } from 'react';
import { useDispatch, useStore } from 'react-redux';
import type { TPlayerColour } from '../types';
import { setIsPlaceholderShowing, renewRollBag, setDiceNumber } from '../state/slices/diceSlice';
import { saveState } from '../game/storage/saveState';
import { sleep } from '../utils/sleep';
import { ERRORS } from '../utils/errors';
import {
  incrementNumberOfConsecutiveSix,
  resetNumberOfConsecutiveSix,
} from '../state/slices/playersSlice';

const DICE_PLACEHOLDER_DELAY = 1000;

export const useRollDice = () => {
  const store = useStore<RootState>();
  const dispatch = useDispatch<AppDispatch>();
  return useCallback(
    async (colour: TPlayerColour): Promise<number> => {
      if (store.getState().players.isGameEnded) throw new Error(ERRORS.gameEnded());
      dispatch(setIsPlaceholderShowing({ colour, isPlaceholderShowing: true }));
      await sleep(DICE_PLACEHOLDER_DELAY);
      const diceState = store.getState().dice;
      if (diceState.rollBag[colour].length === 0) dispatch(renewRollBag(colour));
      const bag = store.getState().dice.rollBag[colour];
      const index = Math.floor(Math.random() * bag.length);
      const diceNumber = bag[index];
      dispatch(setIsPlaceholderShowing({ colour, isPlaceholderShowing: false }));

      if (diceNumber === 6) dispatch(incrementNumberOfConsecutiveSix(colour));
      else dispatch(resetNumberOfConsecutiveSix(colour));
      const player = store.getState().players.players.find((p) => p.colour === colour)!;
      if (player.numberOfConsecutiveSix === 3) {
        dispatch(resetNumberOfConsecutiveSix(colour));
        saveState(store.getState());
        return -1;
      }

      dispatch(setDiceNumber({ colour, randomIndex: index }));
      saveState(store.getState());
      return diceNumber;
    },
    [dispatch, store]
  );
};
