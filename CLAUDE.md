# CLAUDE.md — Guía del proyecto

Lector de cuentos infantiles (React + Vite, servido por Express dockerizado,
publicado con un túnel de Cloudflare). Textos de UI en español rioplatense.

- `src/pages/Home.jsx`: inicio, elige entre los cuentos de Amelia y de Didi.
- `src/pages/Reader.jsx`: portada/índice (`/:bookId`) y capítulo (`/:bookId/:num`).
- `src/books.js`: metadatos de cada libro; el JSON se importa bajo demanda.
- `src/data/*.json`: `{ parts: [{ label, name, chapters: [{ num, title, emoji?, words, blocks }] }] }`.
  Tipos de bloque: `p`, `dialog`, `aside`, `sign` (cartel), `note` (nota pinchada), `break`.
  El `html` sólo contiene `<strong>`, `<em>` y `<br>` (lo limpia `scripts/extract.py`).
- Capítulos nuevos: texto plano en `cuentos/<libro>/parte-N/NNN-titulo.txt`, se suman
  con `python3 scripts/add_chapters.py <libro>` (formato en el docstring del script).
  Amelia: ~1000 palabras por capítulo, cada martes a las cuatro Cacu hace un plan
  numerado (el último fue el 380, cap. 155) y termina en el tacho reservado; Mora es
  su aprendiz; cada capítulo cierra con una moraleja (`~ Moraleja: ...`).
  Didi: capítulos con emoji, tono más emotivo, sin moraleja explícita; Pipa es "él"
  (redondito, escribe con faltas), Cacu es "Fideo" del Pueblo Gris. Último: cap. 109.
- `server.js`: sirve `dist/` con fallback a `index.html` para las rutas del SPA.
- Preferencias (tema, letra, mayúsculas) en localStorage con try/catch.
- Último cuento de cada nena (`src/progress.js`): localStorage + `GET/PUT /api/progress`
  en `server.js`, guardado en `data/progress.json` (volumen `./data`); gana el más nuevo.
  Se muestra como "Seguir leyendo · cap. N" abajo de cada tarjeta del inicio.

Deploy: `docker compose up -d --build` (puerto 5175) y verificar
`curl -s http://localhost:5175/health`.
