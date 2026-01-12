import React, { useEffect, useRef } from 'react';
import { registerNewPlayer, setPlayerSequence } from '../../../../state/slices/playersSlice';
import { type TPlayerColour } from '../../../../types';
import Board from '../Board/Board';
import './Game.css';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../state/store';
import { registerDice } from '../../../../state/slices/diceSlice';
import { handlePostDiceRollThunk } from '../../../../state/thunks/handlePostDiceRollThunk';
import GameFinishedScreen from '../GameFinishedScreen/GameFinishedScreen';
import { changeTurnThunk } from '../../../../state/thunks/changeTurnThunk';
import { useMoveAndCaptureToken } from '../../../../hooks/useMoveAndCaptureToken';
import type { TPlayerInitData } from '../../../../types';
import { useNavigate } from 'react-router-dom';
import { playerCountToWord } from '../../../../game/players/logic';
import bg from '../../../../assets/bg.jpg';
import { usePageLeaveBlocker } from '../../../../hooks/usePageLeaveBlocker';
import { addToGameInactiveTime, setGameStartTime } from '../../../../state/slices/sessionSlice';

export const EXIT_MESSAGE = 'Are you sure you want to exit? Any progress made will be lost.';

type Props = {
  initData: TPlayerInitData[];
};

function Game({ initData }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const boardTileSize = useSelector((state: RootState) => state.board.boardTileSize);
  const { playerSequence, isGameEnded, playerFinishOrder, currentPlayerColour, players } =
    useSelector((state: RootState) => state.players);
  const playersRegisteredInitiallyRef = useRef(true);
  const gameInactiveStartTime = useRef(0);
  const navigate = useNavigate();
  const moveAndCapture = useMoveAndCaptureToken();
  usePageLeaveBlocker(!isGameEnded && import.meta.env.PROD);
  useEffect(() => {
    if (initData.length === 0) return;
    dispatch(setPlayerSequence({ playerCount: playerCountToWord(initData.length) }));
    dispatch(setGameStartTime(Date.now()));
  }, [dispatch, initData.length]);

  useEffect(() => {
    if (initData.length === 0) return;
    for (let i = 0; i < initData.length; i++) {
      if (!playerSequence.length || !playersRegisteredInitiallyRef.current) return;
      dispatch(
        registerNewPlayer({
          name: initData[i].name,
          colour: playerSequence[i],
          isBot: initData[i].isBot,
        })
      );
      dispatch(registerDice(playerSequence[i]));
    }
    playersRegisteredInitiallyRef.current = false;
  }, [dispatch, playerSequence, initData]);

  useEffect(() => {
    const handlePageVisibilityChange = () => {
      if (isGameEnded) return;
      if (document.hidden) {
        gameInactiveStartTime.current = Date.now();
      } else {
        const now = Date.now();
        dispatch(addToGameInactiveTime(now - gameInactiveStartTime.current));
      }
    };
    document.addEventListener('visibilitychange', handlePageVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handlePageVisibilityChange);
  }, [dispatch, isGameEnded]);

  useEffect(() => {
    if (currentPlayerColour || players.length === 0 || initData.length === 0) return;
    dispatch(changeTurnThunk(moveAndCapture));
  }, [currentPlayerColour, dispatch, initData.length, moveAndCapture, players.length]);

  const handleDiceRoll = (colour: TPlayerColour, diceNumber: number) => {
    if (initData.length === 0) return;
    dispatch(handlePostDiceRollThunk(colour, diceNumber, moveAndCapture));
  };

  const handleExitBtnClick = () => {
    const shouldExit = confirm(EXIT_MESSAGE);
    if (!shouldExit) return;
    navigate('/');
  };

  return (
    <div
      className="game"
      style={
        {
          '--board-tile-size': `${boardTileSize}px`,
          backgroundImage: `url(${bg})`,
        } as React.CSSProperties
      }
    >
      <button
        type="button"
        aria-label="Exit button"
        className="exit-btn"
        onClick={handleExitBtnClick}
      >
        &times;
      </button>
      <Board onDiceClick={handleDiceRoll} />
      {isGameEnded && <GameFinishedScreen playerFinishOrder={playerFinishOrder} />}
    </div>
  );
}

export default Game;
