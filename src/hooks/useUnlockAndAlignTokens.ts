import { useCallback } from 'react';
import { applyAlignmentData } from '../game/tokens/alignment';
import { TOKEN_START_COORDINATES } from '../game/tokens/constants';
import { tokensWithCoord } from '../game/tokens/logic';
import { unlockToken } from '../state/slices/playersSlice';
import type { TTokenColourAndId } from '../types';
import { useDispatch, useStore } from 'react-redux';
import type { AppDispatch, RootState } from '../state/store';

export const useUnlockAndAlignTokens = () => {
  const dispatch = useDispatch<AppDispatch>();
  const store = useStore<RootState>();
  return useCallback(
    ({ colour, id }: TTokenColourAndId) => {
      dispatch(unlockToken({ colour, id }));
      const players = store.getState().players.players;
      const tokenStartCoord = TOKEN_START_COORDINATES[colour];
      const tokensInStartCoord = tokensWithCoord(tokenStartCoord, players);
      if (tokensInStartCoord.length !== 0) applyAlignmentData(tokensInStartCoord, dispatch);
    },
    [dispatch, store]
  );
};
