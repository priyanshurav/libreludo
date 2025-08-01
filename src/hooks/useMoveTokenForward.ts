import { useDispatch } from 'react-redux';
import {
  deactivateAllTokens,
  markTokenAsReachedHome,
  setIsAnyTokenMoving,
  setTokenDirection,
} from '../state/slices/playersSlice';
import { type TCoordinate } from '../types';
import { type TToken } from '../types';
import { ERRORS } from '../utils/errors';
import type { AppDispatch } from '../state/store';
import { areCoordsEqual } from '../game/coords/logic';
import { updateTokenPositionAndAlignmentThunk } from '../state/thunks/updateTokenPositionAndAlignmentThunk';
import { setTokenTransitionTime } from '../utils/setTokenTransitionTime';
import { useCallback } from 'react';
import { FORWARD_TOKEN_TRANSITION_TIME } from '../game/tokens/constants';
import { tokenPaths } from '../game/tokens/paths';

export type TMoveTokenCompletionData = {
  lastTokenCoord: TCoordinate;
  hasTokenReachedHome: boolean;
  moved: boolean;
};

export const useMoveTokenForward = () => {
  const dispatch = useDispatch<AppDispatch>();

  return useCallback(
    (diceNumber: number, token: TToken): Promise<TMoveTokenCompletionData> => {
      return new Promise((resolve) => {
        if (diceNumber < 0) throw new Error(ERRORS.numberOfStepsNegative());
        const { colour, id, coordinates, isLocked } = token;
        if (isLocked) throw new Error(ERRORS.lockedToken(colour, id));
        const tokenPath = tokenPaths[colour];

        dispatch(deactivateAllTokens(colour));
        dispatch(setTokenDirection({ colour, id, isForward: true }));
        setTokenTransitionTime(FORWARD_TOKEN_TRANSITION_TIME);
        dispatch(setIsAnyTokenMoving(true));
        const tokenEl = document.getElementById(`${colour}_${id}`);
        if (!tokenEl) throw new Error(ERRORS.tokenDoesNotExist(colour, id));
        const initialCoordinateIndex = tokenPath.findIndex((v) => areCoordsEqual(v, coordinates));
        let i = initialCoordinateIndex;
        let count = 0;

        const handleTransitionEnd = () => {
          const hasTokenReachedHome = areCoordsEqual(tokenPath[i], tokenPath[tokenPath.length - 1]);
          if (count >= diceNumber || hasTokenReachedHome) {
            if (hasTokenReachedHome) dispatch(markTokenAsReachedHome({ colour, id }));
            dispatch(setIsAnyTokenMoving(false));
            resolve({ lastTokenCoord: tokenPath[i], hasTokenReachedHome, moved: true });

            return tokenEl.removeEventListener('transitionend', handleTransitionEnd);
          }
          i++;
          count++;
          dispatch(updateTokenPositionAndAlignmentThunk({ colour, id, newCoords: tokenPath[i] }));
        };
        // Trigger the first transition
        i++;
        count++;
        dispatch(updateTokenPositionAndAlignmentThunk({ colour, id, newCoords: tokenPath[i] }));
        tokenEl.addEventListener('transitionend', handleTransitionEnd);
      });
    },
    [dispatch]
  );
};
