import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { BOOKS, flatChapters } from '../books.js';
import Controls from '../components/Controls.jsx';
import { usePrefs } from '../prefs.js';
import { saveProgress } from '../progress.js';

const fmt = new Intl.NumberFormat('es-AR');

function Block({ block }) {
  if (block.type === 'break') {
    return (
      <div className="scene-break" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    );
  }
  if (block.type === 'note') {
    return (
      <aside className="nota">
        <span className="pin" aria-hidden="true" />
        <span dangerouslySetInnerHTML={{ __html: block.html }} />
      </aside>
    );
  }
  return <p className={block.type} dangerouslySetInnerHTML={{ __html: block.html }} />;
}

function chapterText(ch) {
  const tmp = document.createElement('div');
  const body = ch.blocks
    .filter((b) => b.html)
    .map((b) => {
      tmp.innerHTML = b.html.replace(/<br>/g, '\n');
      return tmp.textContent;
    })
    .join('\n\n');
  return `Capítulo ${ch.num}: ${ch.title}\n\n${body}`;
}

function CopyButton({ chapter }) {
  const [ok, setOk] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(chapterText(chapter));
      setOk(true);
      setTimeout(() => setOk(false), 1600);
    } catch {
      /* el navegador no dejó copiar */
    }
  };
  return (
    <button className={`copy-btn${ok ? ' ok' : ''}`} type="button" onClick={copy}>
      {ok ? '¡Copiado!' : 'Copiar cuento'}
    </button>
  );
}

export default function Reader() {
  const { bookId, num } = useParams();
  const meta = BOOKS[bookId];
  const prefs = usePrefs();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [query, setQuery] = useState('');
  const [navOpen, setNavOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!meta) return;
    let alive = true;
    setBook(null);
    meta.load().then((b) => alive && setBook(b));
    return () => {
      alive = false;
    };
  }, [meta]);

  const chapters = useMemo(() => (book ? flatChapters(book) : []), [book]);
  const index = num ? chapters.findIndex((c) => String(c.num) === num) : -1;
  const chapter = index >= 0 ? chapters[index] : null;
  const totalWords = useMemo(() => chapters.reduce((s, c) => s + c.words, 0), [chapters]);

  useEffect(() => {
    document.title = chapter ? `${chapter.num}. ${chapter.title} · ${meta?.title}` : meta?.title || 'Cuentos';
    if (chapter) saveProgress(bookId, chapter);
    window.scrollTo(0, 0);
    setProgress(0);
    setNavOpen(false);
  }, [chapter, bookId, meta]);

  useEffect(() => {
    if (!chapter) return;
    // Sólo se mueve el índice: scrollIntoView movería también la página
    const toc = document.querySelector('.toc');
    const el = toc?.querySelector('.chap-link.active');
    if (el) toc.scrollTop = el.offsetTop - toc.clientHeight / 2;
  }, [chapter]);

  // El capítulo se desplaza con la página (no en un contenedor propio) para que el
  // zoom con dos dedos del celular pueda moverse para los costados.
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (!chapter || e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight' && chapters[index + 1]) navigate(`/${bookId}/${chapters[index + 1].num}`);
      if (e.key === 'ArrowLeft' && chapters[index - 1]) navigate(`/${bookId}/${chapters[index - 1].num}`);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [chapter, chapters, index, bookId, navigate]);

  if (!meta) return <Navigate to="/" replace />;
  if (book && num && !chapter) return <Navigate to={`/${bookId}`} replace />;

  const q = query.trim().toLowerCase();
  const matches = (c) => !q || String(c.num) === q || c.title.toLowerCase().includes(q);

  const prev = chapters[index - 1];
  const next = chapters[index + 1];

  return (
    <div className={`reader${navOpen ? ' nav-open' : ''}`} data-book={bookId}>
      <div className="progress" role="progressbar" aria-label="Progreso de lectura" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(progress * 100)}>
        <div className="track">
          <div className="fill" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>

      <aside className="sidebar" aria-label="Índice de capítulos">
        <div className="brand">
          <Link to="/" className="back-home">← Inicio</Link>
          <Link to={`/${bookId}`} className="brand-title">
            <span aria-hidden="true">{meta.emoji}</span>
            <span className="display">{meta.title}</span>
          </Link>
          <div className="sub">
            Los cuentos de {meta.owner}
            {book && ` · ${chapters.length} capítulos`}
          </div>
          <Controls prefs={prefs} />
        </div>
        <div className="search">
          <input
            type="search"
            placeholder="Buscar capítulo…"
            aria-label="Buscar capítulo por número o título"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <nav className="toc">
          {book?.parts.map((part, pi) => {
            const list = part.chapters.filter(matches);
            if (!list.length) return null;
            return (
              <div key={pi} data-part={pi % 5}>
                <div className="toc-part">
                  <span className="pdot" aria-hidden="true" />
                  <div>
                    <span className="plabel">{part.label}</span>
                    <span className="pname">{part.name}</span>
                  </div>
                </div>
                {list.map((c) => (
                  <Link
                    key={c.num}
                    to={`/${bookId}/${c.num}`}
                    className={`chap-link${chapter?.num === c.num ? ' active' : ''}`}
                  >
                    <span className="cnum">{c.num}</span>
                    <span className="cttl">
                      {c.emoji && <span aria-hidden="true">{c.emoji} </span>}
                      {c.title}
                      <span className="cwords">{c.words} palabras</span>
                    </span>
                  </Link>
                ))}
              </div>
            );
          })}
          {book && !chapters.some(matches) && <div className="no-results">No hay capítulos con ese nombre.</div>}
        </nav>
      </aside>
      <div className="scrim" onClick={() => setNavOpen(false)} />

      <div className="topbar">
        <Link to="/" className="ctl" aria-label="Volver al inicio">←</Link>
        <span className="tb-title display">{meta.title}</span>
        <button className="ctl" type="button" onClick={() => setNavOpen(true)}>
          ☰ Índice
        </button>
      </div>

      <main className="content">
        <div className="col">
          {!book && <div className="loading">Abriendo el libro…</div>}

          {book && !chapter && (
            <section className="cover">
              <div className="cover-emoji" aria-hidden="true">{meta.emoji}</div>
              <p className="eyebrow">Los cuentos de {meta.owner}</p>
              <h1 className="display cover-title">{meta.title}</h1>
              <p className="cover-sub">
                {chapters.length} capítulos · {fmt.format(totalWords)} palabras
              </p>
              <p className="cover-heroes">{meta.tagline}, con {meta.heroes}.</p>
              <div className="cover-parts">
                {book.parts.map((part, pi) => (
                  <Link key={pi} to={`/${bookId}/${part.chapters[0].num}`} className="cover-part" data-part={pi % 5}>
                    <span className="plabel">{part.label}</span>
                    <span className="pname">{part.name}</span>
                    {!part.label.includes('caps.') && (
                      <span className="cwords">
                        caps. {part.chapters[0].num}–{part.chapters.at(-1).num}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
              <Link to={`/${bookId}/${chapters[0].num}`} className="start-btn display">
                Empezar a leer →
              </Link>
            </section>
          )}

          {chapter && (
            <article className="chapter" data-part={chapter.partIndex % 5}>
              <div className="eyebrow">
                <span className="pill" aria-hidden="true" />
                {chapter.part.label} · {chapter.part.name}
              </div>
              <div className="chap-hero">
                <div className="big-num" aria-hidden="true">{chapter.num}</div>
                <div>
                  <h2 className="chap-title display">
                    {chapter.emoji && <span aria-hidden="true">{chapter.emoji} </span>}
                    {chapter.title}
                  </h2>
                  <div className="chap-meta">
                    <span className="wc">Cap. {chapter.num} · {chapter.words} palabras</span>
                    <CopyButton chapter={chapter} />
                  </div>
                </div>
              </div>
              <div className="rule" aria-hidden="true" />
              <div className="prose">
                {chapter.blocks.map((b, i) => (
                  <Block key={i} block={b} />
                ))}
              </div>
              <nav className="chap-nav" aria-label="Navegación del capítulo">
                <button className="nav-btn prev" type="button" disabled={!prev} onClick={() => navigate(`/${bookId}/${prev.num}`)}>
                  <span className="nk">← Anterior</span>
                  <span className="nt">{prev ? `Cap. ${prev.num}` : 'Es el primero'}</span>
                </button>
                <button className="nav-btn idx" type="button" onClick={() => navigate(`/${bookId}`)}>
                  <span className="nk">↑ Índice</span>
                  <span className="nt">Ver todos</span>
                </button>
                <button className="nav-btn next" type="button" disabled={!next} onClick={() => navigate(`/${bookId}/${next.num}`)}>
                  <span className="nk">Siguiente →</span>
                  <span className="nt">{next ? `Cap. ${next.num}` : 'Es el último'}</span>
                </button>
              </nav>
            </article>
          )}
        </div>
      </main>
    </div>
  );
}
