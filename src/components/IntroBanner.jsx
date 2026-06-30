import React from 'react';
import { Info, Scale } from 'lucide-react';

/** משפט-על קומפקטי: מה האתר עושה + האמת הכנה על לוטו. */
export default function IntroBanner({ totalDraws, years }) {
  return (
    <section className="rounded-xl border border-line bg-panel card-shadow p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent">
            <Info size={15} strokeWidth={2.4} />
          </span>
          <p className="text-[13px] leading-relaxed text-muted">
            <b className="text-ink">מה זה?</b> ניתוח של {totalDraws.toLocaleString('he-IL')} הגרלות לוטו מ-{years.toFixed(0)} השנים האחרונות,
            שמציג דפוסים ומציע צירופים — בשפה פשוטה.
          </p>
        </div>
        <div className="flex items-start gap-2.5 sm:border-r sm:border-line sm:pr-3">
          <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg" style={{ background: 'color-mix(in srgb, var(--color-gold) 14%, #fff)', color: 'var(--color-gold)' }}>
            <Scale size={15} strokeWidth={2.4} />
          </span>
          <p className="text-[13px] leading-relaxed text-muted">
            <b className="text-ink">האמת:</b> אי אפשר לחזות מספרים זוכים — לכל צירוף אותו סיכוי.
            מה שכן עוזר: לבחור צירוף שפחות אנשים בוחרים, כדי לחלוק את הפרס עם פחות זוכים.
          </p>
        </div>
      </div>
    </section>
  );
}
