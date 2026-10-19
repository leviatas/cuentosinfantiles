import { Link } from 'react-router-dom';

export default function ResumeCard({ bookId, owner, entry, compact = false }) {
  if (!entry) return null;
  return (
    <Link to={`/${bookId}/${entry.num}`} className={`resume${compact ? ' compact' : ''}`} data-book={bookId}>
      <span className="resume-kicker">{owner} estaba leyendo</span>
      <span className="resume-title display">
        <span className="resume-num">Cap. {entry.num}</span>
        {entry.title && <span> · {entry.title}</span>}
      </span>
      <span className="resume-go">Seguir leyendo →</span>
    </Link>
  );
}
