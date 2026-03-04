import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import styles from './ErrorBoundary.module.css';
import { useEffect } from 'react';
import { useCleanup } from '../../hooks/useCleanup';

function ErrorBoundary() {
  const error = useRouteError();
  const cleanup = useCleanup();

  const getError = (error: unknown) => {
    if (isRouteErrorResponse(error)) {
      return (
        <>
          <p>
            {error.status} {error.statusText}
          </p>
          <p>{error.data}</p>
        </>
      );
    } else if (error instanceof Error) {
      return (
        <div>
          <p>{error.message}</p>
          <pre>{error.stack}</pre>
        </div>
      );
    } else {
      return <p>Unknown Error</p>;
    }
  };

  useEffect(() => {
    document.title = 'Oops! Something went wrong';
    cleanup();
  }, [cleanup]);
  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorDialog}>
        <div>
          <p className={styles.oops}>
            <span>Oops!</span> Something went wrong
          </p>
          <p className={styles.message}>
            An unexpected error interrupted the game. Tap below to restart
          </p>
        </div>
        <button
          className={styles.startNewGameBtn}
          onClick={() => (window.location.href = '/setup')}
        >
          Start New Game
        </button>
        <details className={styles.errorDetails}>
          <summary>Show details</summary>
          <div className={styles.errorContent}>{getError(error)}</div>
        </details>
      </div>
    </div>
  );
}

export default ErrorBoundary;
