import React from 'react';
import { Star } from 'lucide-react';
import { Panel } from '../lib/ui.jsx';
import Explainer from './Explainer.jsx';

export default function StrongPanel({ strong }) {
  const list = strong.counts;
  const max = Math.max(...list.map((s) => s.count), 1);

  return (
    <Panel title="המספר החזק (1–7)" subtitle={`${strong.draws.toLocaleString('he-IL')} הגרלות עם מספר חזק תקין`} icon={Star} accent="var(--color-gold)">
      <div className="flex items-end justify-between gap-2" style={{ height: 150 }}>
        {list.map((s) => (
          <div key={s.n} className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <span className="tnum text-[10px] text-faint">{(s.pct * 100).toFixed(0)}%</span>
            <div className="flex w-full items-end justify-center" style={{ height: '100%' }}>
              <div
                className="w-full max-w-[34px] rounded-t-md transition-all duration-500 group-hover:opacity-90"
                style={{ height: `${(s.count / max) * 100}%`, background: 'linear-gradient(180deg, #f2c43b, #cc9114)' }}
                title={`חזק ${s.n}: ${s.count} פעמים`}
              />
            </div>
            <span className="tnum grid h-7 w-7 place-items-center rounded-full text-[12px] font-bold" style={{ background: 'radial-gradient(circle at 35% 28%, #f2c43b, #cc9114)', color: '#3a2a00' }}>
              {s.n}
            </span>
          </div>
        ))}
      </div>

      <Explainer
        see="בכל הגרלה נשלף גם ״מספר חזק״ אחד בין 1 ל-7. הגרף מראה כמה פעמים (ובאיזה אחוז) יצא כל אחד מהשבעה."
        conclude="כל המספרים נעים סביב 14% — כלומר כולם יוצאים בערך באותה תדירות, בדיוק כפי שמצופה במשחק אקראי."
        recommend="אפשר לבחור כל מספר חזק בין 1 ל-7 בלי חשש — אין מספר חזק ״עדיף״ על האחרים."
      />
    </Panel>
  );
}
