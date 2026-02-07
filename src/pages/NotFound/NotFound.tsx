import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';
import { useEffect } from 'react';
import { useCleanup } from '../../hooks/useCleanup';

function NotFound() {
  const cleanup = useCleanup();

  useEffect(() => {
    document.title = '404 Not Found';
    cleanup();
  }, [cleanup]);
  return (
    <div className={styles.notFoundContainer}>
      <div className={styles.notFoundDialog}>
        <h1>404</h1>
        <p className={styles.oops}>🎲 Oops! You've rolled the wrong number.</p>
        <p className={styles.message}>The page you're looking for doesn't exist.</p>
        <Link className={styles.goToHomeBtn} to="/">
          Go to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
