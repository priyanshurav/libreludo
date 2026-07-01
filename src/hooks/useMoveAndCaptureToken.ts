import { useDispatch, useStore } from 'react-redux';
import {
  deactivateAllTokens,
  getToken,
  lockToken,
  markTokenAsReachedHome,
} from '../state/slices/playersSlice';
import { type TToken } from '../types';
import { useCaptureTokenInSameCoord } from './useCaptureTokenInSameCoord';
import { useMoveTokenForward } from './useMoveTokenForward';
import type { TMoveData } from '../types/tokens';
import { getAvailableSteps } from '../game/tokens/logic';
import { useCallback } from 'react';
import { calculateSequence } from '../game/movement/calculateSequence';
import { type RootState } from '../state/store';
import { ERRORS } from '../utils/errors';
import { saveState } from '../game/storage/saveState';

export function useMoveAndCaptureToken() {
  const moveToken = useMoveTokenForward();
  const captureToken = useCaptureTokenInSameCoord();
  const dispatch = useDispatch();
  const store = useStore<RootState>();
  return useCallback(
    async (token: TToken, diceNumber: number): Promise<TMoveData | null> => {
      if (diceNumber < 0) throw new Error(ERRORS.numberOfStepsNegative());
      if (getAvailableSteps(token) < diceNumber) {
        dispatch(deactivateAllTokens(token.colour));
        return null;
      }
      const { nextState, moveSequence, captureData } = calculateSequence(
        store.getState(),
        token,
        diceNumber
      );
      saveState(nextState);
      await moveToken(moveSequence, token);
      if (moveSequence.length === 0) return null;
      await captureToken(captureData, token);
      const { colour, id, hasTokenReachedHome } = getToken(
        nextState.players,
        token.colour,
        token.id
      );
      const hasPlayerWon = nextState.players.players
        .find((p) => p.colour === token.colour)!
        .tokens.every((t) => t.hasTokenReachedHome);
      captureData.forEach((d) => {
        const { colour, id } = d.token;
        dispatch(lockToken({ colour, id }));
      });
      if (hasTokenReachedHome) dispatch(markTokenAsReachedHome({ colour, id }));
      return {
        isCaptured: captureData.length !== 0,
        hasTokenReachedHome,
        hasPlayerWon,
      };
    },
    [captureToken, dispatch, moveToken, store]
  );
}
