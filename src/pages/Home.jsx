import { Link } from 'react-router-dom';
import { BOOKS, BOOK_IDS } from '../books.js';
import Controls from '../components/Controls.jsx';
import ResumeCard from '../components/ResumeCard.jsx';
import { usePrefs } from '../prefs.js';
import { useProgress } from '../progress.js';

export default function Home() {
  const prefs = usePrefs();
  const progress = useProgress();
  const reading = BOOK_IDS.filter((id) => progress[id]);

  return (
    <div className="home">
      <header className="home-head">
        <div className="moon" aria-hidden="true">🌙</div>
        <h1 className="display">Cuentos para dormir</h1>
        <p className="home-sub">¿De quién son los cuentos de hoy?</p>
      </header>

      {reading.length > 0 && (
        <section className="resume-row" aria-label="Seguir leyendo">
          {reading.map((id) => (
            <ResumeCard key={id} bookId={id} owner={BOOKS[id].owner} entry={progress[id]} />
          ))}
        </section>
      )}

      <div className="picker">
        {BOOK_IDS.map((id) => {
          const book = BOOKS[id];
          return (
            <div key={id} className="pick-card" data-book={id}>
              <Link to={`/${id}`} className="pick-main">
                <span className="pick-emoji" aria-hidden="true">{book.emoji}</span>
                <span className="pick-owner display">Los cuentos de {book.owner}</span>
                <span className="pick-title">{book.title}</span>
                <span className="pick-heroes">{book.heroes}</span>
              </Link>
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
