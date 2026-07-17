import { useCallback } from 'react';
import type { TPlayerColour } from '../types';
import { selectBestTokenForBot } from '../game/bot/selectBestTokenForBot';
import { saveState } from '../game/storage/saveState';
import { type RootState } from '../state/store';
import { useStore } from 'react-redux';
import { useMoveAndCaptureToken } from './useMoveAndCaptureToken';
import { useRollDice } from './useRollDice';
import { useUnlockAndAlignTokens } from './useUnlockAndAlignTokens';
import { useChangeTurn } from './useChangeTurn';
import { sleep } from '../utils/sleep';
import { logError } from '../utils/logError';

export const useExecuteBotMove = () => {
  const store = useStore<RootState>();
  const moveAndCapture = useMoveAndCaptureToken();
  const unlockAndAlignTokens = useUnlockAndAlignTokens();
  const rollDice = useRollDice();
  const changeTurnFn = useChangeTurn();

  return useCallback(
    async function executeBotMove(colour: TPlayerColour, diceNumber: number) {
      try {
        const allTokens = store.getState().players.players.flatMap((p) => p.tokens);
        const bestToken = selectBestTokenForBot(colour, diceNumber, allTokens);
        if (!bestToken) return changeTurnFn();

        if (bestToken.isLocked && !bestToken.hasTokenReachedHome && diceNumber === 6) {
          unlockAndAlignTokens({ colour, id: bestToken.id });
          saveState(store.getState());
          await sleep(500);
          return executeBotMove(colour, await rollDice(colour));
        }
        const moveData = await moveAndCapture(bestToken, diceNumber);
        if (!moveData) return changeTurnFn();
        const { hasTokenReachedHome, isCaptured, hasPlayerWon } = moveData;
        if (hasPlayerWon) {
          await sleep(500);
          return changeTurnFn();
        }
        if (!isCaptured && !hasTokenReachedHome && diceNumber !== 6) {
          await sleep(500);
          return changeTurnFn();
        } else {
          await sleep(500);
          return executeBotMove(colour, await rollDice(colour));
        }
      } catch (e) {
        logError('useExecuteBotMove')(e);
        changeTurnFn();
      }
    },
    [changeTurnFn, moveAndCapture, unlockAndAlignTokens, store, rollDice]
  );
};
