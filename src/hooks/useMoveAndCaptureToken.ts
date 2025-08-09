import { useDispatch } from 'react-redux';
import { deactivateAllTokens } from '../state/slices/playersSlice';
import { type TToken } from '../types';
import { useCaptureTokenInSameCoord } from './useCaptureTokenInSameCoord';
import { useMoveTokenForward } from './useMoveTokenForward';
import type { TMoveData } from '../types/tokens';
import { getAvailableSteps } from '../game/tokens/logic';

export function useMoveAndCaptureToken() {
  const moveToken = useMoveTokenForward();
  const captureToken = useCaptureTokenInSameCoord();
  const dispatch = useDispatch();
  return async (token: TToken, diceNumber: number): Promise<TMoveData | null> => {
    if (getAvailableSteps(token) < diceNumber) {
      dispatch(deactivateAllTokens(token.colour));
      console.log(new Error('Invalid move'));
      return null;
    }

    const { hasTokenReachedHome, lastTokenCoord, hasPlayerWon, moved } = await moveToken(
      diceNumber,
      token
    );
    if (!moved) return null;
    const isCaptured = await captureToken(token, lastTokenCoord);
    return { isCaptured, hasTokenReachedHome, hasPlayerWon };
  };
}
