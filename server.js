import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, 'dist');
const PORT = process.env.PORT || 3000;

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

// SPA fallback: React Router handles /amelia, /didi/12, etc.
app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(DIST, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Cuentos infantiles running at http://0.0.0.0:${PORT}`);
});
