import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useCleanup } from '../../hooks/useCleanup';
import GitHubLogo from '../../assets/icons/github-mark-white.svg?react';
import './HomePage.css';

function HomePage() {
  const cleanup = useCleanup();
  useEffect(() => {
    document.title = 'LibreLudo';
    cleanup();
  }, [cleanup]);
  return (
    <div className="page-container">
      <main className="home-page">
        <section className="welcome">
          <h1>
            <span>Welcome to</span> LibreLudo
          </h1>
          <p>Roll the dice, compete with friends, and send your tokens home first.</p>
          <section className="cta-buttons">
            <Link className="cta-button play-now-btn" to="/setup">
              🔥 Play Now!
            </Link>
            <Link className="cta-button how-to-play-btn" to="/how-to-play">
              How to Play
            </Link>
          </section>
        </section>
        <section className="information">
          <section className="why-play-libreludo">
            <h2>🔥 Why Play LibreLudo?</h2>
            <ul>
              <li>Smooth, modern interface for easy gameplay.</li>
              <li>Family-friendly: perfect for kids and adults alike.</li>
              <li>Works great on mobile and desktop devices.</li>
              <li>No registration—play instantly!</li>
            </ul>
          </section>
          <section className="history">
            <h2>📜 History of Ludo</h2>
            <dl>
              <dt>Origins</dt>
              <dd>
                Ludo is based on the ancient Indian game Pachisi, played as early as the 6th century
                CE.
              </dd>
              <dt>Modern Development</dt>
              <dd>
                In 1896, a simpler version called "Ludo" was patented in England, using dice and a
                square board.
              </dd>
              <dt>Gameplay</dt>
              <dd>Players race colored tokens from start to finish based on dice rolls.</dd>
              <dt>Worldwide Popularity</dt>
              <dd>Today, Ludo is enjoyed globally in both board and digital forms.</dd>
            </dl>
          </section>
        </section>
      </main>
      <footer>
        <div className="text">
          <a href="#" target="_blank" rel="noopener noreferrer">
            Made with ❤️ by @username
          </a>
          <span>Copyright &copy; {new Date().getFullYear()} LibreLudo</span>
        </div>
        <div className="links">
          <a href="#" target="_blank" rel="noopener noreferrer">
            <GitHubLogo />
            Repository
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer">
            License
          </a>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
