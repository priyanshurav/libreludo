import dice1 from '../../../../assets/dice/1.svg';
import dice2 from '../../../../assets/dice/2.svg';
import dice3 from '../../../../assets/dice/3.svg';
import dice4 from '../../../../assets/dice/4.svg';
import dice5 from '../../../../assets/dice/5.svg';
import dice6 from '../../../../assets/dice/6.svg';
import dicePlaceholder from '../../../../assets/dice/dice_placeholder.gif';
import { useMemo } from 'react';
import { type TPlayerColour } from '../../../../types';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../state/store';
import { ERRORS } from '../../../../utils/errors';
import { rollDiceThunk } from '../../../../state/thunks/rollDiceThunk';
import { playerColours } from '../../../../game/players/constants';
import { isAnyTokenActiveOfColour } from '../../../../game/tokens/logic';
import styles from './Dice.module.css';
import clsx from 'clsx';

type Props = {
  colour: TPlayerColour;
  playerName: string;
  onDiceClick: (colour: TPlayerColour, diceNumber: number) => void;
};

function getDiceImage(diceNumber: number | undefined): string {
  switch (diceNumber) {
    case 1:
      return dice1;
    case 2:
      return dice2;
    case 3:
      return dice3;
    case 4:
      return dice4;
    case 5:
      return dice5;
    case 6:
      return dice6;
    default:
      throw new Error(ERRORS.invalidDiceNumber(diceNumber as never));
  }
}

function getCSSClass(colour: TPlayerColour): string {
  switch (colour) {
    case 'blue':
      return styles.blue;
    case 'red':
      return styles.red;
    case 'green':
      return styles.green;
    case 'yellow':
      return styles.yellow;
  }
}

function Dice({ colour, onDiceClick, playerName }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const {
    isAnyTokenMoving,
    isGameEnded,
    currentPlayerColour: currentPlayer,
    players,
  } = useSelector((state: RootState) => state.players);
  const { diceNumber, isPlaceholderShowing } =
    useSelector((state: RootState) => state.dice.dice.find((d) => d.colour === colour)) ?? {};

  const anyTokenActive = useMemo(
    () => isAnyTokenActiveOfColour(colour, players),
    [colour, players]
  );
  const isBot = players.find((p) => p.colour === colour)?.isBot;
  const isCurrentPlayer = currentPlayer === colour;
  const isDiceDisabled =
    !isCurrentPlayer ||
    anyTokenActive ||
    isAnyTokenMoving ||
    isGameEnded ||
    isPlaceholderShowing ||
    isBot;

  const handleDiceClick = () => {
    if (isDiceDisabled) return;
    dispatch(rollDiceThunk(colour, (diceNumber) => onDiceClick(colour, diceNumber)));
  };

  return (
    <div className={clsx(styles.diceContainer, getCSSClass(colour))}>
      <button
        className={clsx(styles.dice, {
          [styles.active]: !isDiceDisabled,
        })}
        tabIndex={isDiceDisabled ? -1 : undefined}
        style={{ '--player-colour': playerColours[colour] } as React.CSSProperties}
        type="button"
        onClick={handleDiceClick}
      >
        <img
          src={isPlaceholderShowing ? dicePlaceholder : getDiceImage(diceNumber)}
          alt="Dice image"
        />
      </button>
      <span className={styles.playerName}>{playerName}</span>
    </div>
  );
}

export default Dice;
