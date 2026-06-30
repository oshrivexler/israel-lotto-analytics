import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5180, open: true },
  // מאגר ההגרלות (draws.json) נארז במכוון לתוך האפליקציה לעבודה מקומית/לא-מקוונת
  build: { chunkSizeWarningLimit: 800 },
});
