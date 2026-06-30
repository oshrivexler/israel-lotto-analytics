/**
 * משיכת תוצאות הלוטו העדכניות מאתר מפעל הפיס.
 * מקור רשמי: קובץ ה-CSV המלא של פיס (כל ההיסטוריה, קידוד windows-1255).
 * שומר אל data/lotto.csv. יוצא עם קוד שגיאה אם המשיכה נכשלה או שהתוכן אינו תקין
 * (כדי שתהליך העדכון לא ידרוס נתונים טובים בקובץ פגום/חסום).
 *
 * הרצה:  node analysis/fetch.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data', 'lotto.csv');
const SRC = process.env.LOTTO_URL || 'https://www.pais.co.il/lotto/lotto_resultsDownload.aspx';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

try {
  const res = await fetch(SRC, {
    headers: { 'User-Agent': UA, Accept: 'text/csv,application/text,*/*', 'Accept-Language': 'he-IL,he;q=0.9' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

  const buf = Buffer.from(await res.arrayBuffer());
  // אימות: הכותרת (windows-1255) חייבת להכיל את המילה "הגרלה", והקובץ בגודל סביר
  const head = new TextDecoder('windows-1255').decode(buf.subarray(0, 256));
  if (buf.length < 50000 || !head.includes('הגרלה')) {
    throw new Error(`התוכן אינו נראה כקובץ הלוטו התקין (גודל ${buf.length}, ייתכן חסימה/דף שגיאה)`);
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, buf);
  const lines = new TextDecoder('windows-1255').decode(buf).split(/\r?\n/).filter((l) => l.trim());
  console.log(`✓ נמשכו ${buf.length} בייטים (${lines.length - 1} הגרלות) → ${path.relative(ROOT, OUT)}`);
  console.log(`  הגרלה אחרונה בקובץ: ${lines[1]?.split(',').slice(0, 2).join('  ')}`);
} catch (e) {
  console.error(`✗ משיכת הנתונים מפיס נכשלה: ${e.message}`);
  process.exit(1);
}
