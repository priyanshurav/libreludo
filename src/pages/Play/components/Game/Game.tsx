import { useEffect, useRef } from 'react';
import { registerNewPlayer, setPlayerSequence } from '../../../../state/slices/playersSlice';
import Board from '../Board/Board';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { hydrateRootState, type AppDispatch, type RootState } from '../../../../state/store';
import { registerDice } from '../../../../state/slices/diceSlice';
import GameFinishedScreen from '../GameFinishedScreen/GameFinishedScreen';
import type { TPlayerInitData } from '../../../../types';
import { useBlocker, useNavigate } from 'react-router';
import { playerCountToWord } from '../../../../game/players/logic';
import bg from '../../../../assets/bg.jpg';
import { addToGameInactiveTime, setGameStartTime } from '../../../../state/slices/sessionSlice';
import styles from './Game.module.css';
import { retrieveState } from '../../../../game/storage/retrieveState';
import { deleteSaveFromStorage, saveExists } from '../../../../game/storage/storage';
import { useExecuteBotMove } from '../../../../hooks/useExecuteBotMove';
import { useRollDice } from '../../../../hooks/useRollDice';
import { playerSequences } from '../../../../game/players/constants';
import { logError } from '../../../../utils/logError';
import { saveState } from '../../../../game/storage/saveState';

export const EXIT_MESSAGE = 'Are you sure you want to exit?';

type Props = {
  initData: TPlayerInitData[] | undefined;
};

export default function Game({ initData }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const boardTileSize = useSelector((state: RootState) => state.board.boardTileSize);
  const { isGameEnded, playerFinishOrder, currentPlayerColour, players } = useSelector(
    (state: RootState) => state.players
  );
  const playersRegisteredInitiallyRef = useRef(true);
  const gameInactiveStartTime = useRef(0);
  const navigate = useNavigate();
  const store = useStore<RootState>();
  const executeBotMove = useExecuteBotMove();
  const rollDice = useRollDice();

  useBlocker(({ currentLocation, nextLocation }) => {
    if (isGameEnded || import.meta.env.DEV || currentLocation.pathname === nextLocation.pathname)
      return false;
    const userWantsToLeave = confirm(EXIT_MESSAGE);
    return !userWantsToLeave;
  });

  useEffect(() => {
    if (saveExists()) {
      const { success, data, error } = retrieveState(store.getState());
      if (success) {
        store.dispatch(hydrateRootState(data));
      } else {
        throw error;
      }
    }
  }, [store]);

  useEffect(() => {
    if (isGameEnded) deleteSaveFromStorage();
  }, [isGameEnded]);

  useEffect(() => {
    if (!initData || saveExists()) return;
    const playerCountWord = playerCountToWord(initData.length);
    const calculatedSequence = playerSequences[playerCountWord];

    dispatch(setPlayerSequence({ playerCount: playerCountWord }));
    dispatch(setGameStartTime(Date.now()));

    for (let i = 0; i < initData.length; i++) {
      dispatch(
        registerNewPlayer({
          name: initData[i].name,
          colour: calculatedSequence[i],
          isBot: initData[i].isBot,
        })
      );
      dispatch(registerDice(calculatedSequence[i]));
    }
    playersRegisteredInitiallyRef.current = false;
  }, [dispatch, initData]);

  useEffect(() => {
    if (players.length === 0) return;
    const currentPlayer = store
      .getState()
      .players.players.find((p) => p.colour === currentPlayerColour);
    if (currentPlayer?.isBot) {
      rollDice(currentPlayerColour)
        .then((diceNumber) => executeBotMove(currentPlayerColour, diceNumber))
        .catch(logError('Game.botTurnEffect'));
    }
  }, [currentPlayerColour, executeBotMove, rollDice, store, players.length]);

  useEffect(() => {
    const handlePageVisibilityChange = () => {
      if (isGameEnded) return;
      if (document.visibilityState === 'hidden') {
        gameInactiveStartTime.current = Date.now();
        try {
          saveState(store.getState());
        } catch {
          console.warn('Skipped saving: game state is transitional.');
        }
      } else if (document.visibilityState === 'visible' && gameInactiveStartTime.current > 0) {
        const now = Date.now();
        dispatch(addToGameInactiveTime(now - gameInactiveStartTime.current));
        try {
          saveState(store.getState());
        } catch {
          console.warn('Skipped saving: game state is transitional.');
        }
        gameInactiveStartTime.current = 0;
      }
    };
    document.addEventListener('visibilitychange', handlePageVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handlePageVisibilityChange);
  }, [dispatch, isGameEnded, store]);

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
      <Board />
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
