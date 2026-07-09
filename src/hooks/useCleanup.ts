import { useDispatch } from 'react-redux';
import { clearBoardState } from '../state/slices/boardSlice';
import { clearDiceState } from '../state/slices/diceSlice';
import { clearPlayersState } from '../state/slices/playersSlice';
import { clearSessionState } from '../state/slices/sessionSlice';
import { useCallback } from 'react';
import { tokenMotionRegistry } from '../game/movement/tokenMotionRegistry';

export function useCleanup() {
  const dispatch = useDispatch();
  return useCallback(() => {
    dispatch(clearPlayersState());
    dispatch(clearDiceState());
    dispatch(clearBoardState());
    dispatch(clearSessionState());
    tokenMotionRegistry.clear();
  }, [dispatch]);
}
