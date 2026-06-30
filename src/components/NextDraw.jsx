import React, { useEffect, useState } from 'react';
import { Clock, ExternalLink } from 'lucide-react';
import cfg from '../data/next-draw.json';

const DAYS_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

function nextDrawDate() {
  const now = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    d.setHours(cfg.drawHour, 0, 0, 0);
    if (cfg.drawDays.includes(d.getDay()) && d.getTime() > now.getTime()) return d;
  }
  return now;
}

/** פס קומפקטי: מתי ההגרלה הבאה + ספירה לאחור. ללא סכום פרס. */
export default function NextDraw() {
  const [target, setTarget] = useState(nextDrawDate);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => {
      const t = new Date();
      setNow(t);
      if (t.getTime() >= target.getTime()) setTarget(nextDrawDate());
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  const diff = Math.max(0, target.getTime() - now.getTime());
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const p2 = (x) => String(x).padStart(2, '0');
  const dateLabel = `יום ${DAYS_HE[target.getDay()]} · ${p2(target.getDate())}/${p2(target.getMonth() + 1)} · ${cfg.drawHour}:00`;

  return (
    <section className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl border border-line bg-panel px-4 py-2.5 card-shadow">
      <div className="flex items-center gap-2 text-[13px]">
        <Clock size={15} className="text-accent" />
        <span className="font-bold text-ink">ההגרלה הבאה</span>
        <span className="text-faint">·</span>
        <span className="tnum text-muted">{dateLabel}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="tnum flex items-center gap-1 text-[13px] font-bold text-ink" dir="ltr" aria-label="זמן עד ההגרלה">
          {d > 0 && <span><b className="text-accent">{d}</b><span className="text-faint">d</span> </span>}
          <span>{p2(h)}<span className="text-faint">:</span>{p2(m)}<span className="text-faint">:</span>{p2(s)}</span>
        </span>
        <a
          href={cfg.paisUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-semibold text-accent transition-colors hover:bg-accent/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          פיס <ExternalLink size={12} />
        </a>
      </div>
    </section>
  );
}
