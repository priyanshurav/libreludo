import type { TPlayerColour } from '../../../../types';
import BotIcon from '../../../../assets/icons/bot.svg?react';
import HumanIcon from '../../../../assets/icons/human.svg?react';
import { MAX_PLAYER_NAME_LENGTH, playerColours } from '../../../../game/players/constants';
import 'react-tooltip/dist/react-tooltip.css';
import styles from './PlayerInput.module.css';

type Props = {
  colour: TPlayerColour;
  name: string;
  isBot: boolean;
  onBotStatusChange: (isBot: boolean) => void;
  onNameChange: (name: string) => void;
};

function PlayerInput({ colour, isBot, name, onBotStatusChange, onNameChange }: Props) {
  return (
    <div className={styles.playerInput}>
      <span
        className={styles.playerInputColourDot}
        aria-hidden="true"
        style={{ backgroundColor: playerColours[colour] }}
      />
      <input
        type="text"
        placeholder="Enter player name"
        className={styles.playerNameInput}
        aria-label={`Name for ${colour} player`}
        value={name}
        onChange={(e) => onNameChange(e.target.value.slice(0, MAX_PLAYER_NAME_LENGTH))}
      />
      <button
        className={styles.botStatusBtn}
        data-tooltip-id="bot-status-tooltip"
        data-tooltip-content={isBot ? 'Bot' : 'Human'}
        aria-pressed={isBot}
        type="button"
        aria-label={`Bot for ${colour} player`}
        onClick={() => onBotStatusChange(!isBot)}
      >
        {isBot ? <BotIcon aria-hidden="true" /> : <HumanIcon aria-hidden="true" />}
      </button>
    </div>
  );
}

export default PlayerInput;
