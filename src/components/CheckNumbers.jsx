import React, { useMemo, useState } from 'react';
import { ClipboardCheck, Flame, Snowflake, Users, CheckCircle2, XCircle, Trophy } from 'lucide-react';
import drawsData from '../data/draws.json';
import { Panel, pad2 } from '../lib/ui.jsx';

/**
 * "בדוק את המספרים שלך" — המשתמש מזין צירוף, והכלי מסביר בכנות:
 * מבנה הצירוף (סכום/זוגי-אי-זוגי), כמה הוא "פופולרי" (סיכוי לחלוק פרס),
 * והאם הצירוף המדויק כבר יצא אי-פעם בהיסטוריה.
 */
export default function CheckNumbers({ numberTable, sweet, sweetEvens }) {
  const [nums, setNums] = useState(['', '', '', '', '', '']);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  // חתימות של כל הצירופים ההיסטוריים (עידן מודרני) לבדיקת התאמה מדויקת
  const modernSet = useMemo(() => {
    const s = new Set();
    for (const d of drawsData.draws) if (d.era === 'modern') s.add(d.n.join('-'));
    return s;
  }, []);
  const freqOf = useMemo(() => {
    const m = {};
    for (const r of numberTable) m[r.n] = r;
    return m;
  }, [numberTable]);

  const setAt = (i, v) => {
    const next = [...nums];
    next[i] = v.replace(/[^0-9]/g, '').slice(0, 2);
    setNums(next);
    setReport(null);
  };

  const analyze = (e) => {
    e.preventDefault();
    const vals = nums.map((x) => parseInt(x, 10));
    if (vals.some((v) => !Number.isFinite(v))) { setError('יש למלא את כל 6 המספרים.'); setReport(null); return; }
    if (vals.some((v) => v < 1 || v > 37)) { setError('כל מספר חייב להיות בין 1 ל-37.'); setReport(null); return; }
    if (new Set(vals).size !== 6) { setError('המספרים חייבים להיות שונים זה מזה.'); setReport(null); return; }
    setError('');

    const sorted = [...vals].sort((a, b) => a - b);
    const sum = sorted.reduce((s, x) => s + x, 0);
    const evens = sorted.filter((n) => n % 2 === 0).length;
    let consec = 0;
    for (let i = 0; i < 5; i++) if (sorted[i + 1] === sorted[i] + 1) consec++;
    const birthday = sorted.filter((n) => n <= 31).length;
    const lowMonth = sorted.filter((n) => n <= 12).length;

    // ציון "פופולריות" (סיכוי לחלוק את הפרס) — ככל שגבוה, כך יותר אנשים בוחרים צירוף כזה
    const crowd = Math.round(100 * (0.7 * (birthday / 6) + 0.3 * (lowMonth / 6)));
    const crowdBand = crowd >= 65 ? 'high' : crowd >= 40 ? 'mid' : 'low';

    const sumOk = sum >= sweet.lo && sum <= sweet.hi;
    const evenOk = sweetEvens.includes(evens);
    const everWon = modernSet.has(sorted.join('-'));

    setReport({ sorted, sum, evens, consec, birthday, lowMonth, crowd, crowdBand, sumOk, evenOk, everWon });
  };

  const crowdText = {
    high: { label: 'פופולרי מאוד', color: 'var(--color-hot)', Icon: Users, msg: 'הרבה אנשים בוחרים מספרים כאלה (בעיקר ימי הולדת ותאריכים). אם תזכה בצירוף כזה — סביר שתחלוק את הפרס עם אנשים רבים, ותקבל פחות.' },
    mid: { label: 'פופולריות בינונית', color: 'var(--color-gold)', Icon: Users, msg: 'צירוף בינוני מבחינת פופולריות. אפשר לשפר אם תוסיף מספרים מעל 31 (שפחות אנשים בוחרים).' },
    low: { label: 'פחות-נפוץ — טוב!', color: '#1f8a5b', Icon: Users, msg: 'צירוף שפחות אנשים בוחרים. אם תזכה — סביר שתחלוק את הפרס עם פחות אנשים ותקבל יותר כסף. זה היתרון הסטטיסטי האמיתי היחיד.' },
  }[report?.crowdBand || 'mid'];

  return (
    <Panel title="בדוק את המספרים שלך" subtitle="הזן 6 מספרים וקבל ניתוח כן של הצירוף" icon={ClipboardCheck} accent="var(--color-accent)">
      <form onSubmit={analyze}>
        <div className="flex flex-wrap items-center gap-2">
          {nums.map((v, i) => (
            <input
              key={i}
              value={v}
              onChange={(e) => setAt(i, e.target.value)}
              inputMode="numeric"
              placeholder="–"
              aria-label={`מספר ${i + 1}`}
              className="tnum h-12 w-12 rounded-lg border border-line bg-base text-center text-[17px] font-bold text-ink outline-none transition-colors placeholder:text-faint focus:border-accent/60 focus:ring-2 focus:ring-accent/30"
            />
          ))}
          <button type="submit" className="ms-auto flex h-12 items-center gap-1.5 rounded-lg bg-accent px-5 text-sm font-bold text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-panel">
            בדוק צירוף
          </button>
        </div>
      </form>
      {error && <p className="mt-2 text-[12px] font-medium text-hot">{error}</p>}

      {report && (
        <div className="mt-4 space-y-3 rise">
          {/* מבנה הצירוף */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="סכום" value={report.sum} ok={report.sumOk} okText={`בטווח הנפוץ ${sweet.lo}–${sweet.hi}`} />
            <Stat label="זוגי / אי-זוגי" value={`${report.evens}/${6 - report.evens}`} ok={report.evenOk} okText="חלוקה נפוצה" />
            <Stat label="מספרים עוקבים" value={report.consec} neutral />
            <Stat label="מספרים עד 31" value={`${report.birthday}/6`} neutral hint="טווח ימי הולדת" />
          </div>

          {/* פופולריות / חלוקת פרס */}
          <div className="rounded-xl border border-line-soft bg-panel-2 p-3.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[13px] font-bold" style={{ color: crowdText.color }}>
                <crowdText.Icon size={15} /> {crowdText.label}
              </span>
              <span className="tnum text-[12px] text-muted">מדד פופולריות: <b style={{ color: crowdText.color }}>{report.crowd}/100</b></span>
            </div>
            <div className="mb-2 h-2 overflow-hidden rounded-full bg-base">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${report.crowd}%`, background: crowdText.color }} />
            </div>
            <p className="text-[12.5px] leading-relaxed text-muted">{crowdText.msg}</p>
          </div>

          {/* האם יצא אי-פעם */}
          <div className={`flex items-center gap-2.5 rounded-xl border p-3.5 ${report.everWon ? 'border-gold/40' : 'border-line-soft'}`} style={report.everWon ? { background: 'color-mix(in srgb, var(--color-gold) 8%, #fff)' } : undefined}>
            {report.everWon ? <Trophy size={18} className="shrink-0 text-gold" /> : <CheckCircle2 size={18} className="shrink-0 text-muted" />}
            <p className="text-[12.5px] leading-relaxed text-ink">
              {report.everWon
                ? <>הצירוף המדויק הזה <b className="text-gold">כבר יצא בעבר!</b> (נדיר מאוד) — אבל זה לא משפיע על העתיד: לכל צירוף אותו סיכוי בכל הגרלה.</>
                : <>הצירוף המדויק הזה <b>מעולם לא יצא</b> ב-22 השנים — וזה נורמלי לחלוטין: יש מיליוני צירופים אפשריים.</>}
            </p>
          </div>

          {/* תזכורת כנה */}
          <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-faint">
            <span className="mt-0.5">ℹ️</span>
            שום צירוף אינו "טוב יותר" לזכייה — לכולם בדיוק אותו סיכוי. הניתוח עוזר רק להבין כמה הצירוף נפוץ ומה מבנהו.
          </p>
        </div>
      )}
    </Panel>
  );
}

function Stat({ label, value, ok, okText, neutral, hint }) {
  const Icon = neutral ? null : ok ? CheckCircle2 : XCircle;
  const color = neutral ? 'var(--color-muted)' : ok ? '#1f8a5b' : 'var(--color-hot)';
  return (
    <div className="rounded-lg border border-line-soft bg-base/40 px-3 py-2">
      <p className="text-[11px] text-faint">{label}</p>
      <p className="tnum mt-0.5 flex items-center gap-1 text-[16px] font-extrabold text-ink">
        {value}
        {Icon && <Icon size={13} style={{ color }} />}
      </p>
      <p className="text-[10px]" style={{ color: neutral ? 'var(--color-faint)' : color }}>{neutral ? hint : okText}</p>
    </div>
  );
}
