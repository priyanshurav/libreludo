import { type TPlayer, type TPlayerColour } from '../../../../types';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../state/store';
import { useEffect, useState } from 'react';
import rank1Image from '../../../../assets/player_rank_images/1.png';
import rank2Image from '../../../../assets/player_rank_images/2.png';
import rank3Image from '../../../../assets/player_rank_images/3.png';
import './GameFinishPlayerItem.css';
import { AnimatePresence, motion } from 'framer-motion';
import { playerColours } from '../../../../game/players/constants';

type Props = {
  rank: number;
  name: string;
  colour: TPlayerColour;
  isLast: boolean;
};

function getTimeString(t1: number, t2: number): string {
  if (t1 === -1 || t2 === -1) return '00:00';
  const diff = Math.abs(t2 - t1);
  const minutes = diff / 1000 / 60;
  const seconds = diff / 1000 - Math.floor(minutes) * 60;
  const minutesStr = Math.floor(minutes).toString().padStart(2, '0');
  const secondsStr = Math.floor(seconds).toString().padStart(2, '0');
  return `${minutesStr}:${secondsStr}`;
}

function GameFinishPlayerItem({ colour, isLast, name, rank }: Props) {
  const [rankImage, setRankImage] = useState('');
  const { boardTileSize } = useSelector((state: RootState) => state.board);
  const { gameStartTime, players } = useSelector((state: RootState) => state.players);
  const { gameFinishTime } = players.find((p) => p.colour === colour) as TPlayer;

  useEffect(() => {
    if (rank === 4) return;
    switch (rank) {
      case 1:
        setRankImage(rank1Image);
        break;
      case 2:
        setRankImage(rank2Image);
        break;
      case 3:
        setRankImage(rank3Image);
        break;
      default:
        throw new Error('Invalid rank');
    }
  }, [rank]);

  return (
    <AnimatePresence>
      <motion.div
        className="game-finish-player-item"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: rank * 0.1 }}
      >
        {isLast ? (
          <span />
        ) : (
          <img
            src={rankImage === '' ? undefined : rankImage}
            alt="Rank image"
            height={boardTileSize * 1.2}
          />
        )}
        <span
          className="player-colour-dot"
          style={{ backgroundColor: playerColours[colour] }}
        ></span>
        <span className="game-finish-player-name">{name}</span>
        <span className="game-finish-time">
          {isLast ? '' : getTimeString(gameFinishTime, gameStartTime)}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}

export default GameFinishPlayerItem;
