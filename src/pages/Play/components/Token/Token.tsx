import React, { useEffect, useMemo, useState } from 'react';
import {
  deactivateAllTokens,
  setIsAnyTokenMoving,
  setTokenDirection,
} from '../../../../state/slices/playersSlice';
import { type TPlayer, type TPlayerColour } from '../../../../types';
import { type TToken } from '../../../../types';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../state/store';
import TokenImage from '../../../../assets/token.svg?react';
import './Token.css';
import { useCoordsToPosition } from '../../../../hooks/useCoordsToPosition';
import { updateTokenPositionAndAlignmentThunk } from '../../../../state/thunks/updateTokenPositionAndAlignmentThunk';
import { setTokenTransitionTime } from '../../../../utils/setTokenTransitionTime';
import { changeTurnThunk } from '../../../../state/thunks/changeTurnThunk';
import { useMoveAndCaptureToken } from '../../../../hooks/useMoveAndCaptureToken';
import { unlockAndAlignTokens } from '../../../../state/thunks/unlockAndAlignTokens';
import { playerColours } from '../../../../game/players/constants';
import { FORWARD_TOKEN_TRANSITION_TIME } from '../../../../game/tokens/constants';
import { TOKEN_START_COORDINATES } from '../../../../game/tokens/constants';

type Props = {
  colour: TPlayerColour;
  id: number;
};

function Token({ colour, id }: Props) {
  const [isTokenUnlockedInitially, setTokenUnlockedInitially] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const { tokenHeight, tokenWidth } = useSelector((state: RootState) => state.board);
  const { players } = useSelector((state: RootState) => state.players);
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
  const handleTokenClick = async () => {
    if (!isActive || diceNumber === -1 || !diceNumber) return;
    if (isLocked) {
      dispatch(setIsAnyTokenMoving(true));
      dispatch(setTokenDirection({ colour, id, isForward: true }));
      setTokenTransitionTime(FORWARD_TOKEN_TRANSITION_TIME);
      dispatch(unlockAndAlignTokens({ colour, id }));
      dispatch(deactivateAllTokens(colour));
      setTimeout(() => {
        dispatch(setIsAnyTokenMoving(false));
      }, FORWARD_TOKEN_TRANSITION_TIME);
      return;
    }

    const moveData = await moveAndCapture(token, diceNumber);
    if (!moveData) return;
    const { hasTokenReachedHome, isCaptured } = moveData;
    if (
      (diceNumber !== 6 || player?.numberOfConsecutiveSix >= 3) &&
      !isCaptured &&
      !hasTokenReachedHome
    ) {
      return dispatch(changeTurnThunk(moveAndCapture));
    }
  };
  useEffect(() => {
    if (!isLocked && isTokenUnlockedInitially) {
      setTokenUnlockedInitially(false);
      dispatch(
        updateTokenPositionAndAlignmentThunk({
          colour,
          id,
          newCoords: TOKEN_START_COORDINATES[colour],
        })
      );
    }
  }, [colour, dispatch, id, isLocked, isTokenUnlockedInitially]);

  return (
    <div
      id={`${colour}_${id}`}
      className={`token ${isDirectionForward ? '' : 'backward'} `}
      onClick={handleTokenClick}
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
