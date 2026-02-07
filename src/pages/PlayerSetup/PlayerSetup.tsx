import { useEffect, useMemo, useRef, useState } from 'react';
import PlayerInput from './components/PlayerInput/PlayerInput';
import { Link, useNavigate } from 'react-router-dom';
import type { TPlayerInitData } from '../../types';
import { ToastContainer, toast } from 'react-toastify';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';
import { useCleanup } from '../../hooks/useCleanup';
import { playerCountToWord } from '../../game/players/logic';
import { playerSequences } from '../../game/players/constants';
import bg from '../../assets/bg.jpg';
import GitHubButton from 'react-github-btn';
import HomeIcon from '../../assets/icons/home.svg?react';
import styles from './PlayerSetup.module.css';

const ALL_BOT_PLAYER_TOAST_ID = 'all-bot-player';
const PLAYER_NAME_EMPTY_TOAST_ID = 'player-name-empty';

const INITIAL_PLAYER_DATA: TPlayerInitData[] = [
  {
    name: 'Player 1',
    isBot: false,
  },
  {
    name: 'Player 2',
    isBot: false,
  },
  {
    name: 'Player 3',
    isBot: false,
  },
  {
    name: 'Player 4',
    isBot: false,
  },
];

function PlayerSetup() {
  const [playerCount, setPlayerCount] = useState(2);
  const [dialogWidth, setDialogWidth] = useState(0);
  const [playersData, setPlayersData] = useState<TPlayerInitData[]>(INITIAL_PLAYER_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDivElement>(null);
  const cleanup = useCleanup();
  const playerSequence = useMemo(
    () => playerSequences[playerCountToWord(playerCount)],
    [playerCount]
  );

  useEffect(() => {
    document.title = 'LibreLudo - Player Setup';
    cleanup();
  }, [cleanup]);

  useEffect(() => {
    if (!dialogRef.current) return;
    const dialogNode = dialogRef.current;
    const resizeObserver = new ResizeObserver(() => {
      const { width } = dialogNode.getBoundingClientRect();
      setDialogWidth(width);
    });
    resizeObserver.observe(dialogNode);
    return () => {
      resizeObserver.unobserve(dialogNode);
      resizeObserver.disconnect();
    };
  }, []);

  const handlePlayBtnClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    const playerInitData = playersData.slice(0, playerCount);
    const isAnyNameEmpty = playerInitData.some(
      (d) => d.name === '' || [...d.name].every((c) => c === ' ')
    );
    if (isAnyNameEmpty)
      return toast('Player name must not be empty', {
        type: 'error',
        toastId: PLAYER_NAME_EMPTY_TOAST_ID,
      });
    const areAllPlayersBot = playerInitData.every((d) => d.isBot);
    if (areAllPlayersBot)
      return toast('There must be at least one human player', {
        type: 'error',
        toastId: ALL_BOT_PLAYER_TOAST_ID,
      });
    setIsLoading(true);
    navigate('/play', { state: { initData: playerInitData } });
  };

  return isLoading ? (
    <LoadingScreen />
  ) : (
    <div className={styles.playerSetup} style={{ backgroundImage: `url(${bg})` }}>
      <main
        className={styles.playerSetupDialog}
        ref={dialogRef}
        style={
          {
            '--dialog-width': `${dialogWidth}px`,
            '--player-count': playerCount,
          } as React.CSSProperties
        }
      >
        <div className={styles.playerCountSelector}>
          <button className={styles.playerCount} onClick={() => setPlayerCount(2)}>
            2
          </button>
          <button className={styles.playerCount} onClick={() => setPlayerCount(3)}>
            3
          </button>
          <button className={styles.playerCount} onClick={() => setPlayerCount(4)}>
            4
          </button>
        </div>
        <div className={styles.playerInputs}>
          {playerSequence.map((c, index) => (
            <PlayerInput
              colour={c}
              name={playersData[index].name}
              isBot={playersData[index].isBot}
              onBotStatusChange={(isBot) =>
                setPlayersData(playersData.map((d, i) => (i === index ? { ...d, isBot } : d)))
              }
              onNameChange={(name) =>
                setPlayersData(playersData.map((d, i) => (i === index ? { ...d, name } : d)))
              }
              key={index}
            />
          ))}
        </div>
        <Link className={styles.playBtn} to="/play" onClick={handlePlayBtnClick}>
          PLAY
        </Link>
        <small className={styles.version}>v{__APP_VERSION__}</small>
      </main>
      <Link to="/" className={styles.goToHome}>
        <HomeIcon />
      </Link>
      <div style={{ position: 'absolute', top: 0, right: 0 }}>
        <GitHubButton
          href="https://github.com/priyanshurav"
          data-color-scheme="no-preference: light; light: light; dark: dark;"
          data-size="large"
          aria-label="Follow @priyanshurav on GitHub"
        >
          Follow @priyanshurav
        </GitHubButton>
      </div>
      <ToastContainer position="top-center" />
    </div>
  );
}

export default PlayerSetup;
