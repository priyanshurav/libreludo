import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  deactivateAllTokens,
  getToken,
  setIsAnyTokenMoving,
} from '../../../../state/slices/playersSlice';
import { type TPlayer, type TPlayerColour, type TTokenClickData } from '../../../../types';
import { type TToken } from '../../../../types';
import { useDispatch, useSelector, useStore } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../state/store';
import TokenImage from '../../../../assets/token.svg?react';
import { useCoordsToPosition } from '../../../../hooks/useCoordsToPosition';
import { useMoveAndCaptureToken } from '../../../../hooks/useMoveAndCaptureToken';
import { playerColours } from '../../../../game/players/constants';
import { transitionStates } from '../../../../game/tokens/constants';
import styles from './Token.module.css';
import clsx from 'clsx';
import { getGloballyUniqueTokenId } from '../../../../game/tokens/logic';
import { useChangeTurn } from '../../../../hooks/useChangeTurn';
import { useUnlockAndAlignTokens } from '../../../../hooks/useUnlockAndAlignTokens';
import { saveState } from '../../../../game/storage/saveState';
import { animate, motion, useMotionValue } from 'framer-motion';
import { tokenMotionRegistry } from '../../../../game/movement/tokenMotionRegistry';

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
  const changeTurnFn = useChangeTurn();
  const unlockAndAlignTokens = useUnlockAndAlignTokens();
  const store = useStore<RootState>();
  const isExternallyAnimating = useRef(false);
  const { numberOfConsecutiveSix, tokens: playerTokens } = useMemo(
    () => players.find((v) => v.colour === colour),
    [players, colour]
  ) as TPlayer;
  const token = useMemo(() => playerTokens.find((t) => t.id === id), [playerTokens, id]) as TToken;

  const { coordinates, isActive, isLocked, tokenAlignmentData, direction } = token;

  const { scaleFactor } = tokenAlignmentData;
  const getPosition = useCoordsToPosition();
  const { x, y } = getPosition(coordinates, tokenAlignmentData);
  const diceNumber = useSelector((state: RootState) =>
    state.dice.dice.find((d) => d.colour === colour)
  )?.diceNumber;
  const moveAndCapture = useMoveAndCaptureToken();
  const motionX = useMotionValue<number>(x);
  const motionY = useMotionValue<number>(y);

  useEffect(() => {
    if (isExternallyAnimating.current) return;
    Promise.all([
      animate(motionX, x, {
        duration: direction ? transitionStates[direction].durationMs / 1000 : 0,
        ease: direction ? transitionStates[direction].timingFn : undefined,
      }),
      animate(motionY, y, {
        duration: direction ? transitionStates[direction].durationMs / 1000 : 0,
        ease: direction ? transitionStates[direction].timingFn : undefined,
      }),
    ]);
  }, [direction, motionX, motionY, x, y]);
  useEffect(() => {
    tokenMotionRegistry.set(getGloballyUniqueTokenId(colour, id), {
      x: motionX,
      y: motionY,
      setExternallyAnimating: (v) => {
        isExternallyAnimating.current = v;
      },
      animateTo: (x, y, transition) =>
        Promise.all([animate(motionX, x, transition), animate(motionY, y, transition)]).then(
          () => {}
        ),
    });
    return () => {
      tokenMotionRegistry.delete(getGloballyUniqueTokenId(colour, id));
    };
  }, [colour, id, motionX, motionY]);

  const unlock = async () => {
    dispatch(setIsAnyTokenMoving(true));
    unlockAndAlignTokens({ colour, id });
    dispatch(deactivateAllTokens(colour));
    const updatedToken = getToken(store.getState().players, colour, id);
    const { x: targetX, y: targetY } = getPosition(
      updatedToken.coordinates,
      updatedToken.tokenAlignmentData
    );
    const entry = tokenMotionRegistry.get(getGloballyUniqueTokenId(colour, id));
    if (!entry) return;
    entry.setExternallyAnimating(true);
    await entry.animateTo(targetX, targetY, {
      duration: transitionStates.forward.durationMs / 1000,
      ease: transitionStates.forward.timingFn,
    });
    entry.setExternallyAnimating(false);
    dispatch(setIsAnyTokenMoving(false));
    saveState(store.getState());
  };

  const executeTokenMove = useCallback(async () => {
    if (!isActive || diceNumber === -1 || !diceNumber || isLocked) return;

    const moveData = await moveAndCapture(token, diceNumber);
    if (!moveData) return;
    const { hasTokenReachedHome, isCaptured, hasPlayerWon } = moveData;
    if (hasPlayerWon) return changeTurnFn();
    if ((diceNumber !== 6 || numberOfConsecutiveSix >= 3) && !isCaptured && !hasTokenReachedHome) {
      return changeTurnFn();
    }
    saveState(store.getState());
  }, [
    changeTurnFn,
    diceNumber,
    isActive,
    isLocked,
    moveAndCapture,
    numberOfConsecutiveSix,
    store,
    token,
  ]);

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
    <motion.button
      id={getGloballyUniqueTokenId(colour, id)}
      className={styles.token}
      tabIndex={isActive ? undefined : -1}
      onFocus={() => setIsCurrentlyFocused(true)}
      onBlur={() => setIsCurrentlyFocused(false)}
      disabled={!isActive}
      onClick={handleTokenClick}
      ref={tokenElRef}
      animate={{ scale: scaleFactor }}
      transition={{
        duration: direction ? transitionStates[direction].durationMs / 1000 : 0,
        ease: direction ? transitionStates[direction].timingFn : undefined,
      }}
      style={{
        height: tokenHeight,
        width: tokenWidth,
        x: motionX,
        y: motionY,
      }}
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
    </motion.button>
  );
}

export default Token;
