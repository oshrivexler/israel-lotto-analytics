/**
 * יצירת אייקוני האפליקציה (PWA) מ-SVG יחיד.
 * הרצה חד-פעמית: node scripts/gen-icons.mjs  (הפלט נשמר ונדחף ל-repo)
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUB = path.join(ROOT, 'public');
const ICONS = path.join(PUB, 'icons');
fs.mkdirSync(ICONS, { recursive: true });

// לוגו #1 — האות ל' לבנה + חץ-מגמה זהב עולה (בלי חפיפה), מלא-שוליים לאייקון PWA
const svg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#d8324a"/><stop offset="1" stop-color="#a8123a"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <!-- חץ-מגמה עולה (זהב) -->
  <polyline points="252,352 300,300 336,320 400,214" fill="none"
    stroke="#e8b23a" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
  <polyline points="368,206 404,208 402,244" fill="none"
    stroke="#e8b23a" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="300" cy="300" r="11" fill="#ffffff"/>
  <circle cx="336" cy="320" r="11" fill="#ffffff"/>
  <!-- האות ל' -->
  <text x="196" y="348" text-anchor="middle" font-family="Arial, sans-serif"
    font-size="250" font-weight="700" fill="#ffffff">ל</text>
</svg>`;

fs.writeFileSync(path.join(PUB, 'icon.svg'), svg);
const buf = Buffer.from(svg);

const jobs = [
  ['icons/icon-192.png', 192],
  ['icons/icon-512.png', 512],
  ['icons/apple-touch-icon.png', 180],
  ['favicon.png', 64],
];
for (const [rel, size] of jobs) {
  await sharp(buf).resize(size, size).png().toFile(path.join(PUB, rel));
  console.log(`✓ ${rel} (${size}px)`);
}
console.log('כל האייקונים נוצרו.');
