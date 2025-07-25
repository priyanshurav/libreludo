import { useDispatch } from 'react-redux';
import { clearBoardState } from '../state/slices/boardSlice';
import { clearDiceState } from '../state/slices/diceSlice';
import { clearPlayersState } from '../state/slices/playersSlice';

export function useCleanup() {
  const dispatch = useDispatch();
  return () => {
    dispatch(clearPlayersState());
    dispatch(clearDiceState());
    dispatch(clearBoardState());
  };
}
