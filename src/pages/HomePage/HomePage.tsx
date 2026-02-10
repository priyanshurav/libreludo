import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useCleanup } from '../../hooks/useCleanup';
import GitHubLogo from '../../assets/icons/github-mark-white.svg?react';
import ShareIcon from '../../assets/icons/share.svg?react';
import styles from './HomePage.module.css';
import clsx from 'clsx';

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
        console.error(err);
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
    <div className={styles.pageContainer}>
      <main className={styles.homePage}>
        <section className={styles.welcome}>
          <h1>
            <span>Welcome to</span> LibreLudo
          </h1>
          <p>Roll the dice, compete with friends, and send your tokens home first.</p>
          <nav className={styles.ctaButtons}>
            <Link className={clsx(styles.ctaButton, styles.playNowBtn)} to="/setup">
              🔥 Play Now!
            </Link>
            <Link className={clsx(styles.ctaButton, styles.howToPlayBtn)} to="/how-to-play">
              How to Play
            </Link>
          </nav>
        </section>
        <div className={styles.information}>
          <section className={styles.whyPlayLibreludo}>
            <h2>🔥 Why Play LibreLudo?</h2>
            <ul>
              <li>Smooth, modern interface for easy gameplay.</li>
              <li>Family-friendly: perfect for kids and adults alike.</li>
              <li>Works great on mobile and desktop devices.</li>
              <li>No registration—play instantly!</li>
            </ul>
          </section>
          <section className={styles.history}>
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
        </div>
      </main>
      <footer>
        <div className={styles.text}>
          <p className={styles.credits}>
            Made with{' '}
            <span aria-label="love" role="img">
              ❤️
            </span>{' '}
            by{' '}
            <a href="https://github.com/priyanshurav" target="_blank" rel="noopener noreferrer">
              @priyanshurav
            </a>
          </p>
          <small className={styles.copyright}>
            Copyright &copy; 2025&ndash;{new Date().getFullYear()} Priyanshu Rav
          </small>
        </div>
        <div className={styles.footerActions}>
          <a
            href="https://github.com/priyanshurav/libreludo"
            target="_blank"
            aria-label="View Source on GitHub"
            className={styles.iconBtn}
            rel="noopener noreferrer"
          >
            <GitHubLogo />
          </a>
          <button className={styles.iconBtn} aria-label="Share this game" onClick={share}>
            <ShareIcon />
          </button>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
