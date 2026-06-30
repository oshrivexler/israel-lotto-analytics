import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Panel } from '../lib/ui.jsx';
import Explainer from './Explainer.jsx';
import Term from './Term.jsx';

export default function SumDistribution({ sumStats, tickets }) {
  const { hist, mean, std, sweet } = sumStats;
  const [hover, setHover] = useState(null);
  const W = 680, H = 240, padX = 36, padY = 24;
  const maxCount = Math.max(...hist.map((h) => h.count));
  const loVal = hist[0].lo;
  const hiVal = hist[hist.length - 1].hi;
  const span = hiVal - loVal;

  const xOf = (v) => padX + ((v - loVal) / span) * (W - padX * 2);
  const yOf = (c) => H - padY - (c / maxCount) * (H - padY * 2);

  // נקודות לעקומה חלקה (מרכזי הבינים)
  const pts = hist.map((h) => ({ x: xOf((h.lo + h.hi) / 2), y: yOf(h.count), h }));
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${pts[pts.length - 1].x.toFixed(1)} ${H - padY} L ${pts[0].x.toFixed(1)} ${H - padY} Z`;

  return (
    <Panel
      title="עקומת התפלגות הסכום"
      subtitle={<>ממוצע {mean.toFixed(1)} · <Term def="טווח הסכומים שבו נופלות רוב ההגרלות (הסכום הנפוץ ביותר).">הטווח הנפוץ</Term> {sweet.lo}–{sweet.hi}</>}
      icon={Bell}
      accent="var(--color-accent)"
    >
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="התפלגות סכום ששת המספרים">
          <defs>
            <linearGradient id="sumFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* רצועת נקודת המתיקה */}
          <rect
            x={xOf(sweet.lo)}
            y={padY}
            width={xOf(sweet.hi) - xOf(sweet.lo)}
            height={H - padY * 2}
            fill="var(--color-accent)"
            opacity="0.06"
          />
          <line x1={xOf(sweet.lo)} y1={padY} x2={xOf(sweet.lo)} y2={H - padY} stroke="var(--color-accent)" strokeOpacity="0.3" strokeDasharray="3 3" />
          <line x1={xOf(sweet.hi)} y1={padY} x2={xOf(sweet.hi)} y2={H - padY} stroke="var(--color-accent)" strokeOpacity="0.3" strokeDasharray="3 3" />

          {/* קו ממוצע */}
          <line x1={xOf(mean)} y1={padY - 6} x2={xOf(mean)} y2={H - padY} stroke="var(--color-muted)" strokeOpacity="0.5" strokeDasharray="2 4" />

          {/* שטח + עקומה */}
          <path d={areaPath} fill="url(#sumFill)" />
          <path d={linePath} fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinejoin="round" />

          {/* נקודות אינטראקטיביות */}
          {pts.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={hover === i ? 4.5 : 2.5}
              fill="var(--color-accent)"
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          ))}

          {/* סמני התחזיות שלנו */}
          {tickets.map((t, i) => (
            <g key={t.id}>
              <line x1={xOf(t.sum)} y1={H - padY} x2={xOf(t.sum)} y2={H - padY + 8} stroke="var(--color-gold)" strokeWidth="2" />
              <polygon
                points={`${xOf(t.sum)},${H - padY - 2} ${xOf(t.sum) - 4},${H - padY + 6} ${xOf(t.sum) + 4},${H - padY + 6}`}
                fill="var(--color-gold)"
              >
                <title>צירוף #{t.id} · סכום {t.sum}</title>
              </polygon>
            </g>
          ))}

          {/* תוויות ציר X */}
          {[loVal, Math.round((loVal + hiVal) / 2), hiVal].map((v) => (
            <text key={v} x={xOf(v)} y={H - 4} textAnchor="middle" className="tnum" fontSize="10" fill="var(--color-faint)">{v}</text>
          ))}
        </svg>

        {hover != null && (
          <div className="tnum pointer-events-none absolute top-2 left-2 rounded-md border border-line bg-panel-2 px-2.5 py-1.5 text-[11px] shadow-xl">
            טווח <b className="text-ink">{hist[hover].bin}</b> · <b className="text-accent">{hist[hover].count}</b> הגרלות
            <span className="text-faint"> ({(hist[hover].pct * 100).toFixed(1)}%)</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-faint">
        <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm" style={{ background: 'var(--color-accent)', opacity: 0.3 }} /> הטווח הנפוץ {sweet.lo}–{sweet.hi}</span>
        <span className="flex items-center gap-1.5"><span className="h-0 w-3 border-t border-dashed border-muted" /> ממוצע {mean.toFixed(0)}</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-0 w-0 border-x-4 border-b-[7px] border-x-transparent" style={{ borderBottomColor: 'var(--color-gold)' }} /> 5 התחזיות שלנו</span>
      </div>

      <Explainer
        see={`כשמחברים את 6 המספרים בכל הגרלה מקבלים ״סכום״. הגרף מראה כמה הגרלות יצאו בכל טווח סכומים. רוב ההגרלות נופלות בין ${sumStats.sweet.lo} ל-${sumStats.sweet.hi} (האזור המודגש).`}
        conclude="סכום קיצוני (נמוך מאוד או גבוה מאוד) כמעט לא קורה — לא כי ״אסור״, אלא כי יש פחות צירופים אפשריים שמגיעים לסכום כזה."
        recommend={`אם אתה בוחר מספרים בעצמך, כדאי שהסכום ייפול בערך בין ${sumStats.sweet.lo} ל-${sumStats.sweet.hi}. זה לא יגדיל את הסיכוי לזכות — אבל מונע ממך לבזבז על צירוף בעל מבנה נדיר.`}
      />
    </Panel>
  );
}
