import { useDispatch, useSelector } from 'react-redux';
import {
  deactivateAllTokens,
  lockToken,
  setIsAnyTokenMoving,
  setTokenAlignmentData,
} from '../state/slices/playersSlice';
import { type TCoordinate } from '../types';
import { type TToken } from '../types';
import { ERRORS } from '../utils/errors';
import { areCoordsEqual } from '../game/coords/logic';
import { useCoordsToPosition } from './useCoordsToPosition';
import type { RootState } from '../state/store';
import { setTokenTransitionTime } from '../utils/setTokenTransitionTime';
import { useCallback, useEffect, useRef } from 'react';
import {
  BACKWARD_TOKEN_TRANSITION_TIME,
  FORWARD_TOKEN_TRANSITION_TIME,
} from '../game/tokens/constants';
import { defaultTokenAlignmentData } from '../game/tokens/alignment';
import { TOKEN_SAFE_COORDINATES } from '../game/tokens/constants';
import { tokensWithCoord } from '../game/tokens/logic';
import { tokenPaths } from '../game/tokens/paths';
import { sleep } from '../utils/sleep';

export function useCaptureTokenInSameCoord() {
  const dispatch = useDispatch();
  const getPosition = useCoordsToPosition();
  const players = useSelector((state: RootState) => state.players.players);
  const playersRef = useRef(players);
  useEffect(() => {
    playersRef.current = players;
  }, [players]);
  return useCallback(
    (capturingToken: TToken, latestCoord: TCoordinate): Promise<boolean> => {
      return new Promise((resolve) => {
        if (capturingToken.isLocked)
          throw new Error(ERRORS.lockedToken(capturingToken.colour, capturingToken.id));
        const players = playersRef.current;

        if (TOKEN_SAFE_COORDINATES.find((c) => areCoordsEqual(c, latestCoord)))
          return resolve(false);

        const capturableTokens = tokensWithCoord(latestCoord, players).filter(
          (t) => t.colour !== capturingToken.colour
        );

        if (capturableTokens.length === 0) return resolve(false);

        capturableTokens.forEach(({ colour, id }) => {
          dispatch(
            setTokenAlignmentData({ colour, id, newAlignmentData: defaultTokenAlignmentData })
          );
        });
        dispatch(
          setTokenAlignmentData({
            colour: capturingToken.colour,
            id: capturingToken.id,
            newAlignmentData: defaultTokenAlignmentData,
          })
        );
        dispatch(deactivateAllTokens(capturingToken.colour));
        dispatch(setIsAnyTokenMoving(true));
        let isFirstCapture = true;
        let tokensSuccessfullyCaptured = 0;
        (async () => {
          for (const t of capturableTokens) {
            const { colour, id, coordinates } = t;
            setTokenTransitionTime(BACKWARD_TOKEN_TRANSITION_TIME, t);
            const tokenPath = tokenPaths[colour];
            const tokenEl = document.getElementById(`${colour}_${id}`);
            if (!tokenEl) throw new Error(ERRORS.tokenDoesNotExist(colour, id));
            const initialCoordinateIndex = tokenPath.findIndex((v) =>
              areCoordsEqual(v, coordinates)
            );
            let index = initialCoordinateIndex;

            const handleTransitionEnd = () => {
              index--;
              if (index < 0) {
                dispatch(setIsAnyTokenMoving(false));
                setTokenTransitionTime(FORWARD_TOKEN_TRANSITION_TIME, t);
                dispatch(lockToken({ colour, id }));
                tokenEl.removeEventListener('transitionend', handleTransitionEnd);
                tokensSuccessfullyCaptured++;
                if (tokensSuccessfullyCaptured === capturableTokens.length) resolve(true);
                return;
              }
              const { x, y } = getPosition(tokenPath[index], defaultTokenAlignmentData);
              tokenEl.style.transform = `translate(${x}, ${y})`;
            };
            // Trigger the first transition
            if (isFirstCapture) isFirstCapture = false;
            else await sleep(250);
            index--;
            const { x, y } = getPosition(tokenPath[index], defaultTokenAlignmentData);
            tokenEl.style.transform = `translate(${x}, ${y})`;
            tokenEl.addEventListener('transitionend', handleTransitionEnd);
          }
        })();
      });
    },
    [dispatch, getPosition]
  );
}
