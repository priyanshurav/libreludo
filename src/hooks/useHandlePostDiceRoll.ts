import { useDispatch, useStore } from 'react-redux';
import type { AppDispatch, RootState } from '../state/store';
import { areCoordsEqual } from '../game/coords/logic';
import { isTokenMovable, isAnyTokenActiveOfColour } from '../game/tokens/logic';
import {
  incrementNumberOfConsecutiveSix,
  resetNumberOfConsecutiveSix,
  activateTokens,
  deactivateAllTokens,
} from '../state/slices/playersSlice';
import type { TMoveData, TPlayerColour } from '../types';
import { useMoveAndCaptureToken } from './useMoveAndCaptureToken';
import { useCallback } from 'react';
import { saveState } from '../game/storage/saveState';
import { useUnlockAndAlignTokens } from './useUnlockAndAlignTokens';

export const useHandlePostDiceRoll = () => {
  const store = useStore<RootState>();
  const dispatch = useDispatch<AppDispatch>();
  const moveAndCapture = useMoveAndCaptureToken();
  const unlockToken = useUnlockAndAlignTokens();
  return useCallback(
    async (
      colour: TPlayerColour,
      diceNumber: number
    ): Promise<{
      shouldChangeTurn: boolean;
      moveData: TMoveData | null;
    } | null> => {
      if (store.getState().players.isGameEnded) return null;
      if (diceNumber === 6) dispatch(incrementNumberOfConsecutiveSix(colour));
      else dispatch(resetNumberOfConsecutiveSix(colour));

      dispatch(activateTokens({ all: diceNumber === 6, colour, diceNumber }));
      saveState(store.getState());
      const players = store.getState().players.players;
      const player = players.find((p) => p.colour === colour);
      if (!player) return null;

      if (player.numberOfConsecutiveSix === 3) {
        dispatch(resetNumberOfConsecutiveSix(colour));
        dispatch(deactivateAllTokens(colour));
        return { moveData: null, shouldChangeTurn: true };
      }

      const lockedTokens = player.tokens.filter((t) =>
        areCoordsEqual(t.coordinates, t.initialCoords)
      );
      const areUnlockableTokensPresent = diceNumber === 6 && lockedTokens.length !== 0;

      const movableTokens = player.tokens.filter((t) => isTokenMovable(t, diceNumber));

      if (diceNumber === 6 && lockedTokens.length === 1 && movableTokens.length === 0) {
        unlockToken({ colour: lockedTokens[0].colour, id: lockedTokens[0].id });
        dispatch(deactivateAllTokens(lockedTokens[0].colour));
        return { moveData: null, shouldChangeTurn: false };
      }

      if (areUnlockableTokensPresent) return { moveData: null, shouldChangeTurn: false };

      const areAllTokensInSameCoord =
        movableTokens.length === 0
          ? false
          : movableTokens.every((t) => areCoordsEqual(movableTokens[0].coordinates, t.coordinates));

      if (areAllTokensInSameCoord) {
        const moveData = await moveAndCapture(movableTokens[0], diceNumber);
        if (!moveData) {
          return { moveData, shouldChangeTurn: true };
        }
        const { hasTokenReachedHome, isCaptured, hasPlayerWon } = moveData;
        if (hasPlayerWon) {
          return { moveData: null, shouldChangeTurn: true };
        }
        if (!hasTokenReachedHome && !isCaptured && diceNumber !== 6) {
          return { moveData: null, shouldChangeTurn: true };
        }
        return { moveData, shouldChangeTurn: false };
      }
      if (!isAnyTokenActiveOfColour(colour, players)) {
        return { moveData: null, shouldChangeTurn: true };
      }
      return { moveData: null, shouldChangeTurn: false };
    },
    [dispatch, moveAndCapture, store, unlockToken]
  );
};
