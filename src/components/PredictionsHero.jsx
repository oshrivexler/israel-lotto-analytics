import React, { useState } from 'react';
import { Sparkles, Copy, Check, Flame, Snowflake, GitBranch, Sigma, RefreshCw } from 'lucide-react';
import { Ball, pad2, Tag } from '../lib/ui.jsx';

const STRAT_ICON = { balanced: Sigma, hot: Flame, overdue: Snowflake, markov: GitBranch, contrarian: RefreshCw };
const TAG_META = {
  hot: { label: 'חם', color: 'var(--color-hot)', Icon: Flame },
  cold: { label: 'לא יצא מזמן', color: 'var(--color-cold)', Icon: Snowflake },
  trans: { label: 'לפי הקודמת', color: 'var(--color-gold)', Icon: GitBranch },
  neutral: { label: 'ניטרלי', color: 'var(--color-muted)', Icon: null },
};

function TicketCard({ t, index, sweet }) {
  const [copied, setCopied] = useState(false);
  const Icon = STRAT_ICON[t.strategy] || Sigma;
  const inSweetSum = t.sum >= sweet.lo && t.sum <= sweet.hi;

  const copy = () => {
    const txt = `${t.numbers.map(pad2).join(' ')}  |  חזק ${t.strong}`;
    navigator.clipboard?.writeText(txt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  return (
    <div
      className="group relative flex flex-col gap-3.5 rounded-xl border border-accent/25 bg-panel p-4 transition-all duration-300 hover:border-accent/60 hover:shadow-[0_10px_30px_-12px_rgba(200,16,46,0.45)] rise"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      {/* כותרת אסטרטגיה */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg border border-line bg-base text-accent">
            <Icon size={14} strokeWidth={2.3} />
          </span>
          <div>
            <p className="text-[13px] font-bold leading-tight">{t.strategyName}</p>
            <p className="tnum text-[10px] text-faint">שיטה #{t.id}</p>
          </div>
        </div>
        <button
          onClick={copy}
          aria-label="העתק צירוף"
          className="grid h-7 w-7 place-items-center rounded-lg border border-line bg-base text-muted transition-colors hover:border-accent/50 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {copied ? <Check size={13} className="text-accent" /> : <Copy size={13} />}
        </button>
      </div>

      {/* הסבר השיטה */}
      <p className="min-h-[44px] rounded-lg border border-line-soft bg-panel-2 px-2.5 py-2 text-[11px] leading-snug text-muted">
        {t.strategyDesc}
      </p>

      {/* המספרים */}
      <div className="flex items-center justify-between gap-1.5">
        {t.numbers.map((n, i) => (
          <Ball key={n} n={n} variant="accent" size={42} delay={index * 90 + i * 40} />
        ))}
        <span className="mx-0.5 text-faint">+</span>
        <Ball n={t.strong} variant="gold" size={42} delay={index * 90 + 260} />
      </div>

      {/* מטא-נתונים */}
      <div className="flex items-center justify-between border-t border-line-soft pt-3 text-[11px]">
        <span className="flex items-center gap-1 text-muted">
          סכום
          <span className={`tnum font-bold ${inSweetSum ? 'text-accent' : 'text-hot'}`}>{t.sum}</span>
          {inSweetSum && <span className="text-faint">· בטווח הנפוץ</span>}
        </span>
        <span className="tnum text-muted">
          <span className="font-bold text-ink">{t.evens}</span> זוגי · <span className="font-bold text-ink">{t.odds}</span> אי-זוגי
        </span>
      </div>
    </div>
  );
}

export default function PredictionsHero({ tickets, sweet, onRegen }) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-accent/30 bg-panel p-5 glow-accent">
      {/* רקע דקורטיבי */}
      <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative flex flex-wrap items-end justify-between gap-3 pb-5">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <Sparkles size={16} className="text-accent" />
            <span className="text-[12px] font-semibold uppercase tracking-wider text-accent">תיק תחזיות · ההגרלה הקרובה</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
            5 צירופים <span className="text-accent text-glow">מאוזנים</span>
          </h2>
          <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-muted">
            5 דרכים שונות לבחור צירוף ״מאוזן״ לפי הדפוסים ההיסטוריים (כל אחת מוסברת בכרטיס שלה).
            <b className="text-ink"> חשוב: </b> זו המחשה ללימוד והשראה — אף שיטה אינה מבטיחה זכייה, ולכל צירוף יש בדיוק אותו סיכוי.
          </p>
        </div>
        <button
          onClick={onRegen}
          className="group flex items-center gap-2 rounded-xl border border-accent/50 bg-accent/10 px-4 py-2.5 text-sm font-bold text-accent transition-all hover:bg-accent hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-base"
        >
          <RefreshCw size={15} className="transition-transform group-hover:rotate-180" />
          הצג שוב
        </button>
      </div>

      <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {tickets.map((t, i) => (
          <TicketCard key={t.id} t={t} index={i} sweet={sweet} />
        ))}
      </div>

      {/* מקרא */}
      <div className="relative mt-4 flex flex-wrap items-center gap-2 border-t border-line-soft pt-4 text-[11px]">
        <span className="text-faint">מקרא תיוג:</span>
        {Object.entries(TAG_META).filter(([k]) => k !== 'neutral').map(([k, m]) => (
          <Tag key={k} color={m.color}>
            {m.Icon && <m.Icon size={11} />} {m.label}
          </Tag>
        ))}
        <span className="mr-auto text-faint">המספר החזק (זהב) נבחר לפי תדירות + הזמן מאז שיצא</span>
      </div>
    </section>
  );
}
