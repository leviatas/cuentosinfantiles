import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  // Los cuentos van en chunks propios (amelia/didi) que se cargan al abrir cada libro
  build: { chunkSizeWarningLimit: 800 },
});
