import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { deactivateAllTokens, setIsAnyTokenMoving } from '../../../../state/slices/playersSlice';
import { type TPlayer, type TPlayerColour, type TTokenClickData } from '../../../../types';
import { type TToken } from '../../../../types';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../state/store';
import TokenImage from '../../../../assets/token.svg?react';
import { useCoordsToPosition } from '../../../../hooks/useCoordsToPosition';
import { setTokenTransitionTime } from '../../../../utils/setTokenTransitionTime';
import { changeTurnThunk } from '../../../../state/thunks/changeTurnThunk';
import { useMoveAndCaptureToken } from '../../../../hooks/useMoveAndCaptureToken';
import { unlockAndAlignTokens } from '../../../../state/thunks/unlockAndAlignTokens';
import { playerColours } from '../../../../game/players/constants';
import { FORWARD_TOKEN_TRANSITION_TIME } from '../../../../game/tokens/constants';
import styles from './Token.module.css';
import clsx from 'clsx';
import { getTokenDOMId } from '../../../../game/tokens/logic';

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
  const [isCurrentlyFocused, setIsCurrentlyFocused] = useState(false);
  const tokenElRef = useRef<HTMLButtonElement | null>(null);
  const { numberOfConsecutiveSix, tokens: playerTokens } = useMemo(
    () => players.find((v) => v.colour === colour),
    [players, colour]
  ) as TPlayer;
  const token = useMemo(() => playerTokens.find((t) => t.id === id), [playerTokens, id]) as TToken;

  const { coordinates, isActive, isLocked, tokenAlignmentData } = token;

  const { scaleFactor } = tokenAlignmentData;
  const getPosition = useCoordsToPosition();
  const { x, y } = getPosition(coordinates, tokenAlignmentData);
  const diceNumber = useSelector((state: RootState) =>
    state.dice.dice.find((d) => d.colour === colour)
  )?.diceNumber;
  const moveAndCapture = useMoveAndCaptureToken();

  const unlock = () => {
    dispatch(setIsAnyTokenMoving(true));
    setTokenTransitionTime(FORWARD_TOKEN_TRANSITION_TIME, token);
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
    if ((diceNumber !== 6 || numberOfConsecutiveSix >= 3) && !isCaptured && !hasTokenReachedHome) {
      return dispatch(changeTurnThunk(moveAndCapture));
    }
  }, [diceNumber, dispatch, isActive, moveAndCapture, numberOfConsecutiveSix, token]);

  useEffect(() => {
    const prevClickData = tokenClickDataRef.current;
    const newTokenClickData = tokenClickData;

    if (!newTokenClickData || prevClickData?.timestamp === newTokenClickData.timestamp) return;
    tokenClickDataRef.current = newTokenClickData;

    if (newTokenClickData.colour === colour && newTokenClickData.id === id) executeTokenMove();
  }, [colour, executeTokenMove, id, tokenClickData]);

  const handleTokenClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (e.detail === 0) e.stopPropagation();
    if (isLocked && isActive && diceNumber !== -1 && diceNumber) unlock();
    tokenElRef.current?.blur?.();
    executeTokenMove();
  };

  return (
    <button
      id={getTokenDOMId(colour, id)}
      className={styles.token}
      tabIndex={isActive ? undefined : -1}
      onFocus={() => setIsCurrentlyFocused(true)}
      onBlur={() => setIsCurrentlyFocused(false)}
      ref={tokenElRef}
      onClick={handleTokenClick}
      style={
        {
          '--token-height': `${tokenHeight}px`,
          '--token-width': `${tokenWidth}px`,
          transform: `translate(${x}, ${y}) scale(${scaleFactor})`,
        } as React.CSSProperties
      }
    >
      <span className={clsx(styles.bouncer, { [styles.active]: isActive && !isCurrentlyFocused })}>
        <TokenImage
          className={styles.svg}
          aria-hidden="true"
          style={
            {
              '--fill-colour': playerColours[colour],
            } as React.CSSProperties
          }
        />
      </span>
    </button>
  );
}

export default Token;
