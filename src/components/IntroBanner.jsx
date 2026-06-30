import React from 'react';
import { Info, Scale, AlertTriangle } from 'lucide-react';

/**
 * משפט-על כן בראש הדף — מסביר מה האתר עושה ומה לא, בשפה פשוטה.
 * ממסגר את הערך באמת: לא ״לזכות יותר״ אלא ״אם תזכה — לחלוק עם פחות אנשים״.
 */
export default function IntroBanner({ totalDraws, years }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-panel card-shadow">
      <div className="grid gap-0 md:grid-cols-[1.4fr_1fr]">
        {/* מה האתר עושה */}
        <div className="p-5 sm:p-6">
          <div className="mb-2 flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent/10 text-accent">
              <Info size={15} strokeWidth={2.4} />
            </span>
            <h2 className="text-lg font-black tracking-tight">מה האתר הזה עושה?</h2>
          </div>
          <p className="text-[14px] leading-relaxed text-ink">
            <b>לוטומטריקס</b> בוחן {totalDraws.toLocaleString('he-IL')} הגרלות לוטו אמיתיות מ-{years.toFixed(0)} השנים האחרונות,
            ומציג את הדפוסים שבהן — מספרים נפוצים, סכומים שכיחים ועוד — <b>בשפה פשוטה, עם הסבר מתחת לכל גרף</b>.
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            אפשר להשתמש בו כדי ללמוד על הלוטו, לקבל השראה לבחירת מספרים, או סתם מתוך סקרנות.
          </p>
        </div>

        {/* האמת על לוטו — המסגור הכן */}
        <div className="border-t border-line bg-panel-2 p-5 sm:p-6 md:border-r md:border-t-0">
          <div className="mb-2 flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg" style={{ background: 'color-mix(in srgb, var(--color-gold) 14%, #fff)', color: 'var(--color-gold)' }}>
              <Scale size={15} strokeWidth={2.4} />
            </span>
            <h3 className="text-[15px] font-bold">האמת על לוטו (חשוב לקרוא)</h3>
          </div>
          <p className="text-[13px] leading-relaxed text-ink">
            <b>אי אפשר לחזות מספרים זוכים</b> — לכל צירוף יש בדיוק אותו סיכוי. מה ש<b>כן</b> אפשר:
            לבחור צירוף ש<b>פחות אנשים בוחרים</b>, כך שאם תזכה — תחלוק את הקופה עם פחות אנשים ותקבל יותר כסף.
          </p>
        </div>
      </div>

      {/* פס הבהרה עליון */}
      <div className="flex items-center gap-2 border-t border-line bg-accent/[0.06] px-5 py-2.5">
        <AlertTriangle size={14} className="shrink-0 text-accent" />
        <p className="text-[12px] leading-snug text-muted">
          המספרים והתחזיות באתר הם <b className="text-ink">להמחשה בלבד</b> ואינם מבטיחים זכייה. הגרלת לוטו היא אקראית. משחק אחראי · אסור מתחת לגיל 18.
        </p>
      </div>
    </section>
  );
}
