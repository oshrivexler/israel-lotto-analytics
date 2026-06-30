import React, { useEffect, useState } from 'react';
import { Clock, Trophy, ExternalLink, CalendarClock } from 'lucide-react';
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

function Unit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <span className="tnum grid min-w-[52px] place-items-center rounded-lg bg-base px-2 py-1.5 text-2xl font-black text-ink sm:text-3xl">
        {String(value).padStart(2, '0')}
      </span>
      <span className="mt-1 text-[11px] text-muted">{label}</span>
    </div>
  );
}

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
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  const dateLabel = `יום ${DAYS_HE[target.getDay()]} · ${String(target.getDate()).padStart(2, '0')}/${String(target.getMonth() + 1).padStart(2, '0')}/${target.getFullYear()} · בסביבות ${cfg.drawHour}:00`;
  const jackpot = `${cfg.currency}${cfg.jackpot.toLocaleString('he-IL')}`;

  return (
    <section className="overflow-hidden rounded-2xl border border-accent/30 bg-panel card-shadow">
      <div className="grid gap-0 md:grid-cols-[1.2fr_1fr]">
        {/* טיימר */}
        <div className="p-5 sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent/10 text-accent">
              <Clock size={15} strokeWidth={2.4} />
            </span>
            <h2 className="text-[15px] font-black">סגירת המכירה להגרלה הבאה בעוד</h2>
          </div>
          <div className="flex items-center gap-2.5" dir="ltr">
            <Unit value={days} label="ימים" />
            <span className="pb-5 text-2xl font-black text-faint">:</span>
            <Unit value={hours} label="שעות" />
            <span className="pb-5 text-2xl font-black text-faint">:</span>
            <Unit value={mins} label="דקות" />
            <span className="pb-5 text-2xl font-black text-faint">:</span>
            <Unit value={secs} label="שניות" />
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-[12px] text-muted">
            <CalendarClock size={13} className="text-faint" />{dateLabel}
          </p>
        </div>

        {/* פרס + קישור לפיס */}
        <div className="flex flex-col justify-center border-t border-line bg-panel-2 p-5 sm:p-6 md:border-r md:border-t-0">
          <div className="mb-1 flex items-center gap-1.5">
            <Trophy size={15} className="text-gold" />
            <span className="text-[12px] font-bold text-muted">{cfg.jackpotLabel}</span>
          </div>
          <p className="tnum text-3xl font-black text-accent sm:text-4xl">{jackpot}</p>
          <a
            href={cfg.paisUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-lg border border-accent/40 px-3 py-2 text-[13px] font-bold text-accent transition-colors hover:bg-accent hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            לסכום ולמועד המדויק באתר פיס <ExternalLink size={14} />
          </a>
        </div>
      </div>
      <p className="border-t border-line bg-base/40 px-5 py-2 text-[11px] text-faint">
        מועד משוער לפי לוח ההגרלות הקבוע ({cfg.drawDayLabel}). {cfg.note}.
      </p>
    </section>
  );
}
