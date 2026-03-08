import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import Note from '../../components/Note/Note';
import styles from './HowToPlay.module.css';
import { useCleanup } from '../../hooks/useCleanup';

const H = ({ c }: { c: string }) => <span aria-hidden="true">{c}</span>;

function HowToPlay() {
  const cleanup = useCleanup();
  useEffect(() => {
    document.title = 'LibreLudo - How to Play';
    cleanup();
  }, [cleanup]);
  return (
    <div className={styles.howToPlayContainer}>
      <main className={styles.howToPlay}>
        <section className={styles.introduction}>
          <h1>
            <H c="🎲" /> How to Play LibreLudo
          </h1>
          <p>
            Welcome to the colorful world of LibreLudo! Whether you're new or need a refresher,
            here's everything you need to know to play and win.
          </p>
        </section>

        <section className={styles.section}>
          <h2>
            <H c="🎯" /> Objective
          </h2>
          <p>
            Be the first to move all <strong>4 of your tokens</strong> from Base to the Home
            Triangle by moving them in a clockwise path around the board.
          </p>
        </section>

        <section className={styles.section}>
          <h2>
            <H c="🧩" /> Game Components
          </h2>
          <ul>
            <li>Game board with cross-shaped track</li>
            <li>
              4 Colors: <H c="🔵" /> Blue, <H c="🔴" /> Red, <H c="🟢" /> Green, <H c="🟡" /> Yellow
            </li>
            <li>Each player has 4 tokens of the same color</li>
            <li>
              Each player gets 1 six-sided die <H c="🎲" /> (numbers 1-6)
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>
            <H c="👥" /> Players
          </h2>
          <ul>
            <li>2 to 4 players</li>
            <li>Each player picks a color</li>
            <li>Can be played solo (vs. Bot) or with friends</li>
          </ul>
        </section>
        <section className={styles.section}>
          <h2>
            <H c="🕹️" /> Quick Start Guide
          </h2>
          <ol>
            <li>
              Click{' '}
              <Link to="/setup" className={styles.link}>
                Play Now
              </Link>{' '}
              to open the setup screen.
            </li>
            <li>
              Choose <strong>2</strong>, <strong>3</strong>, or <strong>4</strong> players using the
              top tabs
            </li>
            <li>(Optional) Enter custom names for any player.</li>
            <li>
              Click the Person Icon <H c="👤" /> to toggle a player between Human and Bot{' '}
              <H c="🤖" /> (the icon will change)
            </li>
            <li>
              Tap <strong>PLAY</strong> to start the match!
            </li>
          </ol>
        </section>
        <section className={styles.section}>
          <h2>
            <H c="⌨️" /> Controls
          </h2>
          <ul>
            <li>
              Press <kbd>D</kbd> or click the dice to roll.
            </li>
            <li>Click a token to move it.</li>
          </ul>
        </section>
        <section className={styles.section}>
          <h2>
            <H c="🎮" /> Gameplay Overview
          </h2>
          <h3>
            <H c="🎬" /> Starting the Game
          </h3>
          <ul>
            <li>Each player rolls the dice once.</li>
            <li>Turns move clockwise.</li>
          </ul>
          <h3>
            <H c="🚪" /> Getting Tokens Out
          </h3>
          <ul>
            <li>
              Roll a <strong>6</strong> to move a token from Base to the Start Square.
            </li>
            <li>You can only move a token from the base with a roll of 6.</li>
          </ul>
          <Note type="bonus">Rolling a 6 gives you an extra dice roll.</Note>
          <h3>
            <H c="🔁" /> Moving Tokens
          </h3>
          <ul>
            <li>Move tokens forward the number of dice spaces rolled.</li>
          </ul>
          <Note type="important">
            If you roll three sixes in a row in Ludo, your third roll is canceled and you lose your
            turn.
          </Note>
        </section>
        <section className={styles.section}>
          <h2>
            <H c="🧍" /> Token Rules
          </h2>
          <h3>
            <H c="👥" /> Landing on Your Own Token
          </h3>
          <ul>
            <li>You can land on or stack with your own tokens.</li>
            <li>
              Stacked tokens do <strong className={styles.highlightRed}>not</strong> block captures
              or protect each other outside <strong>safe zones</strong>.
            </li>
          </ul>
          <h3>
            <H c="❌" /> Capturing Your Own Token
          </h3>
          <ul>
            <li>
              You <strong>cannot capture</strong> your own tokens.
            </li>
          </ul>
          <h3>
            <H c="🎯" /> Capturing Opponents
          </h3>
          <ul>
            <li>
              If you land on a square with an opponent's token (and it's not a safe zone), it's{' '}
              <strong className={styles.highlightRed}>captured</strong> and sent to base.
            </li>
            <li>
              You <strong>cannot</strong> capture tokens in safe zones.
            </li>
          </ul>
          <Note type="important">
            Landing on a <strong>non-safe</strong> square occupied by multiple opponent tokens
            captures <strong>all</strong> of them.
          </Note>
          <Note type="bonus">
            Capturing one or more opponent tokens in a single roll grants an{' '}
            <strong>extra dice roll.</strong>
          </Note>
        </section>
        <section className={styles.section}>
          <h2>
            <H c="⭐" /> Safe Zones
          </h2>
          <ul>
            <li>
              Special marked squares (<H c="⭐" /> or colored tiles).
            </li>
            <li>
              Tokens here are safe and <strong>cannot be captured</strong>.
            </li>
            <li>Multiple tokens (even from different players) can share the same safe zone.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>
            <H c="🏠" /> Reaching Home
          </h2>
          <ul>
            <li>After a full loop, enter the home column.</li>
            <li>
              If the roll is higher than needed, the token does{' '}
              <strong className={styles.highlightRed}>not</strong> move.
            </li>
            <li>Tokens in the Home Triangle are safe and cannot be captured.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>
            <H c="🏁" /> Winning the Game
          </h2>
          <ul>
            <li>The first player to move all 4 tokens to their Home Triangle wins.</li>
            <li>In 3-4 player games, others continue until only one player remains.</li>
            <li>When the second-last player finishes, the remaining player is placed last.</li>
            <li>
              <strong>Final Rankings:</strong> 1st → 2nd → 3rd → Last (based on finish order).
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>
            <H c="💡" /> Quick Tips
          </h2>
          <ul>
            <li>
              <H c="🚀" /> Get tokens out early - More options to move
            </li>
            <li>
              <H c="↔" /> Spread Out Your Tokens - Stacking offers no protection on non-safe
              squares.
            </li>
            <li>
              <H c="🛑" /> Use safe zones - Only place where you're safe
            </li>
            <li>
              <H c="👀" /> Watch your landings - Avoid capture range
            </li>
            <li>
              <H c="🎯" /> Capture wisely - Delay opponents' progress
            </li>
            <li>
              <H c="🏠" /> Advance steadily - Don't stall chasing others
            </li>
            <li>
              <H c="🎲" /> Plan for exact rolls - Needed to reach home
            </li>
          </ul>
        </section>
      </main>
      <Link className={styles.playNowBtn} to="/setup">
        <H c="🔥" /> Play Now
      </Link>
    </div>
  );
}

export default HowToPlay;
