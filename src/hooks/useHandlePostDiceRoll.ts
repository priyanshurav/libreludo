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
import { sleep } from '../utils/sleep';
import { useMoveAndCaptureToken } from './useMoveAndCaptureToken';
import { useCallback } from 'react';
import { saveState } from '../game/storage/saveState';

export const useHandlePostDiceRoll = () => {
  const store = useStore<RootState>();
  const dispatch = useDispatch<AppDispatch>();
  const moveAndCapture = useMoveAndCaptureToken();
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
        if (player.isBot) await sleep(500);
        return { moveData: null, shouldChangeTurn: true };
      }

      const areUnlockableTokensPresent =
        diceNumber === 6 &&
        player.tokens.some((t) => areCoordsEqual(t.coordinates, t.initialCoords));

      if (areUnlockableTokensPresent) return { moveData: null, shouldChangeTurn: false };

      const movableTokens = player.tokens.filter((t) => isTokenMovable(t, diceNumber));

      const areAllTokensInSameCoord =
        movableTokens.length === 0
          ? false
          : movableTokens.every((t) => areCoordsEqual(movableTokens[0].coordinates, t.coordinates));

      if (areAllTokensInSameCoord) {
        const moveData = await moveAndCapture(movableTokens[0], diceNumber);
        if (!moveData) {
          if (player.isBot) await sleep(500);
          return { moveData, shouldChangeTurn: true };
        }
        const { hasTokenReachedHome, isCaptured, hasPlayerWon } = moveData;
        if (hasPlayerWon) {
          return { moveData: null, shouldChangeTurn: true };
        }
        if (!hasTokenReachedHome && !isCaptured && diceNumber !== 6 && !player.isBot) {
          return { moveData: null, shouldChangeTurn: true };
        }
        return { moveData, shouldChangeTurn: false };
      }
      if (!isAnyTokenActiveOfColour(colour, players)) {
        if (player.isBot) await sleep(500);
        return { moveData: null, shouldChangeTurn: true };
      }
      return { moveData: null, shouldChangeTurn: false };
    },
    [dispatch, moveAndCapture, store]
  );
};
