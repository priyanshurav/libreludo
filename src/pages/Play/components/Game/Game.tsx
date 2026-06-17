import React, { useEffect, useRef } from 'react';
import { registerNewPlayer, setPlayerSequence } from '../../../../state/slices/playersSlice';
import { type TPlayerColour } from '../../../../types';
import Board from '../Board/Board';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { hydrateRootState, type AppDispatch, type RootState } from '../../../../state/store';
import { registerDice } from '../../../../state/slices/diceSlice';
import GameFinishedScreen from '../GameFinishedScreen/GameFinishedScreen';
import type { TPlayerInitData } from '../../../../types';
import { useNavigate } from 'react-router-dom';
import { playerCountToWord } from '../../../../game/players/logic';
import bg from '../../../../assets/bg.jpg';
import { usePageLeaveBlocker } from '../../../../hooks/usePageLeaveBlocker';
import { addToGameInactiveTime, setGameStartTime } from '../../../../state/slices/sessionSlice';
import styles from './Game.module.css';
import { useGameStorage } from '../../../../hooks/useGameStorage';
import { useChangeTurn } from '../../../../hooks/useChangeTurn';
import { useHandlePostDiceRoll } from '../../../../hooks/useHandlePostDiceRoll';

export const EXIT_MESSAGE = 'Are you sure you want to exit?';

type Props = {
  initData: TPlayerInitData[];
  loadSave: boolean;
};

function Game({ initData, loadSave }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const boardTileSize = useSelector((state: RootState) => state.board.boardTileSize);
  const { playerSequence, isGameEnded, playerFinishOrder, currentPlayerColour } = useSelector(
    (state: RootState) => state.players
  );
  const { retrieveState, saveState, deleteState } = useGameStorage();
  const playersRegisteredInitiallyRef = useRef(true);
  const gameInactiveStartTime = useRef(0);
  const navigate = useNavigate();
  const store = useStore<RootState>();
  const changeTurnFn = useChangeTurn();
  const handlePostDiceRoll = useHandlePostDiceRoll();

  usePageLeaveBlocker(!isGameEnded && import.meta.env.PROD);

  useEffect(() => {
    if (initData.length !== 0 && !loadSave) return;
    const { success, result } = retrieveState();
    if (success) {
      store.dispatch(hydrateRootState(result));
    } else {
      throw result;
    }
  }, [retrieveState, initData.length, loadSave, store]);
  useEffect(() => {
    if (isGameEnded) deleteState();
  }, [isGameEnded, deleteState]);
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
    if (!currentPlayerColour) changeTurnFn();
    else saveState();
  }, [dispatch, playerSequence, initData, changeTurnFn, currentPlayerColour, saveState]);

  useEffect(() => {
    const handlePageVisibilityChange = () => {
      if (isGameEnded) return;
      if (document.visibilityState === 'hidden') {
        gameInactiveStartTime.current = Date.now();
      } else if (document.visibilityState === 'visible' && gameInactiveStartTime.current > 0) {
        const now = Date.now();
        dispatch(addToGameInactiveTime(now - gameInactiveStartTime.current));
        gameInactiveStartTime.current = 0;
      }
    };
    document.addEventListener('visibilitychange', handlePageVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handlePageVisibilityChange);
  }, [dispatch, isGameEnded]);

  const handleDiceRoll = async (colour: TPlayerColour, diceNumber: number) => {
    if (initData.length === 0 && !loadSave) return;
    const res = await handlePostDiceRoll(colour, diceNumber);
    if (res?.shouldChangeTurn) changeTurnFn();
  };

  const handleExitBtnClick = () => navigate('/');

  return (
    <div
      className={styles.game}
      style={
        {
          '--board-tile-size': `${boardTileSize}px`,
          backgroundImage: `url(${bg})`,
        } as React.CSSProperties
      }
    >
      <Board onDiceClick={handleDiceRoll} />
      <button
        type="button"
        aria-label="Exit button"
        className={styles.exitBtn}
        onClick={handleExitBtnClick}
      >
        &times;
      </button>
      {isGameEnded && <GameFinishedScreen playerFinishOrder={playerFinishOrder} />}
    </div>
  );
}

export default Game;
