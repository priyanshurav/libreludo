import type { TPlayerNameAndColour } from '../../../../types';
import Confetti from 'react-confetti';
import './GameFinishedScreen.css';
import { useWindowSize } from 'react-use';
import GameFinishPlayerItem from '../GameFinishPlayerItem/GameFinishPlayerItem';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';

type Props = {
  playerFinishOrder: TPlayerNameAndColour[];
};

function GameFinishedScreen({ playerFinishOrder }: Props) {
  const { width, height } = useWindowSize();
  return (
    <AnimatePresence>
      <motion.div className="game-finished-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="game-finished-backdrop"
        />
        <Confetti width={width} height={height} style={{ zIndex: 20 }} />
        <motion.div
          className="game-finished-dialog"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <span className="game-finished-text">GAME FINISHED!</span>
          <section className="game-result">
            {playerFinishOrder.map((p, i) => (
              <GameFinishPlayerItem
                colour={p.colour}
                isLast={i === playerFinishOrder.length - 1}
                name={p.name}
                rank={i + 1}
                key={i}
              />
            ))}
          </section>
          <Link className="play-again-btn" type="button" to="/setup">
            Play Again!
          </Link>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default GameFinishedScreen;
