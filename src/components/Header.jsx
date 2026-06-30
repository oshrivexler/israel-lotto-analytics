import React from 'react';
import { Activity, Calendar, Database, Hash } from 'lucide-react';
import { Ball, pad2 } from '../lib/ui.jsx';

export default function Header({ meta }) {
  const { lastDraw, totalDraws, firstDraw } = meta;
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-base/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-5 py-3">
        {/* מותג */}
        <div className="flex items-center gap-3">
          <div className="relative grid h-10 w-10 place-items-center rounded-xl border border-accent/40 bg-panel">
            <Activity size={20} className="text-accent" strokeWidth={2.4} />
            <span className="absolute inset-0 rounded-xl pulse-ring" />
          </div>
          <div>
            <h1 className="text-lg font-black leading-none tracking-tight">
              לוטו<span className="text-accent">מטריקס</span>
            </h1>
            <p className="text-[11px] text-faint">מנוע ניתוח וחיזוי · לוטו 6/37 · מפעל הפיס</p>
          </div>
        </div>

        {/* פס סטטוס — הגרלה אחרונה */}
        <div className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 sm:w-auto">
          <div className="hidden items-center gap-1.5 text-[12px] text-muted sm:flex">
            <Database size={14} className="text-faint" />
            <span className="tnum font-semibold text-ink">{totalDraws.toLocaleString('he-IL')}</span> הגרלות במאגר
          </div>
          <div className="hidden h-6 w-px bg-line md:block" />
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5">
            <span className="flex items-center gap-1 text-[12px] text-muted">
              <Calendar size={14} className="text-faint" />
              הגרלה אחרונה
              <span className="tnum mr-1 rounded bg-panel-2 px-1.5 py-0.5 text-[11px] text-ink">
                <Hash size={9} className="inline -translate-y-px" />{lastDraw.id}
              </span>
            </span>
            <div className="flex items-center gap-1">
              {lastDraw.numbers.map((n) => (
                <span key={n} className="tnum grid h-7 w-7 place-items-center rounded-md border border-line bg-panel-2 text-[12px] font-bold text-ink">
                  {pad2(n)}
                </span>
              ))}
              <span className="tnum grid h-7 w-7 place-items-center rounded-md text-[12px] font-bold" style={{ background: 'radial-gradient(circle at 35% 28%, #f2c43b, #cc9114)', color: '#3a2a00' }} title="מספר חזק">
                {lastDraw.strong ?? '—'}
              </span>
            </div>
            <span className="tnum text-[11px] text-faint">{lastDraw.date}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
