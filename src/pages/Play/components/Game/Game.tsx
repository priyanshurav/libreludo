import React, { useEffect, useState } from 'react';
import { registerNewPlayer, setPlayerSequence } from '../../../../state/slices/playersSlice';
import { type TPlayerColour } from '../../../../types';
import Board from '../Board/Board';
import './Game.css';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../gameStateStore';
import { registerDice } from '../../../../state/slices/diceSlice';
import { handlePostDiceRollThunk } from '../../../../state/thunks/handlePostDiceRollThunk';
import GameFinishedScreen from '../GameFinishedScreen/GameFinishedScreen';
import { changeTurnThunk } from '../../../../state/thunks/changeTurnThunk';
import { useMoveAndCaptureToken } from '../../../../hooks/useMoveAndCaptureToken';
import type { TPlayerInitData } from '../../../../types';
import { useNavigate } from 'react-router-dom';
import { playerCountToWord } from '../../../../game/players/logic';

type Props = {
  initData: TPlayerInitData[];
};

function Game({ initData }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const boardBlockSize = useSelector((state: RootState) => state.board.boardBlockSize);
  const { playerSequence, isGameEnded, playerFinishOrder, currentPlayerColour, players } =
    useSelector((state: RootState) => state.players);
  const [playersRegisteredInitially, setPlayersRegisteredInitially] = useState(true);
  const navigate = useNavigate();
  const moveAndCapture = useMoveAndCaptureToken();
  useEffect(() => {
    if (initData.length === 0) return;
    dispatch(setPlayerSequence({ playerCount: playerCountToWord(initData.length) }));
  }, [dispatch, initData.length]);

  useEffect(() => {
    if (initData.length === 0) return;
    for (let i = 0; i < initData.length; i++) {
      if (!playerSequence.length || !playersRegisteredInitially) return;
      dispatch(
        registerNewPlayer({
          name: initData[i].name,
          colour: playerSequence[i],
          isBot: initData[i].isBot,
        })
      );
      dispatch(registerDice(playerSequence[i]));
    }
    setPlayersRegisteredInitially(false);
  }, [dispatch, playerSequence, initData, playersRegisteredInitially]);

  useEffect(() => {
    if (currentPlayerColour || players.length === 0 || initData.length === 0) return;
    dispatch(changeTurnThunk(moveAndCapture));
  }, [currentPlayerColour, dispatch, initData.length, moveAndCapture, players.length]);

  const handleDiceRoll = (colour: TPlayerColour, diceNumber: number) => {
    if (initData.length === 0) return;
    dispatch(handlePostDiceRollThunk(colour, diceNumber, moveAndCapture));
  };

  const handleExitBtnClick = () => {
    const shouldExit = confirm('Are you sure you want to exit? Any progress made will be lost.');
    if (!shouldExit) return;
    navigate('/');
  };

  return (
    <div
      className="game"
      style={
        {
          '--board-block-size': `${boardBlockSize}px`,
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
