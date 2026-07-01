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

const svg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#d8324a"/><stop offset="1" stop-color="#a8123a"/>
    </linearGradient>
    <radialGradient id="ball" cx="0.38" cy="0.30" r="0.8">
      <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#f1e7db"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <circle cx="256" cy="256" r="150" fill="url(#ball)"/>
  <polyline points="176,264 212,264 236,212 268,304 290,250 336,250" fill="none"
    stroke="#c8102e" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="354" cy="166" r="35" fill="#e8b23a" stroke="#ffffff" stroke-width="7"/>
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
