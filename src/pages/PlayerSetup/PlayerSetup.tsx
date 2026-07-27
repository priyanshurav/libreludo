import { useEffect, useMemo, useState } from 'react';
import PlayerInput from './components/PlayerInput/PlayerInput';
import { Link, useNavigate, type MetaFunction } from 'react-router';
import type { TPlayerInitData } from '../../types';
import { ToastContainer, toast } from 'react-toastify';
import { useCleanup } from '../../hooks/useCleanup';
import { playerCountToWord } from '../../game/players/logic';
import { playerSequences } from '../../game/players/constants';
import HomeIcon from '../../assets/icons/home.svg?react';
import styles from './PlayerSetup.module.css';
import { Tooltip } from 'react-tooltip';
import { validateStoredState } from '../../game/storage/validator';
import {
  deleteSaveFromStorage,
  retrieveSaveFromStorage,
  saveExists,
} from '../../game/storage/storage';
import GitHubLogo from '../../assets/icons/github-mark-white.svg?react';
import { SAVE_VERSION } from '../../game/storage/constants';
import { logError } from '../../utils/logError';

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

export default function PlayerSetup() {
  const [playerCount, setPlayerCount] = useState(2);
  const [btnsDisabled, setBtnsDisabled] = useState(false);
  const [playersData, setPlayersData] = useState<TPlayerInitData[]>(DEFAULT_PLAYER_DATA);
  const navigate = useNavigate();
  const cleanup = useCleanup();
  const playerSequence = useMemo(
    () => playerSequences[playerCountToWord(playerCount)],
    [playerCount]
  );

  useEffect(() => {
    cleanup();
  }, [cleanup]);

  const handlePlayBtnClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    try {
      e.preventDefault();
      if (btnsDisabled) return;
      setBtnsDisabled(true);

      if (saveExists()) {
        const res = confirm('Start a new game? Your current save will be lost');
        if (!res) return setBtnsDisabled(false);
      }

      deleteSaveFromStorage(); // this is to prevent the old game from getting loaded

      const playerInitData = playersData.slice(0, playerCount);
      const areAllPlayersBot = playerInitData.every((d) => d.isBot);
      const isAnyNameEmpty = playerInitData.some(
        (d) => d.name === '' || [...d.name].every((c) => c === ' ')
      );

      if (isAnyNameEmpty) {
        toast('Player name must not be empty', {
          type: 'error',
          toastId: toastIds.playerNameEmpty,
        });
      } else if (areAllPlayersBot) {
        toast('There must be at least one human player', {
          type: 'error',
          toastId: toastIds.allBotPlayer,
        });
      } else {
        return void navigate('/play', { state: { initData: playerInitData } });
      }
      setBtnsDisabled(false);
    } catch (e) {
      logError('PlayerSetup.handlePlayBtnClick')(e);
      setBtnsDisabled(false);
    }
  };

  const handleLoadLinkClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    try {
      e.preventDefault();
      if (btnsDisabled) return;
      setBtnsDisabled(true);
      const { success, data } = validateStoredState(retrieveSaveFromStorage());
      if (!success) {
        toast("Save file does not exist or it's corrupted", {
          type: 'error',
          toastId: toastIds.corruptedSave,
        });
      } else if (data.version !== SAVE_VERSION) {
        toast(`Incompatible save: v${data.version} (requires v${SAVE_VERSION})`, {
          type: 'error',
          toastId: toastIds.incompatibleSave,
        });
      } else {
        return void navigate('/play');
      }
      setBtnsDisabled(false);
    } catch (e) {
      logError('PlayerSetup.handleLoadLinkClick')(e);
      setBtnsDisabled(false);
    }
  };

  return (
    <div className={styles.playerSetup}>
      <main
        className={styles.playerSetupDialog}
        style={{ '--player-count': playerCount } as React.CSSProperties}
      >
        <div className={styles.playerCountSelector}>
          {[2, 3, 4].map((n) => (
            <button className={styles.playerCount} key={n} onClick={() => setPlayerCount(n)}>
              {n}
            </button>
          ))}
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

        <Link
          className={styles.playBtn}
          to="/play"
          onClick={handlePlayBtnClick}
          aria-disabled={btnsDisabled}
        >
          PLAY
        </Link>
        <Link
          className={styles.loadGame}
          to="/play"
          title="Load last game"
          onClick={handleLoadLinkClick}
          aria-disabled={btnsDisabled}
        >
          or, load last game
        </Link>
        <small className={styles.version}>v{__LIBRELUDO_VERSION__}</small>
      </main>
      <Link to="/" className={styles.goToHome}>
        <HomeIcon />
      </Link>
      <a
        href="https://github.com/priyanshurav"
        rel="noopener noreferrer"
        target="_blank"
        className={styles.ghFollowBtn}
        aria-label="Follow @priyanshurav on GitHub"
      >
        <GitHubLogo aria-hidden="true" />
        Follow&nbsp;@priyanshurav
      </a>
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

export const meta: MetaFunction = () => [{ title: 'LibreLudo - Player Setup' }];
