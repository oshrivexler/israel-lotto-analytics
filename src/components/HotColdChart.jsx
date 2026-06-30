import React, { useMemo, useState } from 'react';
import { BarChart3, Flame, Snowflake } from 'lucide-react';
import { Panel, pad2, Tag } from '../lib/ui.jsx';
import Explainer from './Explainer.jsx';
import Term from './Term.jsx';

const WINDOWS = [
  { key: 'allTime', label: 'כל הזמנים' },
  { key: 'last5y', label: '5 שנים' },
  { key: 'last1y', label: 'שנה' },
];

export default function HotColdChart({ frequency }) {
  const [win, setWin] = useState('allTime');
  const [hover, setHover] = useState(null);

  const data = frequency[win];
  const expected = (6 / 37) * data.draws; // תוחלת לכל מספר

  const bars = useMemo(() => {
    return data.counts.map((c, i) => ({ n: i + 1, c, ratio: c / (expected || 1) }));
  }, [data, expected]);

  const max = Math.max(...bars.map((b) => b.c), 1);
  const sorted = [...bars].sort((a, b) => b.c - a.c);
  const hotTop = new Set(sorted.slice(0, 6).map((b) => b.n));
  const coldTop = new Set(sorted.slice(-6).map((b) => b.n));

  const colorFor = (b) => {
    if (hotTop.has(b.n)) return 'var(--color-hot)';
    if (coldTop.has(b.n)) return 'var(--color-cold)';
    return '#d6ccb8';
  };

  return (
    <Panel
      title="מפת חום — תדירות מספרים"
      subtitle={<>{data.draws.toLocaleString('he-IL')} הגרלות · קו מקווקו = <Term def="כמה פעמים בממוצע כל מספר אמור לצאת אם הכול אקראי לגמרי.">הממוצע הצפוי</Term></>}
      icon={BarChart3}
      accent="var(--color-hot)"
      action={
        <div className="flex rounded-lg border border-line bg-base p-0.5">
          {WINDOWS.map((w) => (
            <button
              key={w.key}
              onClick={() => setWin(w.key)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                win === w.key ? 'bg-panel-2 text-ink shadow-sm' : 'text-faint hover:text-muted'
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      }
    >
      {/* גרף עמודות (ויזואלי בלבד — הנתונים הנגישים מופיעים בכרטיסי החמים/קרים ובהסבר) */}
      <div className="relative h-52 w-full" aria-hidden="true" onMouseLeave={() => setHover(null)}>
        {/* קו תוחלת */}
        <div
          className="absolute inset-x-0 z-10 border-t border-dashed border-faint/50"
          style={{ bottom: `${(expected / max) * 100}%` }}
        >
          <span className="tnum absolute -top-4 left-0 bg-base px-1 text-[10px] text-faint">
ממוצע צפוי {expected.toFixed(1)}
          </span>
        </div>
        <div className="flex h-full items-end gap-[2px]">
          {bars.map((b) => (
            <div
              key={b.n}
              className="group relative flex h-full flex-1 items-end"
              onMouseEnter={() => setHover(b)}
            >
              <div
                className="w-full rounded-t-[2px] transition-all duration-200"
                style={{
                  height: `${(b.c / max) * 100}%`,
                  background: colorFor(b),
                  opacity: hover && hover.n !== b.n ? 0.4 : 1,
                }}
              />
              {hover?.n === b.n && (
                <div className="tnum pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md border border-line bg-panel-2 px-2 py-1 text-[11px] shadow-xl">
                  מספר <b className="text-ink">{pad2(b.n)}</b> · יצא <b style={{ color: colorFor(b) }}>{b.c}</b> פעמים
                  <span className="text-faint"> ({(b.ratio * 100).toFixed(0)}% מהממוצע)</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* ציר X */}
      <div className="mt-1 flex gap-[2px]" aria-hidden="true">
        {bars.map((b) => (
          <span key={b.n} className="tnum flex-1 text-center text-[8px] text-faint">
            {b.n % 2 === 1 ? b.n : ''}
          </span>
        ))}
      </div>

      {/* טופ חמים / קרים */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-line-soft bg-base/50 p-3">
          <div className="mb-2 flex items-center gap-1.5 text-[12px] font-bold" style={{ color: 'var(--color-hot)' }}>
            <Flame size={13} /> החמים ביותר
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sorted.slice(0, 6).map((b) => (
              <span key={b.n} className="tnum grid h-8 w-8 place-items-center rounded-md text-[12px] font-bold" style={{ background: 'color-mix(in srgb, var(--color-hot) 16%, transparent)', color: 'var(--color-hot)', boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-hot) 40%, transparent)' }}>
                {pad2(b.n)}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-line-soft bg-base/50 p-3">
          <div className="mb-2 flex items-center gap-1.5 text-[12px] font-bold" style={{ color: 'var(--color-cold)' }}>
            <Snowflake size={13} /> הקרים ביותר
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sorted.slice(-6).reverse().map((b) => (
              <span key={b.n} className="tnum grid h-8 w-8 place-items-center rounded-md text-[12px] font-bold" style={{ background: 'color-mix(in srgb, var(--color-cold) 16%, transparent)', color: 'var(--color-cold)', boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-cold) 40%, transparent)' }}>
                {pad2(b.n)}
              </span>
            ))}
          </div>
        </div>
      </div>

      <Explainer
        see="כמה פעמים כל מספר (1–37) יצא לאורך ההיסטוריה. עמודה גבוהה = יצא הרבה (חם), נמוכה = מעט (קר). הקו המקווקו הוא כמה היינו מצפים שכל מספר ייצא אם הכול אקראי לגמרי."
        conclude="כל העמודות קרובות לקו המקווקו — ההבדלים בין המספרים קטנים ומקריים. אין מספר ״מזל״ שבאמת יוצא יותר."
        recommend="לכל מספר יש בדיוק אותו סיכוי (1 ל-37) בהגרלה הבאה. אל תבחר מספר רק כי הוא ״חם״ — זה לא משפר את הסיכוי שלך."
      />
    </Panel>
  );
}
