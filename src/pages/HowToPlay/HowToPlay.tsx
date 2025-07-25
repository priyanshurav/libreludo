import { Link } from 'react-router-dom';
import './HowToPlay.css';

function HowToPlay() {
  return (
    <div className="how-to-play-container">
      <div className="how-to-play">
        <section className="introduction">
          <h1>🎲 How to Play LibreLudo</h1>
          <p>
            Welcome to the colorful world of Ludo! Whether you're new or need a refresher, here's
            everything you need to know to play and win.
          </p>
        </section>

        <div className="section">
          <h2>🎯 Objective</h2>
          <p>
            Be the first to move all <strong>4 of your tokens</strong> from Base to the Home
            Triangle by moving them in a clockwise path around the board.
          </p>
        </div>

        <div className="section">
          <h2>🧩 Game Components</h2>
          <ul>
            <li>Game board with cross-shaped track</li>
            <li>4 Colors: 🔵 Blue, 🔴 Red, 🟢 Green, 🟡 Yellow</li>
            <li>Each player has 4 tokens of the same color</li>
            <li>1x Six-sided dice (1-6)</li>
          </ul>
        </div>

        <div className="section">
          <h2>👥 Players</h2>
          <ul>
            <li>2 to 4 players</li>
            <li>Each player picks a color</li>
            <li>Can be played solo (vs. Bot) or with friends</li>
          </ul>
        </div>

        <div className="section">
          <h2>🎮 Gameplay Overview</h2>

          <h3>🎬 Starting the Game</h3>
          <ul>
            <li>Each player rolls the dice once.</li>
            <li>The player with the highest roll starts.</li>
            <li>Turns move clockwise.</li>
          </ul>

          <h3>🚪 Getting Tokens Out</h3>
          <ul>
            <li>
              Roll a <strong>6</strong> to move a token from Base to the Start Square.
            </li>
            <li>You can only move a token from the base with a roll of 6.</li>
            <li>
              <strong>Bonus:</strong> Rolling a 6 gives you an extra turn.
            </li>
          </ul>

          <h3>🔁 Moving Tokens</h3>
          <ul>
            <li>Move tokens forward the number of dice spaces rolled.</li>
            <li>Tokens follow a clockwise path.</li>
            <li>Multiple 6s let you split or chain moves across tokens.</li>
          </ul>
        </div>

        <div className="section">
          <h2>🧍 Token Rules</h2>

          <h3>👥 Landing on Your Own Token</h3>
          <ul>
            <li>You can land on or stack with your own tokens.</li>
            <li>
              Stacked tokens <strong>do not block</strong> others and can still be captured.
            </li>
            <li>If captured, only one of the stacked tokens is sent back.</li>
          </ul>

          <h3>❌ Capturing Your Own Token</h3>
          <ul>
            <li>
              You <strong>cannot capture</strong> your own tokens.
            </li>
          </ul>

          <h3>🎯 Capturing Opponents</h3>
          <ul>
            <li>
              If you land on a square with an opponent's token (and it's not a safe zone), it's{' '}
              <span className="highlight">captured</span> and sent to base.
            </li>
            <li>
              You <strong>cannot</strong> capture tokens in safe zones.
            </li>
            <li>Multiple players can share the same safe zone.</li>
          </ul>
        </div>

        <div className="section">
          <h2>⭐ Safe Zones</h2>
          <ul>
            <li>Special marked squares (⭐ or colored outlines).</li>
            <li>
              Tokens here are safe and <strong>cannot be captured</strong>.
            </li>
            <li>Multiple tokens (even from different players) can share the space.</li>
          </ul>
        </div>

        <div className="section">
          <h2>🏠 Reaching Home</h2>
          <ul>
            <li>After a full loop, enter the home column.</li>
            <li>
              Tokens must reach the Home Triangle with an <strong>exact roll</strong>.
            </li>
            <li>Tokens in the Home Triangle are safe and cannot be captured.</li>
          </ul>
        </div>

        <div className="section">
          <h2>🏁 Winning the Game</h2>
          <ul>
            <li>The first player to move all 4 tokens to their Home Triangle wins.</li>
            <li>In 3-4 player games, others continue until only one player remains.</li>
            <li>When the second-last player finishes, the remaining player is placed last.</li>
            <li>
              <strong>Final Rankings:</strong> 1st → 2nd → 3rd → Last (based on finish order).
            </li>
          </ul>
        </div>

        <div className="section">
          <h2>💡 Quick Tips</h2>
          <ul>
            <li>🚀 Activate tokens early - More options to move</li>
            <li>↔️ Spread them out - Stacking doesn't protect you</li>
            <li>🛑 Use safe zones - Only place where you're safe</li>
            <li>👀 Watch your landings - Avoid capture range</li>
            <li>🎯 Capture wisely - Delay opponents' progress</li>
            <li>🏠 Advance steadily - Don't stall chasing others</li>
            <li>🎲 Plan for exact rolls - Needed to reach home</li>
          </ul>
        </div>
      </div>
      <Link className="play-now-btn" type="button" to="/">
        🔥 Play Now
      </Link>
    </div>
  );
}

export default HowToPlay;
