import { rollDice, setIsPlaceholderShowing } from '../slices/diceSlice';
import type { TPlayerColour } from '../../types';
import type { AppDispatch, RootState } from '../store';

const DICE_PLACEHOLDER_DELAY = 1000;

export function rollDiceThunk(colour: TPlayerColour, onDiceRoll: (diceNumber: number) => void) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    if (getState().players.isGameEnded) return;
    dispatch(setIsPlaceholderShowing({ colour, isPlaceholderShowing: true }));
    setTimeout(() => {
      dispatch(setIsPlaceholderShowing({ colour, isPlaceholderShowing: false }));
      dispatch(rollDice({ colour }));
      const dice = getState().dice.find((d) => d.colour === colour);
      if (dice) onDiceRoll(dice.diceNumber);
    }, DICE_PLACEHOLDER_DELAY);
  };
}
