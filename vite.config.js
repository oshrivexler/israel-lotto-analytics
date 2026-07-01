import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

const BASE = '/israel-lotto-analytics/';

// בבנייה לפרודקשן (GitHub Pages) האתר יושב תחת /israel-lotto-analytics/.
// בפיתוח מקומי (npm run dev) הוא יושב תחת / — כדי שיהיה פשוט לפתוח.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? BASE : '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.png', 'icon.svg', 'icons/*.png'],
      manifest: {
        id: BASE,
        name: 'לוטומטריקס — ניתוח וחיזוי לוטו',
        short_name: 'לוטומטריקס',
        description: 'ניתוח סטטיסטי וחיזוי ללוטו הישראלי (6/37) — צמדים חזקים, לוטו שיטתי ועוד.',
        lang: 'he',
        dir: 'rtl',
        theme_color: '#f5f1ea',
        background_color: '#f5f1ea',
        display: 'standalone',
        orientation: 'portrait',
        start_url: BASE,
        scope: BASE,
        categories: ['entertainment', 'utilities'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'התחזיות', short_name: 'תחזיות', url: `${BASE}#predictions` },
          { name: 'צמדים חזקים', short_name: 'צמדים', url: `${BASE}#pairs` },
          { name: 'לוטו שיטתי', short_name: 'שיטתי', url: `${BASE}#systematic` },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,json}'],
        navigateFallback: `${BASE}index.html`,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 }, cacheableResponse: { statuses: [0, 200] } },
          },
        ],
      },
    }),
  ],
  server: { port: 5180, open: true },
  build: { chunkSizeWarningLimit: 800 },
}));
