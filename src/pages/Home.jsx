import { Link } from 'react-router-dom';
import { BOOKS, BOOK_IDS } from '../books.js';
import Controls from '../components/Controls.jsx';
import { lastKey, readStore, usePrefs } from '../prefs.js';

export default function Home() {
  const prefs = usePrefs();

  return (
    <div className="home">
      <header className="home-head">
        <div className="moon" aria-hidden="true">🌙</div>
        <h1 className="display">Cuentos para dormir</h1>
        <p className="home-sub">¿De quién son los cuentos de hoy?</p>
      </header>

      <div className="picker">
        {BOOK_IDS.map((id) => {
          const book = BOOKS[id];
          const last = readStore(lastKey(id), null);
          return (
            <div key={id} className="pick-card" data-book={id}>
              <Link to={`/${id}`} className="pick-main">
                <span className="pick-emoji" aria-hidden="true">{book.emoji}</span>
                <span className="pick-owner display">Los cuentos de {book.owner}</span>
                <span className="pick-title">{book.title}</span>
                <span className="pick-heroes">{book.heroes}</span>
              </Link>
              {last && (
                <Link to={`/${id}/${last}`} className="pick-resume">
                  Seguir leyendo · cap. {last} →
                </Link>
              )}
            </div>
          );
        })}
      </div>

      <footer className="home-foot">
        <Controls prefs={prefs} />
      </footer>
    </div>
  );
}
