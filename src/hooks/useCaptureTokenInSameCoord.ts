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
import type { RootState } from '../state/store';
import { setTokenTransitionTime } from '../utils/setTokenTransitionTime';
import { useCallback, useRef } from 'react';
import { BACKWARD_TOKEN_TRANSITION_TIME } from '../game/tokens/constants';
import {
  applyAlignmentData,
  defaultTokenAlignmentData,
  getTokenAlignmentData,
} from '../game/tokens/alignment';
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
    (capturingToken: TToken, latestCoord: TCoordinate): Promise<boolean> => {
      return new Promise((resolve) => {
        if (capturingToken.isLocked)
          throw new Error(ERRORS.lockedToken(capturingToken.colour, capturingToken.id));
        const allTokens = playersRef.current.flatMap((p) => p.tokens);

        if (TOKEN_SAFE_COORDINATES.find((c) => areCoordsEqual(c, latestCoord)))
          return resolve(false);

        const capturableTokens = tokensWithCoord(latestCoord, allTokens).filter(
          (t) => t.colour !== capturingToken.colour
        );

        if (capturableTokens.length === 0) return resolve(false);

        const alignmentData = getTokenAlignmentData(capturableTokens.length);
        applyAlignmentData(capturableTokens, dispatch);
        dispatch(
          setTokenAlignmentData({
            colour: capturingToken.colour,
            id: capturingToken.id,
            newAlignmentData: defaultTokenAlignmentData,
          })
        );
        dispatch(deactivateAllTokens(capturingToken.colour));
        setTokenTransitionTime(BACKWARD_TOKEN_TRANSITION_TIME);
        dispatch(setIsAnyTokenMoving(true));

        capturableTokens.forEach((t, i) => {
          const { colour, id, coordinates } = t;
          dispatch(setTokenDirection({ colour, id, isForward: false }));

          const tokenPath = tokenPaths[colour];
          const tokenEl = document.getElementById(`${colour}_${id}`);
          if (!tokenEl) throw new Error(ERRORS.tokenDoesNotExist(colour, id));
          const initialCoordinateIndex = tokenPath.findIndex((v) => areCoordsEqual(v, coordinates));
          let index = initialCoordinateIndex;

          const handleTransitionEnd = () => {
            index--;
            if (index < 0) {
              dispatch(setIsAnyTokenMoving(false));
              dispatch(lockToken({ colour, id }));
              capturableTokens.forEach(({ colour, id }) => {
                dispatch(
                  setTokenAlignmentData({ colour, id, newAlignmentData: defaultTokenAlignmentData })
                );
              });
              tokenEl.removeEventListener('transitionend', handleTransitionEnd);
              return resolve(true);
            }
            const { x, y } = getPosition(tokenPath[index], alignmentData[i]);
            tokenEl.style.transform = `translate(${x}, ${y})`;
          };
          // Trigger the first transition
          index--;
          const { x, y } = getPosition(tokenPath[index], alignmentData[i]);
          tokenEl.style.transform = `translate(${x}, ${y})`;

          tokenEl.addEventListener('transitionend', handleTransitionEnd);
        });
      });
    },
    [dispatch, getPosition]
  );
}
