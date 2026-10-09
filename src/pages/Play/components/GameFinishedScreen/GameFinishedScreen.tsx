import type { TPlayerNameAndColour } from '../../../../types';
import Confetti from 'react-confetti';
import GameFinishPlayerItem from '../GameFinishPlayerItem/GameFinishPlayerItem';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router';
import styles from './GameFinishedScreen.module.css';
import { useWindowDimensions } from '../../../../hooks/useWindowDimensions';
import { useEffect, useRef } from 'react';

type Props = {
  playerFinishOrder: TPlayerNameAndColour[];
};

export default function GameFinishedScreen({ playerFinishOrder }: Props) {
  const playAgainRef = useRef<HTMLAnchorElement | null>(null);
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    playAgainRef.current?.focus();
  }, []);
  return (
    <AnimatePresence>
      <motion.div className={styles.gameFinishedScreen}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={styles.gameFinishedBackdrop}
        />
        <Confetti width={width} height={height} style={{ zIndex: 20 }} aria-hidden="true" />
        <motion.div
          className={styles.gameFinishedDialog}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="game-finished-heading"
        >
          <span id="game-finished-heading" className={styles.gameFinishedText}>
            GAME FINISHED!
          </span>
          <section className={styles.gameResult}>
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
          <Link className={styles.playAgainBtn} ref={playAgainRef} to="/setup">
            Play Again!
          </Link>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
