import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, 'dist');
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const PROGRESS_FILE = path.join(DATA_DIR, 'progress.json');
const BOOK_IDS = ['amelia', 'didi'];

// Último cuento leído de cada nena, compartido entre todos los dispositivos
function readProgress() {
  try {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function writeProgress(progress) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${PROGRESS_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(progress, null, 2));
  fs.renameSync(tmp, PROGRESS_FILE);
}

const app = express();

// Trust the cloudflared/reverse-proxy headers so req.ip is the real visitor IP
app.set('trust proxy', true);

// Hashed assets can be cached forever; index.html never, so each deploy is picked up
app.use('/assets', express.static(path.join(DIST, 'assets'), { immutable: true, maxAge: '1y' }));
app.use(express.static(DIST, {
  index: false,
  setHeaders: (res) => res.setHeader('Cache-Control', 'no-cache'),
}));

app.get('/health', (req, res) => res.send('ok'));

app.get('/api/progress', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json(readProgress());
});

app.put('/api/progress/:bookId', express.json({ limit: '2kb' }), (req, res) => {
  const { bookId } = req.params;
  const num = Number(req.body?.num);
  if (!BOOK_IDS.includes(bookId) || !Number.isInteger(num) || num < 1 || num > 9999) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }
  const title = String(req.body?.title || '').slice(0, 200);
  const progress = readProgress();
  progress[bookId] = { num, title, at: Date.now() };
  writeProgress(progress);
  res.json(progress[bookId]);
});

// SPA fallback: React Router handles /amelia, /didi/12, etc.
app.get(/^(?!\/api\/).*/, (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(DIST, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Cuentos infantiles running at http://0.0.0.0:${PORT}`);
});
