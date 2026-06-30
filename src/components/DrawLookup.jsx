import React, { useMemo, useState } from 'react';
import { Search, Shuffle, CalendarDays, Hash, AlertCircle } from 'lucide-react';
import drawsData from '../data/draws.json';
import { Panel, Ball, pad2 } from '../lib/ui.jsx';

/** חיפוש תוצאת הגרלה לפי מספר הגרלה. */
export default function DrawLookup() {
  const draws = drawsData.draws;
  const byId = useMemo(() => {
    const m = new Map();
    for (const d of draws) m.set(d.id, d);
    return m;
  }, [draws]);
  const ids = useMemo(() => draws.map((d) => d.id), [draws]);
  const minId = Math.min(...ids), maxId = Math.max(...ids);

  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const lookup = (val) => {
    const id = parseInt(val, 10);
    if (!Number.isFinite(id)) return;
    const d = byId.get(id);
    if (d) { setResult(d); setNotFound(false); }
    else { setResult(null); setNotFound(true); }
  };

  const submit = (e) => { e.preventDefault(); lookup(query); };
  const random = () => {
    const d = draws[Math.floor(Math.random() * draws.length)];
    setQuery(String(d.id)); setResult(d); setNotFound(false);
  };

  const sumOf = (n) => n.reduce((s, x) => s + x, 0);
  const evensOf = (n) => n.filter((x) => x % 2 === 0).length;

  return (
    <Panel title="חיפוש תוצאת הגרלה" subtitle={`הזן מספר הגרלה (${minId.toLocaleString('he-IL')}–${maxId.toLocaleString('he-IL')})`} icon={Search} accent="var(--color-accent)">
      <form onSubmit={submit} className="flex gap-2">
        <div className="relative flex-1">
          <Hash size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-faint" />
          <input
            type="number"
            inputMode="numeric"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="לדוגמה: 3940"
            aria-label="מספר הגרלה"
            className="tnum h-11 w-full rounded-lg border border-line bg-base pr-9 pl-3 text-[15px] font-bold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-faint focus:border-accent/60 focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <button type="submit" className="flex h-11 items-center gap-1.5 rounded-lg bg-accent px-4 text-sm font-bold text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-panel">
          <Search size={15} /> חפש
        </button>
        <button type="button" onClick={random} aria-label="הגרלה אקראית" title="הגרלה אקראית" className="grid h-11 w-11 place-items-center rounded-lg border border-line bg-base text-muted transition-colors hover:border-accent/50 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
          <Shuffle size={16} />
        </button>
      </form>

      {/* תוצאה */}
      {result && (
        <div className="mt-4 rounded-xl border border-line bg-panel-2 p-4 rise">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="tnum flex items-center gap-1.5 text-[13px] font-bold text-ink">
              <Hash size={13} className="text-accent" />הגרלה {result.id.toLocaleString('he-IL')}
            </span>
            <span className="tnum flex items-center gap-1.5 text-[12px] text-muted">
              <CalendarDays size={13} className="text-faint" />{result.date}
            </span>
            {result.era === 'legacy' && (
              <span className="rounded-md bg-gold/10 px-2 py-0.5 text-[11px] font-bold text-gold" style={{ background: 'color-mix(in srgb, var(--color-gold) 12%, #fff)' }}>
                פורמט היסטורי
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {result.n.map((n, i) => (
              <Ball key={i} n={n} size={44} variant="default" delay={i * 50} />
            ))}
            {result.s != null && (
              <>
                <span className="px-0.5 text-faint">+</span>
                <Ball n={result.s} size={44} variant="gold" delay={300} />
              </>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-line-soft pt-3 text-[12px] text-muted">
            <span>סכום <b className="tnum text-ink">{sumOf(result.n)}</b></span>
            <span><b className="tnum text-ink">{evensOf(result.n)}</b> זוגי · <b className="tnum text-ink">{6 - evensOf(result.n)}</b> אי-זוגי</span>
            {result.era === 'legacy' && <span className="text-faint">(הגרלה מהעידן הישן — מאגר גדול יותר)</span>}
          </div>
        </div>
      )}

      {notFound && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-hot/30 bg-hot/5 px-3 py-2.5 text-[12px] text-muted" style={{ background: 'color-mix(in srgb, var(--color-hot) 6%, #fff)' }}>
          <AlertCircle size={15} className="shrink-0 text-hot" />
          לא נמצאה הגרלה במספר הזה. נסה מספר בטווח {minId.toLocaleString('he-IL')}–{maxId.toLocaleString('he-IL')}.
        </div>
      )}
    </Panel>
  );
}
