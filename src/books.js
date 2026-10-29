// Cada libro carga su JSON bajo demanda, así el inicio no baja los ~1 MB de cuentos.
export const BOOKS = {
  amelia: {
    id: 'amelia',
    owner: 'Amelia',
    title: 'Súper Labubus',
    tagline: 'Los cuentos de Labubulandia',
    heroes: 'Princesita, Viole, Bob, Blue y Coco',
    emoji: '🧁',
    portrait: '/retratos/amelia.jpg',
    load: () => import('./data/amelia.json').then((m) => m.default),
  },
  didi: {
    id: 'didi',
    owner: 'Didi',
    title: 'Las Superlabubus',
    tagline: 'Los cuentos del Reino Labubu',
    heroes: 'Sandita, Estrellita, Limoncito y Celestita',
    emoji: '🍉',
    portrait: '/retratos/didi.jpg',
    load: () => import('./data/didi.json').then((m) => m.default),
  },
};

export const BOOK_IDS = Object.keys(BOOKS);

export function flatChapters(book) {
  return book.parts.flatMap((part, partIndex) =>
    part.chapters.map((ch) => ({ ...ch, partIndex, part })),
  );
}
