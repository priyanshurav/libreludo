import { type AppDispatch, type RootState } from './../state/store';
import { useDispatch, useStore } from 'react-redux';
import { useMoveAndCaptureToken } from './useMoveAndCaptureToken';
import { selectBestTokenForBot } from '../game/bot/selectBestTokenForBot';
import { FORWARD_TOKEN_TRANSITION_TIME } from '../game/tokens/constants';
import { changeTurn, deactivateAllTokens } from '../state/slices/playersSlice';
import { setTokenTransitionTime } from '../utils/setTokenTransitionTime';
import { useCallback, useEffect, useRef } from 'react';
import { useHandlePostDiceRoll } from './useHandlePostDiceRoll';
import { useRollDice } from './useRollDice';
import { useUnlockAndAlignTokens } from './useUnlockAndAlignTokens';
import { useGameStorage } from './useGameStorage';

export const useChangeTurn = () => {
  const store = useStore<RootState>();
  const dispatch = useDispatch<AppDispatch>();
  const moveAndCapture = useMoveAndCaptureToken();
  const unlockAndAlignTokens = useUnlockAndAlignTokens();
  const handlePostDiceRoll = useHandlePostDiceRoll();
  const { saveState } = useGameStorage();
  const rollDice = useRollDice();
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const timeoutIds = timeoutRefs.current;
    return () => {
      timeoutIds.forEach(clearTimeout);
    };
  }, []);

  return useCallback(
    function changeTurnFn() {
      const state = store.getState();
      if (state.players.isGameEnded || state.players.players.length === 0) return;

      dispatch(changeTurn());
      saveState();
      const { currentPlayerColour, players } = store.getState().players;

      const { colour, isBot } = players.find((p) => p.colour === currentPlayerColour) ?? {};

      if (!isBot || !colour) return;

      const handleDiceRoll = async (diceNumber: number) => {
        const { moveData: autoMoveData, shouldChangeTurn } =
          (await handlePostDiceRoll(colour, diceNumber)) ?? {};

        dispatch(deactivateAllTokens(colour));

        if (shouldChangeTurn) return changeTurnFn();

        const { players } = store.getState().players;

        const allTokens = players.flatMap((p) => p.tokens);
        if (autoMoveData) {
          const { hasTokenReachedHome, isCaptured } = autoMoveData;
          if (!isCaptured && !hasTokenReachedHome && diceNumber !== 6) {
            return timeoutRefs.current.push(setTimeout(() => changeTurnFn(), 1000));
          } else {
            return timeoutRefs.current.push(
              setTimeout(() => rollDice(colour, handleDiceRoll), 1000)
            );
          }
        }

        const bestToken = selectBestTokenForBot(colour, diceNumber, allTokens);
        if (!bestToken) return changeTurnFn();

        setTokenTransitionTime(FORWARD_TOKEN_TRANSITION_TIME, bestToken);

        if (bestToken.isLocked && !bestToken.hasTokenReachedHome && diceNumber === 6) {
          unlockAndAlignTokens({ colour, id: bestToken.id });
          saveState();
          return timeoutRefs.current.push(setTimeout(() => rollDice(colour, handleDiceRoll), 1000));
        }
        const moveData = await moveAndCapture(bestToken, diceNumber);
        if (!moveData) return changeTurnFn();
        const { hasTokenReachedHome, isCaptured, hasPlayerWon } = moveData;
        if (hasPlayerWon) {
          return timeoutRefs.current.push(setTimeout(() => changeTurnFn(), 1000));
        }
        if (!isCaptured && !hasTokenReachedHome && diceNumber !== 6) {
          return timeoutRefs.current.push(setTimeout(() => changeTurnFn(), 1000));
        } else {
          return timeoutRefs.current.push(setTimeout(() => rollDice(colour, handleDiceRoll), 1000));
        }
      };
      rollDice(colour, handleDiceRoll);
    },
    [dispatch, handlePostDiceRoll, moveAndCapture, rollDice, saveState, store, unlockAndAlignTokens]
  );
};
