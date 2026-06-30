import React, { useEffect, useRef } from 'react';
import { BookOpen, X } from 'lucide-react';

/** מילון מונחים מרוכז — כל המילים המקצועיות במקום אחד, בשפה פשוטה. */
const TERMS = [
  { t: 'הגרלה', d: 'אירוע אחד שבו נשלפים 6 מספרים + מספר חזק. באתר יש 2,477 הגרלות מ-22 השנים האחרונות.' },
  { t: 'מספר חזק', d: 'מספר נוסף בין 1 ל-7 שנשלף בכל הגרלה, בנפרד מ-6 המספרים הרגילים.' },
  { t: 'מספרים חמים', d: 'מספרים שיצאו הרבה פעמים בעבר. חשוב: זה לא אומר שיצאו שוב — לכל מספר אותו סיכוי.' },
  { t: 'מספרים קרים', d: 'מספרים שיצאו מעט פעמים בעבר. גם להם בדיוק אותו סיכוי בהגרלה הבאה.' },
  { t: 'מספרים שלא יצאו מזמן (פיגור)', d: 'כמה הגרלות עברו מאז שמספר יצא לאחרונה. מספר כזה אינו חייב לחזור — זו טעות נפוצה.' },
  { t: 'סכום', d: 'התוצאה של חיבור כל 6 המספרים בהגרלה. רוב ההגרלות מסתכמות בין 88 ל-136.' },
  { t: 'הטווח הנפוץ (נקודת מתיקה)', d: 'טווח הסכומים שבו נופלות רוב ההגרלות (למשל 88–136). סכום מחוץ לטווח נדיר יותר.' },
  { t: 'הממוצע הצפוי (תוחלת)', d: 'כמה פעמים בממוצע משהו אמור לקרות אם הכול אקראי. משמש כקו ייחוס בגרפים.' },
  { t: 'זוגי / אי-זוגי', d: 'החלוקה בין מספרים זוגיים לאי-זוגיים בהגרלה (למשל 3 זוגיים ו-3 אי-זוגיים).' },
  { t: 'מספרים עוקבים', d: 'שני מספרים שבאים אחד אחרי השני (למשל 14 ו-15) ויצאו באותה הגרלה.' },
  { t: 'לפי ההגרלה הקודמת (מרקוב)', d: 'שיטה שבודקת אילו מספרים נטו להופיע מיד אחרי תוצאה מסוימת בעבר.' },
];

export default function Glossary({ open, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="glossary-title"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-line bg-panel card-shadow rise">
        <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent/10 text-accent">
              <BookOpen size={16} strokeWidth={2.3} />
            </span>
            <h2 id="glossary-title" className="text-[16px] font-black">מילון מונחים</h2>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="סגור מילון"
            className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-base text-muted transition-colors hover:border-accent/50 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X size={16} />
          </button>
        </header>
        <div className="overflow-y-auto px-5 py-3">
          <dl className="divide-y divide-line-soft">
            {TERMS.map((term) => (
              <div key={term.t} className="py-3">
                <dt className="text-[14px] font-bold text-accent">{term.t}</dt>
                <dd className="mt-0.5 text-[13px] leading-relaxed text-muted">{term.d}</dd>
              </div>
            ))}
          </dl>
        </div>
        <footer className="border-t border-line bg-panel-2 px-5 py-2.5 text-[11px] text-faint">
          זכרו: כל הניתוחים מבוססים על העבר. הגרלת לוטו היא אקראית ואי אפשר לחזות אותה.
        </footer>
      </div>
    </div>
  );
}
