import { type AppDispatch, type RootState } from './../state/store';
import { useDispatch, useStore } from 'react-redux';
import { changeTurn } from '../state/slices/playersSlice';
import { useCallback } from 'react';
import { saveState } from '../game/storage/saveState';

export const useChangeTurn = () => {
  const store = useStore<RootState>();
  const dispatch = useDispatch<AppDispatch>();

  return useCallback(() => {
    const state = store.getState();
    if (state.players.isGameEnded || state.players.players.length === 0) return;
    dispatch(changeTurn());
    saveState(store.getState());
  }, [dispatch, store]);
};
