import clsx from 'clsx';
import styles from './LoadingScreen.module.css';

function LoadingScreen() {
  return (
    <div className={styles.loader}>
      <div className={styles.diceShadow}>
        <div className={styles.diceFace}>
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className={styles.ludoTokens}>
        <div className={clsx(styles.tokenColourDot, styles.blue)} />
        <div className={clsx(styles.tokenColourDot, styles.red)} />
        <div className={clsx(styles.tokenColourDot, styles.green)} />
        <div className={clsx(styles.tokenColourDot, styles.yellow)} />
      </div>
      <p className={styles.loaderText}>Rolling into the game...</p>
    </div>
  );
}

export default LoadingScreen;
