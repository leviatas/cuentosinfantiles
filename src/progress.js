import { useEffect, useState } from 'react';
import { BOOK_IDS } from './books.js';
import { readStore, writeStore } from './prefs.js';

// El último cuento de cada nena se guarda en el navegador (para que ande sin conexión)
// y en el servidor (para que se recuerde en todos los dispositivos). Gana el más nuevo.
const localKey = (bookId) => `cuentos_last_${bookId}`;

function readLocal(bookId) {
  const value = readStore(localKey(bookId), null);
  // Versiones anteriores guardaban sólo el número de capítulo
  if (typeof value === 'number') return { num: value, title: '', at: 0 };
  return value && Number.isInteger(value.num) ? value : null;
}

const newer = (a, b) => (!a ? b : !b ? a : (b.at || 0) > (a.at || 0) ? b : a);

export function saveProgress(bookId, chapter) {
  const entry = { num: chapter.num, title: chapter.title, at: Date.now() };
  writeStore(localKey(bookId), entry);
  fetch(`/api/progress/${bookId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ num: entry.num, title: entry.title }),
  }).catch(() => {
    /* sin servidor: queda guardado en este navegador */
  });
}

export function useProgress() {
  const [progress, setProgress] = useState(() =>
    Object.fromEntries(BOOK_IDS.map((id) => [id, readLocal(id)])),
  );

  useEffect(() => {
    let alive = true;
    fetch('/api/progress')
      .then((r) => (r.ok ? r.json() : {}))
      .then((server) => {
        if (!alive) return;
        setProgress((local) =>
          Object.fromEntries(
            BOOK_IDS.map((id) => {
              const best = newer(local[id], server[id]);
              if (best && best !== local[id]) writeStore(localKey(id), best);
              return [id, best];
            }),
          ),
        );
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return progress;
}
