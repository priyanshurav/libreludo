import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  deactivateAllTokens,
  setIsAnyTokenMoving,
  setTokenDirection,
} from '../../../../state/slices/playersSlice';
import { type TPlayer, type TPlayerColour, type TTokenClickData } from '../../../../types';
import { type TToken } from '../../../../types';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../state/store';
import TokenImage from '../../../../assets/token.svg?react';
import './Token.css';
import { useCoordsToPosition } from '../../../../hooks/useCoordsToPosition';
import { setTokenTransitionTime } from '../../../../utils/setTokenTransitionTime';
import { changeTurnThunk } from '../../../../state/thunks/changeTurnThunk';
import { useMoveAndCaptureToken } from '../../../../hooks/useMoveAndCaptureToken';
import { unlockAndAlignTokens } from '../../../../state/thunks/unlockAndAlignTokens';
import { playerColours } from '../../../../game/players/constants';
import { FORWARD_TOKEN_TRANSITION_TIME } from '../../../../game/tokens/constants';

type Props = {
  colour: TPlayerColour;
  id: number;
  tokenClickData: TTokenClickData | null;
};

function Token({ colour, id, tokenClickData }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { tokenHeight, tokenWidth } = useSelector((state: RootState) => state.board);
  const { players } = useSelector((state: RootState) => state.players);
  const tokenClickDataRef = useRef(tokenClickData);
  const player = useMemo(
    () => players.find((v) => v.colour === colour),
    [players, colour]
  ) as TPlayer;
  const token = useMemo(
    () => player.tokens.find((t) => t.id === id),
    [player.tokens, id]
  ) as TToken;

  const { coordinates, isActive, isLocked, tokenAlignmentData, isDirectionForward } = token;

  const { scaleFactor } = tokenAlignmentData;
  const getPosition = useCoordsToPosition();
  const { x, y } = getPosition(coordinates, tokenAlignmentData);
  const diceNumber = useSelector((state: RootState) =>
    state.dice.find((d) => d.colour === colour)
  )?.diceNumber;
  const moveAndCapture = useMoveAndCaptureToken();

  const unlock = () => {
    if (!isLocked || !isActive || diceNumber === -1 || !diceNumber) return;
    dispatch(setIsAnyTokenMoving(true));
    dispatch(setTokenDirection({ colour, id, isForward: true }));
    setTokenTransitionTime(FORWARD_TOKEN_TRANSITION_TIME);
    dispatch(unlockAndAlignTokens({ colour, id }));
    dispatch(deactivateAllTokens(colour));
    setTimeout(() => {
      dispatch(setIsAnyTokenMoving(false));
    }, FORWARD_TOKEN_TRANSITION_TIME);
  };

  const executeTokenMove = useCallback(async () => {
    if (!isActive || diceNumber === -1 || !diceNumber) return;

    const moveData = await moveAndCapture(token, diceNumber);
    if (!moveData) return;
    const { hasTokenReachedHome, isCaptured, hasPlayerWon } = moveData;
    if (hasPlayerWon) return dispatch(changeTurnThunk(moveAndCapture));
    if (
      (diceNumber !== 6 || player?.numberOfConsecutiveSix >= 3) &&
      !isCaptured &&
      !hasTokenReachedHome
    ) {
      return dispatch(changeTurnThunk(moveAndCapture));
    }
  }, [diceNumber, dispatch, isActive, moveAndCapture, player?.numberOfConsecutiveSix, token]);

  useEffect(() => {
    const prevClickData = tokenClickDataRef.current;
    const newTokenClickData = tokenClickData;

    if (!newTokenClickData || prevClickData?.timestamp === newTokenClickData.timestamp) return;
    tokenClickDataRef.current = newTokenClickData;

    if (newTokenClickData.colour === colour && newTokenClickData.id === id) executeTokenMove();
  }, [colour, executeTokenMove, id, tokenClickData]);

  return (
    <div
      id={`${colour}_${id}`}
      className={`token ${isDirectionForward ? '' : 'backward'} `}
      onClick={unlock}
      style={
        {
          '--token-height': `${tokenHeight}px`,
          '--token-width': `${tokenWidth}px`,
          transform: `translate(${x}, ${y}) scale(${scaleFactor})`,
        } as React.CSSProperties
      }
    >
      <TokenImage
        className={`${isActive ? 'active' : ''}`}
        style={
          {
            '--fill-colour': playerColours[colour],
          } as React.CSSProperties
        }
      />
    </div>
  );
}

export default Token;
