import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// בבנייה לפרודקשן (GitHub Pages) האתר יושב תחת /israel-lotto-analytics/.
// בפיתוח מקומי (npm run dev) הוא יושב תחת / — כדי שיהיה פשוט לפתוח.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/israel-lotto-analytics/' : '/',
  plugins: [react(), tailwindcss()],
  server: { port: 5180, open: true },
  // מאגר ההגרלות (draws.json) נארז במכוון לתוך האפליקציה לעבודה מקומית/לא-מקוונת
  build: { chunkSizeWarningLimit: 800 },
}));
