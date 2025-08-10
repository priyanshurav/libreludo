import { useEffect, useMemo, useRef, useState } from 'react';
import './PlayerSetup.css';
import PlayerInput from './components/PlayerInput/PlayerInput';
import { Link, useNavigate } from 'react-router-dom';
import type { TPlayerInitData } from '../../types';
import { ToastContainer, toast } from 'react-toastify';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';
import { useDispatch } from 'react-redux';
import { setPlayerInitData } from '../../state/slices/playersSlice';
import { useCleanup } from '../../hooks/useCleanup';
import { playerCountToWord } from '../../game/players/logic';
import { playerSequences } from '../../game/players/constants';
import bg from '../../assets/bg.jpg';
import GitHubButton from 'react-github-btn';

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
  const dispatch = useDispatch();
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
    const isAnyNameEmpty = playerInitData.some((d) => d.name === '');
    if (isAnyNameEmpty) return toast('Player name must not be empty', { type: 'error' });
    dispatch(setPlayerInitData(playerInitData));
    setIsLoading(true);
    navigate('/play');
  };

  return isLoading ? (
    <LoadingScreen />
  ) : (
    <div className="player-setup" style={{ backgroundImage: `url(${bg})` }}>
      <div style={{ position: 'absolute', top: 0, left: 0 }}>
        <GitHubButton
          href="https://github.com/priyanshurav"
          data-color-scheme="no-preference: light; light: light; dark: dark;"
          data-size="large"
          aria-label="Follow @priyanshurav on GitHub"
        >
          Follow @priyanshurav
        </GitHubButton>
      </div>
      <div className="version">v{__APP_VERSION__}</div>
      <div
        className="player-setup-dialog"
        ref={dialogRef}
        style={
          {
            '--dialog-width': `${dialogWidth}px`,
            '--player-count': playerCount,
          } as React.CSSProperties
        }
      >
        <div className="player-count-selector">
          <button className="player-count" type="button" onClick={() => setPlayerCount(2)}>
            2
          </button>
          <button className="player-count" type="button" onClick={() => setPlayerCount(3)}>
            3
          </button>
          <button className="player-count" type="button" onClick={() => setPlayerCount(4)}>
            4
          </button>
        </div>
        <div className="player-inputs">
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
        <Link type="button" className="play-btn" to="/play" onClick={handlePlayBtnClick}>
          PLAY
        </Link>
      </div>
      <ToastContainer position="top-center" />
    </div>
  );
}

export default PlayerSetup;
