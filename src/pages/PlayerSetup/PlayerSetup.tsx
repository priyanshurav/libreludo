import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { Tooltip } from 'react-tooltip';
import { useResizeObserver } from '../../hooks/useResizeObserver';
import { validateStoredState } from '../../game/storage/validator';
import { retrieveSaveFromStorage } from '../../game/storage/storage';
import { SAVE_VERSION } from '../../game/storage/constants';

const toastIds = {
  allBotPlayer: 'all-bot-player',
  playerNameEmpty: 'player-name-empty',
  corruptedSave: 'corrupted-save',
  incompatibleSave: 'incompatible-save',
} as const satisfies Record<string, string>;

const DEFAULT_PLAYER_DATA: TPlayerInitData[] = [
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
  const [playersData, setPlayersData] = useState<TPlayerInitData[]>(DEFAULT_PLAYER_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [dialogNode, setDialogNode] = useState<HTMLElement | null>(null);
  const cleanup = useCleanup();
  const playerSequence = useMemo(
    () => playerSequences[playerCountToWord(playerCount)],
    [playerCount]
  );

  useEffect(() => {
    document.title = 'LibreLudo - Player Setup';
    cleanup();
  }, [cleanup]);

  const onResize = useCallback(() => {
    if (!dialogNode) return;
    const dialogWidth = dialogNode.getBoundingClientRect().width;
    setDialogWidth(dialogWidth);
  }, [dialogNode]);

  useResizeObserver(dialogNode, onResize);

  const handlePlayBtnClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    const playerInitData = playersData.slice(0, playerCount);
    const isAnyNameEmpty = playerInitData.some(
      (d) => d.name === '' || [...d.name].every((c) => c === ' ')
    );
    if (isAnyNameEmpty)
      return toast('Player name must not be empty', {
        type: 'error',
        toastId: toastIds.playerNameEmpty,
      });
    const areAllPlayersBot = playerInitData.every((d) => d.isBot);
    if (areAllPlayersBot)
      return toast('There must be at least one human player', {
        type: 'error',
        toastId: toastIds.allBotPlayer,
      });
    setIsLoading(true);
    navigate('/play', { state: { initData: playerInitData } });
  };

  const handleLoadLinkClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    const { success, result } = validateStoredState(retrieveSaveFromStorage());
    if (!success) {
      toast("Save file does not exist or it's corrupted", {
        type: 'error',
        toastId: toastIds.corruptedSave,
      });
    } else if (result.version !== SAVE_VERSION) {
      toast(`Incompatible save: v${result.version} (requires v${SAVE_VERSION})`, {
        type: 'error',
        toastId: toastIds.incompatibleSave,
      });
    } else {
      setIsLoading(true);
      navigate('/play', { state: 'LOAD_SAVE' });
    }
  };
  return isLoading ? (
    <LoadingScreen />
  ) : (
    <div className={styles.playerSetup} style={{ backgroundImage: `url(${bg})` }}>
      <main
        className={styles.playerSetupDialog}
        ref={setDialogNode}
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
        <Link
          className={styles.loadGame}
          to="/play"
          title="Load last game"
          onClick={handleLoadLinkClick}
        >
          or, load last game
        </Link>
        <small className={styles.version}>v{__LIBRELUDO_VERSION__}</small>
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
      <Tooltip
        id="bot-status-tooltip"
        className="tooltip"
        openEvents={{ focus: false, mouseover: true }}
        place="bottom-start"
      />
    </div>
  );
}

export default PlayerSetup;
