import { useEffect, useMemo, useRef, useState } from 'react';
import './PlayerSetup.css';
import PlayerInput from './components/PlayerInput/PlayerInput';
import { getPlayerSequence } from '../../game/players/logic';
import { Link, useNavigate } from 'react-router-dom';
import type { TPlayerInitData } from '../../types';
import { ToastContainer, toast } from 'react-toastify';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';

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

const LICENSE_URL = 'about:blank';

function PlayerSetup() {
  const [playerCount, setPlayerCount] = useState(2);
  const [dialogWidth, setDialogWidth] = useState(0);
  const [playersData, setPlayersData] = useState<TPlayerInitData[]>(INITIAL_PLAYER_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDivElement>(null);
  const playerSequence = useMemo(() => getPlayerSequence(playerCount), [playerCount]);
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
    const isAnyNameEmpty = playersData.some((d) => d.name === '');
    if (isAnyNameEmpty) return toast('Player name must not be empty', { type: 'error' });
    setIsLoading(true);
    navigate('/play', {
      state: playersData.slice(0, playerCount),
    });
  };

  return isLoading ? (
    <LoadingScreen />
  ) : (
    <div className="player-setup">
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
        <Link type="button" className="play-btn" to="/play" onClick={handlePlayBtnClick} replace>
          PLAY
        </Link>
      </div>
      <ToastContainer position="top-center" />
    </div>
  );
}

export default PlayerSetup;
