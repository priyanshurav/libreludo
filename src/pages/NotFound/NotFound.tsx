import { Link, type MetaFunction } from 'react-router';
import styles from './NotFound.module.css';
import { useEffect } from 'react';
import { useCleanup } from '../../hooks/useCleanup';
import { H } from '../../components/H/H';

export default function NotFound() {
  const cleanup = useCleanup();

  useEffect(() => {
    cleanup();
  }, [cleanup]);

  return (
    <div className={styles.notFoundContainer}>
      <div className={styles.notFoundDialog}>
        <h1>404</h1>
        <p className={styles.oops}>
          <H c="🎲" /> Oops! You've rolled the wrong number.
        </p>
        <p className={styles.message}>The page you're looking for doesn't exist.</p>
        <Link className={styles.goToHomeBtn} to="/">
          Go to Home
        </Link>
      </div>
    </div>
  );
}

export const meta: MetaFunction = () => [{ title: '404 Not Found' }];
