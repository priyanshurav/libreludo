import { Link } from 'react-router-dom';
import './NotFound.css';

function NotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-dialog">
        <h1>404</h1>
        <p className="oops">🎲 Oops! You've rolled the wrong number.</p>
        <p className="message">The page you're looking for doesn't exist.</p>
        <Link className="go-to-home-btn" to="/">
          Go to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
