import { useDispatch, useSelector } from 'react-redux';
import {
  deactivateAllTokens,
  lockToken,
  setIsAnyTokenMoving,
  setTokenAlignmentData,
  setTokenDirection,
} from '../state/slices/playersSlice';
import { type TCoordinate } from '../types';
import { type TToken } from '../types';
import { ERRORS } from '../utils/errors';
import { areCoordsEqual } from '../game/coords/logic';
import { useCoordsToPosition } from './useCoordsToPosition';
import type { RootState } from '../gameStateStore';
import { setTokenTransitionTime } from '../utils/setTokenTransitionTime';
import { useCallback, useRef } from 'react';
import { BACKWARD_TOKEN_TRANSITION_TIME } from '../game/players/constants';
import { defaultTokenAlignmentData } from '../game/tokens/alignment';
import { TOKEN_SAFE_COORDINATES } from '../game/tokens/constants';
import { tokensWithCoord } from '../game/tokens/logic';
import { tokenPaths } from '../game/tokens/paths';

export function useCaptureTokenInSameCoord() {
  const dispatch = useDispatch();
  const getPosition = useCoordsToPosition();
  const players = useSelector((state: RootState) => state.players.players);
  const playersRef = useRef(players);
  playersRef.current = players;
  return useCallback(
    (token: TToken, latestCoord: TCoordinate): Promise<boolean> => {
      return new Promise((resolve) => {
        if (token.isLocked) throw new Error(ERRORS.lockedToken(token.colour, token.id));
        const allTokens = playersRef.current.flatMap((p) => p.tokens);

        if (TOKEN_SAFE_COORDINATES.find((c) => areCoordsEqual(c, latestCoord)))
          return resolve(false);

        const capturableToken = tokensWithCoord(latestCoord, allTokens).filter(
          (t) => t.colour !== token.colour
        )[0];
        if (!capturableToken) return resolve(false);

        dispatch(
          setTokenAlignmentData({
            colour: capturableToken.colour,
            id: capturableToken.id,
            newAlignmentData: defaultTokenAlignmentData,
          })
        );
        dispatch(
          setTokenAlignmentData({
            colour: token.colour,
            id: token.id,
            newAlignmentData: defaultTokenAlignmentData,
          })
        );
        dispatch(deactivateAllTokens(token.colour));
        const { colour, id, coordinates } = capturableToken;
        dispatch(setTokenDirection({ colour, id, isForward: false }));
        setTokenTransitionTime(BACKWARD_TOKEN_TRANSITION_TIME);
        dispatch(setIsAnyTokenMoving(true));

        const tokenPath = tokenPaths[colour];
        const tokenEl = document.getElementById(`${colour}_${id}`);
        if (!tokenEl) throw new Error(ERRORS.tokenDoesNotExist(colour, id));
        const initialCoordinateIndex = tokenPath.findIndex((v) => areCoordsEqual(v, coordinates));
        let i = initialCoordinateIndex;

        const handleTransitionEnd = () => {
          i--;
          if (i < 0) {
            dispatch(setIsAnyTokenMoving(false));
            dispatch(lockToken({ colour, id }));
            resolve(true);
            return tokenEl.removeEventListener('transitionend', handleTransitionEnd);
          }
          const { x, y } = getPosition(tokenPath[i], defaultTokenAlignmentData);
          tokenEl.style.transform = `translate(${x}, ${y})`;
        };
        // Trigger the first transition
        i--;
        const { x, y } = getPosition(tokenPath[i], defaultTokenAlignmentData);
        tokenEl.style.transform = `translate(${x}, ${y})`;

        tokenEl.addEventListener('transitionend', handleTransitionEnd);
      });
    },
    [dispatch, getPosition]
  );
}
