import React, { useState } from 'react';
import { Grid3x3 } from 'lucide-react';
import { Panel, pad2 } from '../lib/ui.jsx';

export default function NumberGrid({ numberTable }) {
  const [sel, setSel] = useState(null);
  const max = Math.max(...numberTable.map((d) => d.all));
  const min = Math.min(...numberTable.map((d) => d.all));

  const heat = (c) => {
    const t = (c - min) / (max - min || 1); // 0..1
    // ממיפוי בהיר -> חם (אדום)
    return `color-mix(in srgb, var(--color-hot) ${Math.round(t * 78 + 5)}%, #ffffff)`;
  };

  const active = sel != null ? numberTable.find((d) => d.n === sel) : null;

  return (
    <Panel title="לוח המספרים 1–37" subtitle="עוצמת הצבע = תדירות לאורך כל ההיסטוריה" icon={Grid3x3} accent="var(--color-hot)">
      <div className="grid grid-cols-7 gap-1.5 sm:grid-cols-10 lg:grid-cols-[repeat(13,minmax(0,1fr))]">
        {numberTable.map((d) => (
          <button
            key={d.n}
            onMouseEnter={() => setSel(d.n)}
            onFocus={() => setSel(d.n)}
            onClick={() => setSel(d.n)}
            className={`tnum group relative aspect-square rounded-lg text-[13px] font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${sel === d.n ? 'scale-110 ring-2 ring-ink/40 z-10' : 'hover:scale-105'}`}
            style={{ background: heat(d.all), color: (d.all - min) / (max - min || 1) > 0.55 ? '#fff' : 'var(--color-ink)' }}
          >
            {pad2(d.n)}
            {d.gap === 0 && <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-accent" title="יצא בהגרלה האחרונה" />}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-line-soft bg-base/50 p-3 text-[12px]">
        {active ? (
          <>
            <span className="flex items-center gap-2">
              <span className="tnum grid h-9 w-9 place-items-center rounded-lg bg-panel-2 text-[14px] font-bold text-ink">{pad2(active.n)}</span>
              <span className="text-muted">מספר נבחר</span>
            </span>
            <div className="tnum flex gap-4 text-left">
              <span><span className="text-faint">יצא</span> <b className="text-ink">{active.all}</b></span>
              <span><span className="text-faint">שנה</span> <b className="text-hot">{active.y1}</b></span>
              <span><span className="text-faint">לא יצא</span> <b className="text-cold">{active.gap}</b></span>
            </div>
          </>
        ) : (
          <span className="text-faint">רחף מעל מספר לפרטים · נקודה ירוקה = יצא בהגרלה האחרונה</span>
        )}
      </div>
    </Panel>
  );
}
