import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage(props) {
  return (
    <div className="homepage">
      <header className="header">
        <h1>Ludo Arena</h1>
        <nav>
          <Link to="/instructions">Instructions</Link>
          <Link to="/license">License</Link>
        </nav>
      </header>

      <main className="main">
        <section className="hero">
          <h2>🎲 Welcome to Ludo Arena</h2>
          <p>A modern twist on the classic strategy game played by millions.</p>
          <div className="buttons">
            <Link to="/game" className="btn play">
              ▶️ Play Now
            </Link>
            <Link to="/instructions" className="btn secondary">
              📘 How to Play
            </Link>
          </div>
        </section>

        <section className="history">
          <h3>📜 A Brief History of Ludo</h3>
          <p>
            Ludo is based on the ancient Indian game "Pachisi", created in the 6th century. It was
            popular in royal courts and adapted into a simplified version by the British in the late
            19th century.
          </p>
          <p>
            Today, Ludo is enjoyed around the world for its blend of luck, tactics, and competitive
            fun — perfect for players of all ages!
          </p>
        </section>
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Ludo Arena. Built with fun in mind.</p>
      </footer>
    </div>
  );
  return <div>Hi</div>;
}

export default HomePage;
