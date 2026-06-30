import React, { useState } from 'react';
import { Layers, Info, Copy, Check } from 'lucide-react';
import { Panel, pad2 } from '../lib/ui.jsx';

function SetCard({ title, badge, set, note }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(set.numbers.map(pad2).join(' ')).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <div className="rounded-xl border border-accent/25 bg-panel-2 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-[14px] font-black">{title}</h4>
          <span className="tnum rounded-md bg-accent/10 px-2 py-0.5 text-[11px] font-bold text-accent">{badge}</span>
        </div>
        <button onClick={copy} aria-label="העתק" className="grid h-7 w-7 place-items-center rounded-lg border border-line bg-base text-muted transition-colors hover:border-accent/50 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
          {copied ? <Check size={13} className="text-accent" /> : <Copy size={13} />}
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {set.numbers.map((n) => (
          <span key={n} className="tnum grid h-9 w-9 place-items-center rounded-full text-[14px] font-bold" style={{ background: 'radial-gradient(circle at 35% 28%, #e23351, #a8123a)', color: '#fff' }}>{pad2(n)}</span>
        ))}
      </div>
      <p className="tnum mt-3 border-t border-line-soft pt-2.5 text-[12px] text-muted">
        {set.lines} טורים · עלות מוערכת <b className="text-ink">{set.cost} ₪</b>
        <span className="text-faint"> {note}</span>
      </p>
    </div>
  );
}

/** לוטו שיטתי — בוחרים יותר מ-6 מספרים והמערכת משחקת את כל הצירופים שלהם. */
export default function SystematicLotto({ systematic }) {
  return (
    <Panel title="לוטו שיטתי — כיסוי רחב יותר" subtitle="בוחרים יותר מ-6 מספרים, והמערכת משחקת את כל הצירופים" icon={Layers} accent="var(--color-accent)">
      <div className="mb-4 flex items-start gap-2 rounded-lg border border-line-soft bg-base/50 p-3 text-[12.5px] leading-relaxed text-muted">
        <Info size={15} className="mt-0.5 shrink-0 text-accent" />
        <span>
          בלוטו שיטתי בוחרים יותר מ-6 מספרים, והטופס משחק אוטומטית את <b className="text-ink">כל הצירופים האפשריים של 6 מתוכם</b>.
          זה מעלה את הסיכוי לפגוע — אבל גם את העלות. למשל: שיטתי של 7 מספרים = 7 טורים; של 8 מספרים = 28 טורים.
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SetCard title="שיטתי 7" badge="7 מספרים" set={systematic.s7} note="(כל צירופי ה-6)" />
        <SetCard title="שיטתי 8" badge="8 מספרים" set={systematic.s8} note="(כל צירופי ה-6)" />
      </div>

      <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-faint">
        <span className="mt-0.5">ℹ️</span>
        הסטים נבחרו לפי הציון המשוקלל של המודלים (חם + באיחור + מרקוב + צמדים). שיטתי מגדיל כיסוי — אך לא משנה את ההסתברות של כל מספר בודד.
      </p>
    </Panel>
  );
}
