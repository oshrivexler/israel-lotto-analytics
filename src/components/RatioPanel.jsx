import React from 'react';
import { Scale, Link2 } from 'lucide-react';
import { Panel } from '../lib/ui.jsx';
import Explainer from './Explainer.jsx';

export default function RatioPanel({ evenOdd, consecutive }) {
  const dist = [...evenOdd.dist].sort((a, b) => a.evens - b.evens);
  const maxPct = Math.max(...dist.map((d) => d.pct));
  const sweet = new Set(evenOdd.sweetSplits.map((s) => s.evens));

  return (
    <Panel title="זוגי/אי-זוגי + מספרים עוקבים" subtitle="המבנה הנפוץ של הצירופים" icon={Scale} accent="var(--color-gold)">
      {/* יחס זוגי/אי-זוגי */}
      <div className="space-y-2">
        {dist.map((d) => {
          const hot = sweet.has(d.evens);
          return (
            <div key={d.evens} className="flex items-center gap-3">
              <span className="tnum w-24 shrink-0 text-[11px] text-muted">{d.evens} ז' / {d.odds} א'</span>
              <div className="h-6 flex-1 overflow-hidden rounded-md bg-base">
                <div
                  className="flex h-full items-center justify-end rounded-md px-2 transition-all duration-700"
                  style={{
                    width: `${(d.pct / maxPct) * 100}%`,
                    background: hot ? 'linear-gradient(90deg, #f2c43b, #cc9114)' : '#e7ddc9',
                  }}
                >
                  <span className="tnum text-[10px] font-bold" style={{ color: hot ? '#3a2a00' : 'var(--color-muted)' }}>
                    {(d.pct * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] text-faint">מודגש = החלוקה הנפוצה ביותר (יחד ~80% מההגרלות).</p>

      {/* עוקבים */}
      <div className="mt-4 border-t border-line-soft pt-4">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[13px] font-bold text-gold"><Link2 size={14} /> מספרים עוקבים</span>
          <span className="tnum text-[12px] text-muted">
            <b className="text-ink">{(consecutive.pctWithConsec * 100).toFixed(0)}%</b> מההגרלות עם זוג עוקב
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {consecutive.topPairs.slice(0, 8).map((p) => (
            <span key={p.pair} className="tnum rounded-md border border-line bg-base px-2 py-1 text-[11px]">
              <b className="text-ink">{p.pair}</b> <span className="text-faint">×{p.count}</span>
            </span>
          ))}
        </div>
      </div>

      <Explainer
        see="למעלה: באיזו תדירות ההגרלה התחלקה ל-3 זוגיים/3 אי-זוגיים, 4/2 וכו'. למטה: זוגות של מספרים עוקבים (כמו 14 ו-15) שיצאו יחד."
        conclude="חלוקות מאוזנות (3/3, 4/2) הן הנפוצות ביותר, ומספרים עוקבים מופיעים בכ-61% מההגרלות — הרבה יותר ממה שאנשים מנחשים."
        recommend="כאן ההמלצה הכי שימושית: רוב האנשים בוחרים ימי הולדת ודפוסים ״יפים״. אם תבחר צירוף פחות-פופולרי, לא תזכה בתדירות גבוהה יותר — אבל אם תזכה, סביר שתחלוק את הקופה עם פחות אנשים, כלומר תקבל יותר כסף."
      />
    </Panel>
  );
}
