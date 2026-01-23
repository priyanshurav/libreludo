import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useCleanup } from '../../hooks/useCleanup';
import GitHubLogo from '../../assets/icons/github-mark-white.svg?react';
import ShareIcon from '../../assets/icons/share.svg?react';
import './HomePage.css';

function HomePage() {
  const cleanup = useCleanup();

  const share: React.MouseEventHandler<HTMLButtonElement> = async () => {
    const shareData: ShareData = {
      title: 'LibreLudo',
      text: 'Play Ludo locally with friends on LibreLudo!',
      url: 'https://libreludo.org/',
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (import.meta.env.DEV) console.error(err);
      }
    } else {
      navigator.clipboard.writeText('https://libreludo.org/');
      alert('Link copied to clipboard!');
    }
  };

  useEffect(() => {
    document.title = 'LibreLudo | Free and Open Source Ludo Game';
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
          <a href="https://github.com/priyanshurav" target="_blank" rel="noopener noreferrer">
            Made with ❤️ by @priyanshurav
          </a>
          <span>Copyright &copy; 2025&ndash;{new Date().getFullYear()} Priyanshu Rav</span>
        </div>
        <div className="footer-actions">
          <a
            href="https://github.com/priyanshurav/libreludo"
            target="_blank"
            aria-label="View Source on GitHub"
            className="icon-btn"
            rel="noopener noreferrer"
          >
            <GitHubLogo />
          </a>
          <button className="icon-btn" aria-label="Share" onClick={share}>
            <ShareIcon />
          </button>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
