import React from 'react';
import { GitBranch, ArrowLeft } from 'lucide-react';
import { Panel, pad2 } from '../lib/ui.jsx';
import Explainer from './Explainer.jsx';
import Term from './Term.jsx';

export default function MarkovPanel({ markov }) {
  const top = markov.topNext;
  const max = Math.max(...top.map((t) => t.score), 0.0001);

  return (
    <Panel
      title={<>מה נוטה לצאת אחרי ההגרלה הקודמת <Term def="שיטה מתמטית (שרשרת מרקוב) שבודקת אילו מספרים נטו להופיע מיד אחרי תוצאה מסוימת בעבר.">(מרקוב)</Term></>}
      subtitle="המספרים שהופיעו הכי הרבה בהגרלות שאחרי תוצאה דומה"
      icon={GitBranch}
      accent="var(--color-gold)"
    >
      {/* ההגרלה האחרונה */}
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-line-soft bg-base/50 p-3">
        <span className="text-[11px] text-faint">הגרלה אחרונה</span>
        <div className="flex gap-1">
          {markov.lastNumbers.map((n) => (
            <span key={n} className="tnum grid h-7 w-7 place-items-center rounded-md border border-line bg-panel-2 text-[11px] font-bold">{pad2(n)}</span>
          ))}
        </div>
        <ArrowLeft size={16} className="mr-auto text-gold" />
      </div>

      <p className="mb-2 text-[11px] text-faint">מועמדים מובילים להגרלה הבאה:</p>
      <div className="space-y-2">
        {top.map((t, i) => (
          <div key={t.n} className="flex items-center gap-3 rise" style={{ animationDelay: `${i * 45}ms` }}>
            <span className="tnum grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[12px] font-bold" style={{ background: 'color-mix(in srgb, var(--color-gold) 14%, var(--color-panel-2))', color: 'var(--color-gold)', boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-gold) 35%, transparent)' }}>
              {pad2(t.n)}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-base">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(t.score / max) * 100}%`, background: 'linear-gradient(90deg, #f2c43b, #cc9114)' }} />
            </div>
            <span className="tnum w-12 text-left text-[11px] text-muted">{(t.score * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>

      <Explainer
        see="לפי כל ההיסטוריה, בודקים אילו מספרים נטו להופיע בהגרלה שאחרי ההגרלה הקודמת. ככל שהפס ארוך — המספר ״עקב״ אחרי התוצאה הקודמת בתדירות גבוהה יותר."
        conclude="ההבדלים בין המספרים זעירים ומקריים. אין באמת ״זיכרון״ או קשר בין הגרלה אחת לבאה אחריה."
        recommend="מעניין להסתכל מתוך סקרנות, אבל אין כאן בסיס אמיתי לבחירת מספרים. הגרלה אחת אינה משפיעה על הבאה."
      />
    </Panel>
  );
}
