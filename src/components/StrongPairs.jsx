import React from 'react';
import { Link2 } from 'lucide-react';
import { Panel, pad2 } from '../lib/ui.jsx';
import Explainer from './Explainer.jsx';

/** צמדים חזקים — זוגות מספרים שמופיעים יחד הכי הרבה בהיסטוריה. */
export default function StrongPairs({ coOccurrence }) {
  const pairs = coOccurrence.topPairs.slice(0, 8);
  const maxCount = Math.max(...pairs.map((p) => p.count), 1);

  return (
    <Panel
      title="צמדים חזקים — מספרים שבאים יחד"
      subtitle="הזוגות שהופיעו באותה הגרלה הכי הרבה פעמים"
      icon={Link2}
      accent="var(--color-accent)"
    >
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {pairs.map((p, i) => (
          <div
            key={`${p.a}-${p.b}`}
            className="flex items-center gap-3 rounded-xl border border-line-soft bg-panel-2 p-3 rise"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-center gap-1.5">
              <span className="tnum grid h-10 w-10 place-items-center rounded-full text-[15px] font-bold" style={{ background: 'color-mix(in srgb, var(--color-accent) 12%, #fff)', color: 'var(--color-accent)', boxShadow: 'inset 0 0 0 1.5px color-mix(in srgb, var(--color-accent) 40%, transparent)' }}>{pad2(p.a)}</span>
              <Link2 size={13} className="text-faint" />
              <span className="tnum grid h-10 w-10 place-items-center rounded-full text-[15px] font-bold" style={{ background: 'color-mix(in srgb, var(--color-accent) 12%, #fff)', color: 'var(--color-accent)', boxShadow: 'inset 0 0 0 1.5px color-mix(in srgb, var(--color-accent) 40%, transparent)' }}>{pad2(p.b)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="h-1.5 overflow-hidden rounded-full bg-base">
                <div className="h-full rounded-full" style={{ width: `${(p.count / maxCount) * 100}%`, background: 'var(--color-accent)' }} />
              </div>
              <p className="tnum mt-1 text-[12px] text-muted">
                יצאו יחד <b className="text-ink">{p.count}</b> פעמים
                <span className="text-faint"> · פי {p.lift.toFixed(1)} מהרגיל</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      <Explainer
        see="כל שורה היא זוג מספרים, ולצידו כמה פעמים השניים יצאו באותה הגרלה. ״פי X מהרגיל״ = כמה הם צמודים יותר ממה שמצופה במקרה."
        conclude="יש זוגות שנוטים להופיע יחד קצת יותר מהממוצע — אבל ההפרשים קטנים, וגם הם תוצאה של מקריות לאורך אלפי הגרלות."
        recommend="אפשר לשלב זוג ״חזק״ בצירוף כדי שיהיה מגובש — אבל זכרו: זה לא מגדיל את הסיכוי לזכות. נחמד לבנייה, לא ערובה."
      />
    </Panel>
  );
}
