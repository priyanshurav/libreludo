import { useDispatch } from 'react-redux';
import { clearBoardState } from '../state/slices/boardSlice';
import { clearDiceState } from '../state/slices/diceSlice';
import { clearPlayersState } from '../state/slices/playersSlice';
import { useCallback } from 'react';

export function useCleanup() {
  const dispatch = useDispatch();
  return useCallback(() => {
    dispatch(clearPlayersState());
    dispatch(clearDiceState());
    dispatch(clearBoardState());
  }, [dispatch]);
}
