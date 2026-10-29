import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';

// Versión que se muestra al pie del inicio: package.json + commit (lo pasa el deploy) + fecha del build
const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
const sha = process.env.GIT_SHA ? ` · ${process.env.GIT_SHA}` : '';
const built = new Date().toLocaleString('es-AR', {
  timeZone: 'America/Argentina/Buenos_Aires',
  dateStyle: 'short',
  timeStyle: 'short',
});

export default defineConfig({
  plugins: [react()],
  define: { __APP_VERSION__: JSON.stringify(`v${version}${sha} · ${built}`) },
  server: { port: 5173, proxy: { '/api': 'http://localhost:3000' } },
  // Los cuentos van en chunks propios (amelia/didi) que se cargan al abrir cada libro
  build: { chunkSizeWarningLimit: 800 },
});
