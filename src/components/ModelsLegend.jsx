import React, { useState } from 'react';
import { BrainCircuit, ChevronDown, Flame, Snowflake, GitBranch, Sigma, RefreshCw, Activity } from 'lucide-react';

const STRAT_ICON = { balanced: Sigma, hot: Flame, overdue: Snowflake, markov: GitBranch, contrarian: RefreshCw };

const SIGNALS = [
  { Icon: Flame, color: 'var(--color-hot)', name: 'מספרים חמים', d: 'מספרים שיצאו הרבה בעבר. (לא מבטיח שייצאו שוב — לכל מספר אותו סיכוי.)' },
  { Icon: Snowflake, color: 'var(--color-cold)', name: 'מספרים שלא יצאו מזמן', d: 'מספרים שנעדרו זמן רב. נכללים לאיזון, לא כי הם "חייבים" לצאת.' },
  { Icon: GitBranch, color: 'var(--color-gold)', name: 'לפי ההגרלה הקודמת', d: 'מספרים שנטו היסטורית להופיע אחרי תוצאות דומות (שרשרת מרקוב).' },
  { Icon: Activity, color: 'var(--color-accent)', name: 'מבנה נפוץ', d: 'הצירוף נשמר בטווח הסכום הנפוץ ובחלוקת זוגי/אי-זוגי שכיחה.' },
];

export default function ModelsLegend({ tickets }) {
  const [open, setOpen] = useState(false);
  // שיטה ייחודית לכל אסטרטגיה
  const strategies = tickets.map((t) => ({ key: t.strategy, name: t.strategyName, desc: t.strategyDesc }));

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-panel card-shadow">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-5 py-4 text-right transition-colors hover:bg-panel-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent">
          <BrainCircuit size={18} strokeWidth={2.2} />
        </span>
        <span className="flex-1">
          <span className="block text-[15px] font-black">איך נבנות התחזיות? — מקרא המודלים</span>
          <span className="block text-[12px] text-muted">הסבר פשוט על השיטות והמדדים שמאחורי 5 הצירופים</span>
        </span>
        <ChevronDown size={20} className={`shrink-0 text-muted transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-line px-5 py-5 rise">
          {/* 4 המדדים */}
          <h4 className="mb-2.5 text-[13px] font-bold text-ink">המדדים שמאחורי הכול</h4>
          <div className="mb-5 grid gap-2 sm:grid-cols-2">
            {SIGNALS.map((s) => (
              <div key={s.name} className="flex items-start gap-2.5 rounded-lg border border-line-soft bg-panel-2 p-3">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md" style={{ background: `color-mix(in srgb, ${s.color} 12%, #fff)`, color: s.color }}>
                  <s.Icon size={14} strokeWidth={2.3} />
                </span>
                <p className="text-[12.5px] leading-relaxed">
                  <b className="text-ink">{s.name}: </b><span className="text-muted">{s.d}</span>
                </p>
              </div>
            ))}
          </div>

          {/* 5 השיטות */}
          <h4 className="mb-2.5 text-[13px] font-bold text-ink">5 השיטות (לכל צירוף שיטה משלו)</h4>
          <ol className="space-y-2">
            {strategies.map((st, i) => {
              const Icon = STRAT_ICON[st.key] || Sigma;
              return (
                <li key={st.key} className="flex items-start gap-2.5 rounded-lg border border-line-soft bg-base/40 p-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-line bg-panel text-accent">
                    <Icon size={14} strokeWidth={2.3} />
                  </span>
                  <p className="text-[12.5px] leading-relaxed">
                    <b className="text-ink">{i + 1}. {st.name}: </b><span className="text-muted">{st.desc}</span>
                  </p>
                </li>
              );
            })}
          </ol>

          <p className="mt-4 rounded-lg border border-line-soft bg-panel-2 px-3 py-2.5 text-[12px] leading-relaxed text-muted">
            <b className="text-ink">חשוב לזכור:</b> המודלים מבוססים על דפוסים מהעבר ועוזרים לבחור צירוף "מאוזן" ופחות-נפוץ — אבל <b>אף מודל לא מגדיל את הסיכוי לזכות.</b> לכל צירוף בדיוק אותו סיכוי בכל הגרלה.
          </p>
        </div>
      )}
    </section>
  );
}
