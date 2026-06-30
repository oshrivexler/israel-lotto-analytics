import React from 'react';
import { Eye, Lightbulb, Target } from 'lucide-react';

/**
 * רכיב הסבר נשנה לכל גרף — בשפה פשוטה לקהל שאינו מבין סטטיסטיקה.
 * שלוש שורות קצרות: מה רואים · מה המסקנה · מה ההמלצה (הכנה).
 */
const ROWS = [
  { key: 'see', label: 'מה רואים', Icon: Eye, color: 'var(--color-cold)' },
  { key: 'conclude', label: 'המסקנה', Icon: Lightbulb, color: 'var(--color-gold)' },
  { key: 'recommend', label: 'ההמלצה', Icon: Target, color: 'var(--color-accent)' },
];

export default function Explainer({ see, conclude, recommend }) {
  const data = { see, conclude, recommend };
  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-line-soft bg-panel-2">
      <div className="flex items-center gap-1.5 border-b border-line-soft px-3 py-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-faint">הסבר פשוט</span>
      </div>
      <div className="divide-y divide-line-soft">
        {ROWS.map((r) => (
          <div key={r.key} className="flex items-start gap-2.5 px-3 py-2.5">
            <span
              className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md"
              style={{ background: `color-mix(in srgb, ${r.color} 12%, #fff)`, color: r.color }}
            >
              <r.Icon size={13} strokeWidth={2.3} />
            </span>
            <p className="text-[12.5px] leading-relaxed text-ink">
              <span className="font-bold" style={{ color: r.color }}>{r.label}: </span>
              <span className="text-muted">{data[r.key]}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
