import { Link, type MetaFunction } from 'react-router';
import { useEffect } from 'react';
import { useCleanup } from '../../hooks/useCleanup';
import GitHubLogo from '../../assets/icons/github-mark-white.svg?react';
import LicenseIcon from '../../assets/icons/license.svg?react';
import ShareIcon from '../../assets/icons/share.svg?react';
import styles from './HomePage.module.css';
import clsx from 'clsx';
import { logError } from '../../utils/logError';
import { H } from '../../components/H/H';

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

          <nav aria-label="Quick actions" className={styles.ctaButtons}>
            <Link className={clsx(styles.ctaButton, styles.playNowBtn)} to="/setup">
              <H c="🔥" /> Play Now!
            </Link>
            <Link className={clsx(styles.ctaButton, styles.howToPlayBtn)} to="/how-to-play">
              How to Play
            </Link>
          </nav>
        </section>

        <section className={styles.features} aria-label="Features">
          <div className={styles.block}>
            <h2>
              <H c="⚡" /> Instant Play
            </h2>
            <p>No sign-ups. Open the page and jump straight into a game.</p>
          </div>

          <div className={styles.block}>
            <h2>
              <H c="🚫" /> Zero Ads
            </h2>
            <p>No pop-ups, no unskippable videos between turns. Just the game.</p>
          </div>

          <div className={styles.block}>
            <h2>
              <H c="🔒" /> 100% Private
            </h2>
            <p>Your game data stays on your device. No accounts, tracking, or ads.</p>
          </div>

          <div className={styles.block}>
            <h2>
              <H c="📖" /> Open Source
            </h2>
            <p>
              Free forever, with the full source code on GitHub for anyone to inspect or contribute
              to.
            </p>
          </div>
        </section>
      </main>

      <footer>
        <div className={styles.text}>
          <p className={styles.credits}>
            Made with{' '}
            <span aria-label="love" role="img">
              ❤️
            </span>{' '}
            by{' '}
            <a
              href="https://github.com/priyanshurav"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="@priyanshurav on GitHub (opens in a new tab)"
            >
              @priyanshurav
            </a>
          </p>
          <small className={styles.copyright}>
            Copyright &copy; 2025&ndash;{new Date().getFullYear()} Priyanshu Rav &middot;{' '}
            <a
              href="/LICENSE.txt"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Read the LibreLudo AGPLv3 License (opens in a new tab)"
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
            aria-label="View Source on GitHub (opens in a new tab)"
            title="View Source on GitHub"
            className={styles.iconBtn}
            rel="noopener noreferrer"
          >
            <GitHubLogo aria-hidden="true" />
          </a>
          <a
            href="/THIRD_PARTY_LICENSES.txt"
            target="_blank"
            aria-label="Third Party Open Source Licenses (opens in a new tab)"
            title="Third Party Open Source Licenses"
            className={styles.iconBtn}
            rel="noopener noreferrer"
          >
            <LicenseIcon aria-hidden="true" />
          </a>
          <button
            type="button"
            className={styles.iconBtn}
            aria-label="Share LibreLudo"
            title="Share LibreLudo"
            onClick={share}
          >
            <ShareIcon aria-hidden="true" />
          </button>
        </div>
      </footer>
    </div>
  );
}

export const meta: MetaFunction = () => [{ title: 'LibreLudo | Free and Open Source Ludo Game' }];
