import React, { useMemo, useState } from 'react';
import { History, Dice5, TrendingDown, Coins } from 'lucide-react';
import drawsData from '../data/draws.json';
import { Panel, pad2 } from '../lib/ui.jsx';

const LINE_PRICE = 5.8; // מחיר טור משוער בש"ח

/**
 * סימולטור "22 שנה": אם היית משחק את אותם המספרים בכל הגרלה לאורך כל ההיסטוריה —
 * כמה פעמים היית פוגע ב-3 / 4 / 5 / 6 מספרים? כלי מפכח על סיכויי הלוטו האמיתיים.
 */
export default function Simulator22() {
  const modern = useMemo(() => drawsData.draws.filter((d) => d.era === 'modern'), []);
  const [nums, setNums] = useState(['', '', '', '', '', '']);
  const [strong, setStrong] = useState('');
  const [res, setRes] = useState(null);
  const [error, setError] = useState('');

  const setAt = (i, v) => {
    const next = [...nums];
    next[i] = v.replace(/[^0-9]/g, '').slice(0, 2);
    setNums(next); setRes(null);
  };

  const fillRandom = () => {
    const pool = Array.from({ length: 37 }, (_, i) => i + 1);
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    setNums(pool.slice(0, 6).sort((a, b) => a - b).map(String));
    setStrong(String(Math.floor(Math.random() * 7) + 1));
    setRes(null); setError('');
  };

  const run = (e) => {
    e.preventDefault();
    const vals = nums.map((x) => parseInt(x, 10));
    if (vals.some((v) => !Number.isFinite(v))) { setError('יש למלא את כל 6 המספרים.'); setRes(null); return; }
    if (vals.some((v) => v < 1 || v > 37)) { setError('כל מספר חייב להיות בין 1 ל-37.'); setRes(null); return; }
    if (new Set(vals).size !== 6) { setError('המספרים חייבים להיות שונים זה מזה.'); setRes(null); return; }
    setError('');

    const mine = new Set(vals);
    const s = parseInt(strong, 10);
    const tiers = { 3: 0, 4: 0, 5: 0, 6: 0, '6s': 0 };
    for (const d of modern) {
      let hit = 0;
      for (const n of d.n) if (mine.has(n)) hit++;
      if (hit >= 3) tiers[hit] = (tiers[hit] || 0) + 1;
      if (hit === 6 && Number.isFinite(s) && d.s === s) tiers['6s']++;
    }
    const draws = modern.length;
    const spent = Math.round(draws * LINE_PRICE);
    setRes({ tiers, draws, spent, hasStrong: Number.isFinite(s) });
  };

  const TIERS = [
    { key: 3, label: '3 מספרים', note: 'פרס קטן קבוע', color: 'var(--color-cold)' },
    { key: 4, label: '4 מספרים', note: 'פרס בינוני', color: 'var(--color-cold)' },
    { key: 5, label: '5 מספרים', note: 'פרס גדול', color: 'var(--color-gold)' },
    { key: 6, label: '6 מספרים', note: 'הקופה!', color: 'var(--color-accent)' },
  ];

  return (
    <Panel title="סימולטור 22 שנה" subtitle="כמה היית זוכה אם היית משחק את אותם מספרים בכל הגרלה מאז 2004?" icon={History} accent="var(--color-accent)">
      <form onSubmit={run}>
        <div className="flex flex-wrap items-center gap-2">
          {nums.map((v, i) => (
            <input key={i} value={v} onChange={(e) => setAt(i, e.target.value)} inputMode="numeric" placeholder="–" aria-label={`מספר ${i + 1}`}
              className="tnum h-12 w-12 rounded-lg border border-line bg-base text-center text-[17px] font-bold text-ink outline-none transition-colors placeholder:text-faint focus:border-accent/60 focus:ring-2 focus:ring-accent/30" />
          ))}
          <span className="px-0.5 text-faint">+</span>
          <input value={strong} onChange={(e) => { setStrong(e.target.value.replace(/[^0-9]/g, '').slice(0, 1)); setRes(null); }} inputMode="numeric" placeholder="חזק" aria-label="מספר חזק"
            className="tnum h-12 w-14 rounded-lg border border-gold/40 bg-base text-center text-[15px] font-bold text-ink outline-none transition-colors placeholder:text-[11px] placeholder:text-faint focus:border-gold focus:ring-2 focus:ring-gold/30" />
        </div>
        <div className="mt-2.5 flex gap-2">
          <button type="submit" className="flex h-11 items-center gap-1.5 rounded-lg bg-accent px-5 text-sm font-bold text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            הרץ סימולציה
          </button>
          <button type="button" onClick={fillRandom} className="flex h-11 items-center gap-1.5 rounded-lg border border-line bg-base px-4 text-sm font-bold text-muted transition-colors hover:border-accent/50 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <Dice5 size={15} /> מלא אקראית
          </button>
        </div>
      </form>
      {error && <p className="mt-2 text-[12px] font-medium text-hot">{error}</p>}

      {res && (
        <div className="mt-4 space-y-3 rise">
          <p className="text-[12.5px] text-muted">
            על פני <b className="tnum text-ink">{res.draws.toLocaleString('he-IL')}</b> הגרלות (כ-22 שנה), הצירוף שלך היה פוגע:
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TIERS.map((t) => (
              <div key={t.key} className="rounded-xl border border-line-soft bg-panel-2 p-3 text-center">
                <p className="tnum text-[26px] font-black leading-none" style={{ color: res.tiers[t.key] ? t.color : 'var(--color-faint)' }}>{res.tiers[t.key]}</p>
                <p className="mt-1 text-[12px] font-bold text-ink">{t.label}</p>
                <p className="text-[10px] text-faint">{t.note}</p>
              </div>
            ))}
          </div>

          {res.hasStrong && (
            <div className="rounded-lg border border-line-soft bg-base/50 px-3 py-2 text-[12px] text-muted">
              פגיעה ב-6 מספרים <b>+ המספר החזק</b> (הקופה הגדולה): <b className="tnum text-accent">{res.tiers['6s']}</b> פעמים.
            </div>
          )}

          {/* כמה הוצאת */}
          <div className="flex items-center gap-2.5 rounded-xl border border-line-soft bg-panel-2 p-3.5">
            <Coins size={18} className="shrink-0 text-gold" />
            <p className="text-[12.5px] leading-relaxed text-ink">
              בדרך היית מוציא בערך <b className="tnum text-hot">{res.spent.toLocaleString('he-IL')} ₪</b> על הטורים (לפי ~{LINE_PRICE} ₪ לטור).
            </p>
          </div>

          {/* מסקנה מפכחת */}
          <div className="flex items-start gap-2.5 rounded-xl border border-accent/30 p-3.5" style={{ background: 'color-mix(in srgb, var(--color-accent) 5%, #fff)' }}>
            <TrendingDown size={18} className="mt-0.5 shrink-0 text-accent" />
            <p className="text-[12.5px] leading-relaxed text-ink">
              {res.tiers[6] === 0
                ? <>גם אחרי 22 שנה של משחק רצוף — <b>אף פעם לא 6 מתוך 6.</b> כך נראים הסיכויים האמיתיים: הקופה הגדולה היא אירוע נדיר ביותר. שחקו לכיף ובאחריות בלבד.</>
                : <>אפילו עם פגיעה נדירה בקופה, הסכום שהוצאת לאורך השנים ממחיש כמה הסיכוי קטן. שחקו לכיף ובאחריות בלבד.</>}
            </p>
          </div>
        </div>
      )}
    </Panel>
  );
}
