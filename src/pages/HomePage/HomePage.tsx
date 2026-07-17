import { Link, type MetaFunction } from 'react-router';
import { useEffect } from 'react';
import { useCleanup } from '../../hooks/useCleanup';
import GitHubLogo from '../../assets/icons/github-mark-white.svg?react';
import LicenseIcon from '../../assets/icons/license.svg?react';
import ShareIcon from '../../assets/icons/share.svg?react';
import styles from './HomePage.module.css';
import clsx from 'clsx';
import { logError } from '../../utils/logError';

export default function HomePage() {
  const cleanup = useCleanup();

  const share = async () => {
    const shareData: ShareData = {
      title: 'LibreLudo',
      text: 'Play Ludo locally with friends on LibreLudo!',
      url: 'https://libreludo.org/',
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText('https://libreludo.org/');
        alert('Link copied to clipboard!');
      }
    } catch (e) {
      logError('HomePage.share')(e);
    }
  };

  useEffect(() => {
    cleanup();
  }, [cleanup]);

  return (
    <div className={styles.pageContainer}>
      <main className={styles.homePage}>
        <section className={styles.welcome}>
          <h1>
            <span>Welcome to</span> LibreLudo
          </h1>
          <p>An ad-free, open-source Ludo game with local multiplayer and bot opponents</p>
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
            <h2>🔥 Why LibreLudo?</h2>
            <ul>
              <li>Free and open source. No paywall, ever.</li>
              <li>No sign-up. Open the page and play.</li>
              <li>No ads, no tracking.</li>
              <li>Works on phone, tablet, or desktop.</li>
            </ul>
          </section>

          <section className={styles.history}>
            <h2>📜 History of Ludo</h2>
            <dl>
              <dt>Origins</dt>
              <dd>Descended from Pachisi, played in India since the 6th century CE.</dd>
              <dt>Modern Version</dt>
              <dd>Patented in England in 1896 as a dice-and-fixed-board game.</dd>
              <dt>Gameplay</dt>
              <dd>
                Move four tokens home by dice roll, sending rivals back when you land on them.
              </dd>
              <dt>Today</dt>
              <dd>Still a household staple, now played as often online as on a physical board.</dd>
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
            Copyright &copy; 2025&ndash;{new Date().getFullYear()} Priyanshu Rav &{' '}
            <a
              href="https://github.com/priyanshurav/libreludo/graphs/contributors"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View LibreLudo Contributors on GitHub"
              title="View LibreLudo Contributors on GitHub"
            >
              Contributors
            </a>{' '}
            &middot;{' '}
            <a
              href="/LICENSE.txt"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Read the LibreLudo AGPLv3 License"
              title="Read the LibreLudo AGPLv3 License"
            >
              AGPLv3
            </a>
          </small>
        </div>
        <div className={styles.footerActions}>
          <a
            href="https://github.com/priyanshurav/libreludo"
            target="_blank"
            aria-label="View Source on GitHub"
            title="View Source on GitHub"
            className={styles.iconBtn}
            rel="noopener noreferrer"
          >
            <GitHubLogo />
          </a>
          <a
            href="/THIRD_PARTY_LICENSES.txt"
            target="_blank"
            aria-label="Third Party Open Source Licenses"
            title="Third Party Open Source Licenses"
            className={styles.iconBtn}
            rel="noopener noreferrer"
          >
            <LicenseIcon />
          </a>
          <button
            className={styles.iconBtn}
            aria-label="Share LibreLudo"
            title="Share LibreLudo"
            onClick={share}
          >
            <ShareIcon />
          </button>
        </div>
      </footer>
    </div>
  );
}

export const meta: MetaFunction = () => [{ title: 'LibreLudo | Free and Open Source Ludo Game' }];
