import React from 'react';
import { Clock, TrendingUp } from 'lucide-react';
import { Panel, pad2 } from '../lib/ui.jsx';
import Explainer from './Explainer.jsx';

export default function OverduePanel({ overdue }) {
  const list = overdue.mostOverdue;
  const max = Math.max(...list.map((g) => g.gap), 1);

  return (
    <Panel
      title="מספרים שלא יצאו מזמן"
      subtitle="כמה הגרלות עברו מאז שכל מספר יצא בפעם האחרונה"
      icon={Clock}
      accent="var(--color-cold)"
    >
      <div className="space-y-2.5">
        {list.map((g, i) => (
          <div key={g.n} className="flex items-center gap-3 rise" style={{ animationDelay: `${i * 50}ms` }}>
            <span className="tnum grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[13px] font-bold" style={{ background: 'color-mix(in srgb, var(--color-cold) 14%, var(--color-panel-2))', color: 'var(--color-cold)', boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-cold) 35%, transparent)' }}>
              {pad2(g.n)}
            </span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-base">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(g.gap / max) * 100}%`, background: 'linear-gradient(90deg, var(--color-cold), #0ea5e9)' }}
              />
            </div>
            <span className="tnum w-20 text-left text-[12px] text-muted">
              <b className="text-ink">{g.gap}</b> הגרלות
            </span>
          </div>
        ))}
      </div>
      <p className="mt-4 flex items-center gap-1.5 rounded-lg border border-line-soft bg-base/50 px-3 py-2 text-[11px] text-faint">
        <TrendingUp size={13} className="text-cold" />
        מספרים שלא הופיעו זמן רב יחסית לרגיל. זה לא אומר שהם "חייבים" לצאת.
      </p>

      <Explainer
        see="לכל מספר רשום כמה הגרלות עברו מאז הפעם האחרונה שיצא. ככל שהפס ארוך יותר — המספר ״נעלם״ יותר זמן."
        conclude="זו הטעות הכי נפוצה בלוטו (״כשל המהמר״): מספר שלא יצא הרבה זמן לא ״חייב״ לחזור. ההגרלה לא זוכרת מה קרה בעבר."
        recommend="התייחס לזה כאל סקרנות בלבד, לא כאל סימן. מספר ״באיחור״ אינו בעל סיכוי גבוה יותר מכל מספר אחר."
      />
    </Panel>
  );
}
