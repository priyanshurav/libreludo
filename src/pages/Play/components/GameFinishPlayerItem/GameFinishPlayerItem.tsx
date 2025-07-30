import { type TPlayerColour } from '../../../../types';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../gameStateStore';
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

function GameFinishPlayerItem({ colour, isLast, name, rank }: Props) {
  const [rankImage, setRankImage] = useState('');
  const { boardBlockSize } = useSelector((state: RootState) => state.board);
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
            height={boardBlockSize * 1.2}
          />
        )}
        <span
          className="player-colour-dot"
          style={{ backgroundColor: playerColours[colour] }}
        ></span>
        <span className="game-finish-player-name">{name}</span>
      </motion.div>
    </AnimatePresence>
  );
}

export default GameFinishPlayerItem;
