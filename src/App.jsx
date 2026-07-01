import React, { useState } from 'react';
import { ShieldAlert, Info, ChevronDown, BookOpen, BarChart3 } from 'lucide-react';
import stats from './data/stats.json';
import { Kpi } from './lib/ui.jsx';
import Header from './components/Header.jsx';
import IntroBanner from './components/IntroBanner.jsx';
import NextDraw from './components/NextDraw.jsx';
import PredictionsHero from './components/PredictionsHero.jsx';
import ModelsLegend from './components/ModelsLegend.jsx';
import StrongPairs from './components/StrongPairs.jsx';
import SystematicLotto from './components/SystematicLotto.jsx';
import HotColdChart from './components/HotColdChart.jsx';
import SumDistribution from './components/SumDistribution.jsx';
import OverduePanel from './components/OverduePanel.jsx';
import RatioPanel from './components/RatioPanel.jsx';
import MarkovPanel from './components/MarkovPanel.jsx';
import NumberGrid from './components/NumberGrid.jsx';
import StrongPanel from './components/StrongPanel.jsx';
import Glossary from './components/Glossary.jsx';

export default function App() {
  const [heroKey, setHeroKey] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const { meta, frequency, sumStats, overdue, evenOdd, consecutive, markov, numberTable, strong, tickets, coOccurrence, systematic } = stats;
  const topSplit = [...evenOdd.dist].sort((a, b) => b.count - a.count)[0];

  return (
    <div className="min-h-screen overflow-x-hidden text-ink">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:right-3 focus:top-3 focus:z-[200] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-white">
        דלג לתוכן הראשי
      </a>
      <Header meta={meta} />

      <main id="main" className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 sm:px-5">
        {/* ===== פס דק: ההגרלה הבאה ===== */}
        <NextDraw />

        {/* ========== העיקר: התחזיות ========== */}
        <div id="predictions">
          <PredictionsHero key={heroKey} tickets={tickets} sweet={sumStats.sweet} onRegen={() => setHeroKey((k) => k + 1)} />
        </div>

        {/* מקרא המודלים (מתקפל) */}
        <ModelsLegend tickets={tickets} />

        {/* ========== מעניין: צמדים חזקים + לוטו שיטתי ========== */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div id="pairs"><StrongPairs coOccurrence={coOccurrence} /></div>
          <div id="systematic"><SystematicLotto systematic={systematic} /></div>
        </div>

        {/* משפט-על כן (קומפקטי) */}
        <IntroBanner totalDraws={meta.totalDraws} years={meta.years} />

        {/* ========== פחות עיקרי: סטטיסטיקה מעמיקה (מתקפל) ========== */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi label="הגרלות במאגר" value={meta.totalDraws.toLocaleString('he-IL')} hint="פורמט מודרני 6/37" />
          <Kpi label="שנות היסטוריה" value={meta.years.toFixed(1)} unit="שנים" hint={`מ-${meta.firstDraw.date}`} />
          <Kpi label="ממוצע סכום" value={sumStats.mean.toFixed(0)} unit={`±${sumStats.std.toFixed(0)}`} hint={`טווח נפוץ ${sumStats.sweet.lo}–${sumStats.sweet.hi}`} accent="var(--color-accent)" />
          <Kpi label="חלוקה נפוצה" value={topSplit.label.replace(' זוגי', 'ז').replace(' אי-זוגי', 'א')} hint={`${(topSplit.pct * 100).toFixed(0)}% מההגרלות`} />
        </div>

        <button
          onClick={() => setShowStats((v) => !v)}
          aria-expanded={showStats}
          className="group flex w-full items-center justify-center gap-2.5 rounded-xl border border-line bg-panel card-shadow px-5 py-3.5 text-sm font-bold text-ink transition-colors hover:border-accent/40 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <BarChart3 size={16} />
          {showStats ? 'הסתר סטטיסטיקה מעמיקה' : 'הצג סטטיסטיקה מעמיקה'}
          <span className="tnum rounded-md bg-base px-1.5 py-0.5 text-[11px] text-muted">7</span>
          <ChevronDown size={17} className={`transition-transform duration-300 ${showStats ? 'rotate-180' : ''}`} />
        </button>

        {showStats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <HotColdChart frequency={frequency} />
              <SumDistribution sumStats={sumStats} tickets={tickets} />
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <OverduePanel overdue={overdue} />
              <RatioPanel evenOdd={evenOdd} consecutive={consecutive} />
              <MarkovPanel markov={markov} />
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
              <NumberGrid numberTable={numberTable} />
              <StrongPanel strong={strong} />
            </div>
          </div>
        )}

        {/* ===== הערה אחראית ===== */}
        <footer className="rounded-xl border border-line bg-panel card-shadow p-5">
          <div className="flex items-start gap-3">
            <ShieldAlert size={18} className="mt-0.5 shrink-0 text-hot" />
            <div className="space-y-1.5 text-[12px] leading-relaxed text-muted">
              <p className="font-bold text-ink">הבהרה — הגרלת לוטו היא אירוע אקראי.</p>
              <p>
                כל מספר נשלף באופן בלתי-תלוי, ואין בכוחו של ניתוח היסטורי כלשהו לחזות תוצאה עתידית. הצירופים המוצגים נגזרים מדפוסים סטטיסטיים בעבר בלבד ומיועדים למטרות לימוד והתרשמות — <b className="text-ink">לא</b> כעצה פיננסית או ערובה לזכייה.
              </p>
              <p className="flex items-center gap-1.5 text-faint">
                <Info size={12} /> מבוסס על {meta.totalDraws.toLocaleString('he-IL')} הגרלות ({meta.firstDraw.date}–{meta.lastDraw.date}). משחק אחראי בלבד · אסור למכירה מתחת לגיל 18.
              </p>
            </div>
          </div>
        </footer>
      </main>

      {/* כפתור מילון צף — תמיד נגיש */}
      <button
        onClick={() => setGlossaryOpen(true)}
        style={{ bottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))', insetInlineStart: 'calc(1.25rem + env(safe-area-inset-left, 0px))' }}
        className="fixed z-50 flex items-center gap-2 rounded-full border border-accent/40 bg-panel card-shadow px-4 py-3 text-[13px] font-bold text-accent transition-all hover:bg-accent hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label="פתח מילון מונחים"
      >
        <BookOpen size={16} strokeWidth={2.3} />
        <span className="hidden sm:inline">מילון מונחים</span>
      </button>

      <Glossary open={glossaryOpen} onClose={() => setGlossaryOpen(false)} />
    </div>
  );
}
