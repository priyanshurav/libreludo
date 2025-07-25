import {
  activateTokens,
  deactivateAllTokens,
  incrementNumberOfConsecutiveSix,
  resetNumberOfConsecutiveSix,
} from '../slices/playersSlice';
import { type TPlayerColour } from '../../types';
import type { AppDispatch, RootState } from '../../gameStateStore';
import { areCoordsEqual } from '../../utils/areCoordsEqual';
import { changeTurnThunk } from './changeTurnThunk';
import type { useMoveAndCaptureToken } from '../../hooks/useMoveAndCaptureToken';
import type { TMoveData } from '../../types/tokens';
import { sleep } from '../../utils/sleep';
import { getOnlyTokenMovable, isAnyTokenActiveOfColour } from '../../game/tokens/logic';

export const handlePostDiceRollThunk = (
  colour: TPlayerColour,
  diceNumber: number,
  moveAndCapture: ReturnType<typeof useMoveAndCaptureToken>
) => {
  return async (
    dispatch: AppDispatch,
    getState: () => RootState
  ): Promise<{ shouldContinue: boolean; moveData: TMoveData }> => {
    if (getState().players.isGameEnded) return;
    if (diceNumber === 6) dispatch(incrementNumberOfConsecutiveSix(colour));
    else dispatch(resetNumberOfConsecutiveSix(colour));

    dispatch(activateTokens({ all: diceNumber === 6, colour, diceNumber }));
    const players = getState().players.players;
    const player = players.find((p) => p.colour === colour);

    if (player?.numberOfConsecutiveSix === 3) {
      dispatch(resetNumberOfConsecutiveSix(colour));
      dispatch(deactivateAllTokens(colour));
      if (player.isBot) await sleep(500);
      dispatch(changeTurnThunk(moveAndCapture));
      return { moveData: null, shouldContinue: false };
    }

    const areUnlockableTokensPresent =
      diceNumber === 6 && player.tokens.some((t) => areCoordsEqual(t.coordinates, t.initialCoords));

    if (areUnlockableTokensPresent) return { shouldContinue: true, moveData: null };

    const unlockedTokens = player.tokens.filter((t) => !t.isLocked);

    const areAllTokensInSameCoord =
      unlockedTokens.length === 0
        ? false
        : unlockedTokens.every((t) => areCoordsEqual(unlockedTokens[0].coordinates, t.coordinates));

    const onlyTokenActive = getOnlyTokenMovable(colour, diceNumber, players);

    if (onlyTokenActive || areAllTokensInSameCoord) {
      const token = onlyTokenActive ? onlyTokenActive : unlockedTokens[0];
      const moveData = await moveAndCapture(token, diceNumber);
      if (!moveData) {
        if (player.isBot) await sleep(500);
        dispatch(changeTurnThunk(moveAndCapture));

        return { shouldContinue: false, moveData };
      }
      const { hasTokenReachedHome, isCancelled } = moveData;
      if (!hasTokenReachedHome && !isCancelled && diceNumber !== 6 && !player.isBot) {
        dispatch(changeTurnThunk(moveAndCapture));
      }
      return { shouldContinue: true, moveData };
    }
    if (!isAnyTokenActiveOfColour(colour, players)) {
      if (player.isBot) await sleep(500);
      dispatch(changeTurnThunk(moveAndCapture));
      return { shouldContinue: false, moveData: null };
    }
    return { shouldContinue: true, moveData: null };
  };
};
