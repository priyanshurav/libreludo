import { type RootState, type AppDispatch } from './../state/store';
import { useCallback } from 'react';
import { useDispatch, useStore } from 'react-redux';
import type { TPlayerColour } from '../types';
import { setIsPlaceholderShowing, renewRollBag, setDiceNumber } from '../state/slices/diceSlice';
import { saveState } from '../game/storage/saveState';
import { sleep } from '../utils/sleep';

const DICE_PLACEHOLDER_DELAY = 1000;

export const useRollDice = () => {
  const store = useStore<RootState>();
  const dispatch = useDispatch<AppDispatch>();
  return useCallback(
    async (colour: TPlayerColour, onDiceRoll: (diceNumber: number) => void) => {
      if (store.getState().players.isGameEnded) return;
      dispatch(setIsPlaceholderShowing({ colour, isPlaceholderShowing: true }));
      await sleep(DICE_PLACEHOLDER_DELAY);
      const diceState = store.getState().dice;
      const dice = diceState.dice.find((d) => d.colour === colour);
      if (diceState.rollBag[colour].length === 0) dispatch(renewRollBag(colour));
      const bag = store.getState().dice.rollBag[colour];
      const index = Math.floor(Math.random() * bag.length);
      const diceNumber = bag[index];
      dispatch(setIsPlaceholderShowing({ colour, isPlaceholderShowing: false }));
      dispatch(setDiceNumber({ colour, randomIndex: index }));
      saveState(store.getState());
      if (dice) onDiceRoll(diceNumber);
    },
    [dispatch, store]
  );
};
