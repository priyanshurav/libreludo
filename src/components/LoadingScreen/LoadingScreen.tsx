import './LoadingScreen.css';

function LoadingScreen() {
  return (
    <div className="loader">
      <div className="dice-shadow">
        <div className="dice-face">
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="ludo-tokens">
        <div className="token-colour-dot blue" />
        <div className="token-colour-dot red" />
        <div className="token-colour-dot green" />
        <div className="token-colour-dot yellow" />
      </div>
      <p className="loader-text">Rolling into the game...</p>
    </div>
  );
}

export default LoadingScreen;
