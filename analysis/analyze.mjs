/**
 * מנוע ניתוח סטטיסטי ללוטו הישראלי (מפעל הפיס)
 * ---------------------------------------------------------------
 * קורא את ההיסטוריה המלאה מ-lotto.csv (קידוד windows-1255),
 * מחשב תדירות / פערים / נקודות מתיקה / שרשרת מרקוב,
 * ומייצר תיק של 5 קומבינציות מאוזנות.
 * הפלט נכתב ל-src/data/stats.json לצריכת ה-Frontend.
 *
 * הרצה:  node analysis/analyze.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CSV_PATH = process.env.LOTTO_CSV || path.join(ROOT, 'data', 'lotto.csv');
const OUT_PATH = path.join(ROOT, 'src', 'data', 'stats.json');

const MAIN_MIN = 1, MAIN_MAX = 37, PICK = 6;
const STRONG_MIN = 1, STRONG_MAX = 7;

// ---------- כלי עזר ----------
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const sum = (a) => a.reduce((s, x) => s + x, 0);
const mean = (a) => (a.length ? sum(a) / a.length : 0);
const std = (a) => {
  if (a.length < 2) return 0;
  const m = mean(a);
  return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1));
};
// מחולל מספרים פסאודו-אקראי דטרמיניסטי (mulberry32) — לשחזוריות
function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- שלב 1: קריאה ופענוח ----------
// הקובץ מכיל כמה עידנים של פורמט (לוטו ישן 6/49 ועד הפורמט המודרני 6/37).
// אנו מזהים אוטומטית את תאריך המעבר לפורמט המודרני (ההגרלה האחרונה שהכילה מספר>37)
// ושומרים אך ורק את העידן המודרני, כדי שלא לזהם את הסטטיסטיקה בעירוב מאגרים.
function parseCsv() {
  const buf = fs.readFileSync(CSV_PATH);
  const text = new TextDecoder('windows-1255').decode(buf);
  const lines = text.split(/\r?\n/);
  const anomalies = { tooFewCols: 0, badNumbers: 0, dupNumbers: 0, badDate: 0, dupDraw: 0, badStrong: 0, preModern: 0, total: 0 };

  // --- מעבר ראשון: פענוח גולמי של כל שורה שמיש ---
  const parsed = [];
  for (let i = 1; i < lines.length; i++) {
    const raw = lines[i].trim();
    if (!raw) continue;
    anomalies.total++;
    const p = raw.split(',');
    if (p.length < 9) { anomalies.tooFewCols++; continue; }

    const id = parseInt(p[0], 10);
    const nums = [p[2], p[3], p[4], p[5], p[6], p[7]].map((x) => parseInt(x, 10));
    const strong = parseInt(p[8], 10);

    if (!Number.isFinite(id) || nums.some((n) => !Number.isFinite(n) || n < 1)) { anomalies.badNumbers++; continue; }
    if (new Set(nums).size !== PICK) { anomalies.dupNumbers++; continue; }

    const dm = String(p[1]).trim().split('/');
    let dt = null;
    if (dm.length === 3) {
      const [dd, mm, yyyy] = dm.map((x) => parseInt(x, 10));
      if ([dd, mm, yyyy].every(Number.isFinite)) dt = new Date(Date.UTC(yyyy, mm - 1, dd));
    }
    if (!dt || isNaN(dt.getTime())) { anomalies.badDate++; continue; }

    parsed.push({ id, date: String(p[1]).trim(), dt, nums: [...nums].sort((a, b) => a - b), strong, maxNum: Math.max(...nums) });
  }

  // --- זיהוי תאריך המעבר: ההגרלה המאוחרת ביותר שהכילה מספר מעל 37 (עידן ישן) ---
  let transitionDate = new Date(0);
  for (const r of parsed) if (r.maxNum > MAIN_MAX && r.dt > transitionDate) transitionDate = r.dt;

  // --- מעבר שני: שמירת העידן המודרני בלבד (אחרי תאריך המעבר, וכל המספרים 1..37) ---
  const seenIds = new Set();
  const rows = [];
  for (const r of parsed) {
    if (r.dt <= transitionDate || r.maxNum > MAIN_MAX) { anomalies.preModern++; continue; }
    if (seenIds.has(r.id)) { anomalies.dupDraw++; continue; }
    seenIds.add(r.id);

    let strongValid = r.strong;
    if (!Number.isFinite(r.strong) || r.strong < STRONG_MIN || r.strong > STRONG_MAX) {
      anomalies.badStrong++;
      strongValid = null; // שומרים את ההגרלה לניתוח 6 המספרים, אך ללא מספר חזק תקין
    }
    rows.push({ id: r.id, date: r.date, dt: r.dt, nums: r.nums, strong: strongValid });
  }

  rows.sort((a, b) => a.dt - b.dt || a.id - b.id);
  const transition = transitionDate.getTime() > 0
    ? `${String(transitionDate.getUTCDate()).padStart(2, '0')}/${String(transitionDate.getUTCMonth() + 1).padStart(2, '0')}/${transitionDate.getUTCFullYear()}`
    : null;

  // --- מאגר חיפוש: כל ההגרלות (שני העידנים) לחיפוש לפי מספר הגרלה ---
  const modernIds = new Set(rows.map((r) => r.id));
  const seenAll = new Set();
  const allDraws = [];
  for (const r of [...parsed].sort((a, b) => a.dt - b.dt || a.id - b.id)) {
    if (seenAll.has(r.id)) continue;
    seenAll.add(r.id);
    allDraws.push({
      id: r.id, date: r.date, n: r.nums,
      s: Number.isFinite(r.strong) ? r.strong : null,
      era: modernIds.has(r.id) ? 'modern' : 'legacy',
    });
  }

  return { rows, anomalies, transition, allDraws };
}

// ---------- שלב 2: ניתוח סטטיסטי ----------
function freqInWindow(rows, predicate) {
  const f = new Array(MAIN_MAX + 1).fill(0);
  let count = 0;
  for (const r of rows) {
    if (predicate && !predicate(r)) continue;
    count++;
    for (const n of r.nums) f[n]++;
  }
  return { counts: f, draws: count };
}

function build() {
  const { rows, anomalies, transition, allDraws } = parseCsv();
  if (rows.length < 50) throw new Error(`מעט מדי הגרלות תקינות (${rows.length}) — בדוק את הקובץ`);

  // כתיבת מאגר החיפוש (כל ההגרלות) לקובץ נפרד
  const drawsOut = path.join(ROOT, 'src', 'data', 'draws.json');
  fs.mkdirSync(path.dirname(drawsOut), { recursive: true });
  fs.writeFileSync(drawsOut, JSON.stringify({ count: allDraws.length, draws: allDraws }), 'utf-8');

  const last = rows[rows.length - 1];
  const lastDate = last.dt;
  const oneYearAgo = new Date(lastDate); oneYearAgo.setUTCFullYear(oneYearAgo.getUTCFullYear() - 1);
  const fiveYearsAgo = new Date(lastDate); fiveYearsAgo.setUTCFullYear(fiveYearsAgo.getUTCFullYear() - 5);

  // --- תדירות לפי חלונות זמן ---
  const allTime = freqInWindow(rows, null);
  const last1y = freqInWindow(rows, (r) => r.dt >= oneYearAgo);
  const last5y = freqInWindow(rows, (r) => r.dt >= fiveYearsAgo);

  const numbers = range(MAIN_MIN, MAIN_MAX);
  const expectedShare = PICK / MAIN_MAX; // הסתברות תיאורטית לכל מספר בהגרלה

  // --- פערים / overdue: כמה הגרלות עברו מאז ההופעה האחרונה ---
  const lastSeenIdx = new Array(MAIN_MAX + 1).fill(-1);
  rows.forEach((r, idx) => { for (const n of r.nums) lastSeenIdx[n] = idx; });
  const totalDraws = rows.length;
  const gaps = numbers.map((n) => ({
    n,
    gap: lastSeenIdx[n] === -1 ? totalDraws : totalDraws - 1 - lastSeenIdx[n],
  }));

  // --- מספר חזק ---
  const strongCounts = new Array(STRONG_MAX + 1).fill(0);
  let strongDraws = 0;
  const strongLastSeen = new Array(STRONG_MAX + 1).fill(-1);
  rows.forEach((r, idx) => {
    if (r.strong != null) { strongCounts[r.strong]++; strongDraws++; strongLastSeen[r.strong] = idx; }
  });

  // --- סכום 6 המספרים ---
  const sums = rows.map((r) => sum(r.nums));
  const sumMean = mean(sums), sumStd = std(sums);
  const sumMin = Math.min(...sums), sumMax = Math.max(...sums);
  // היסטוגרמה בקבוצות של 10
  const binSize = 10;
  const histStart = Math.floor(sumMin / binSize) * binSize;
  const histEnd = Math.ceil(sumMax / binSize) * binSize;
  const sumHist = [];
  for (let b = histStart; b < histEnd; b += binSize) {
    const c = sums.filter((s) => s >= b && s < b + binSize).length;
    sumHist.push({ bin: `${b}-${b + binSize - 1}`, lo: b, hi: b + binSize - 1, count: c, pct: c / sums.length });
  }
  // "נקודת מתיקה" לסכום: הטווח המרכזי שמכיל ~68% (ממוצע ± סטיית תקן)
  const sumSweet = { lo: Math.round(sumMean - sumStd), hi: Math.round(sumMean + sumStd) };

  // --- זוגי מול אי-זוגי ---
  const evenOddDist = new Array(PICK + 1).fill(0); // index = כמות הזוגיים
  for (const r of rows) {
    const evens = r.nums.filter((n) => n % 2 === 0).length;
    evenOddDist[evens]++;
  }
  const evenOdd = evenOddDist.map((c, evens) => ({
    evens, odds: PICK - evens, count: c, pct: c / rows.length,
    label: `${evens} זוגי / ${PICK - evens} אי-זוגי`,
  })).sort((a, b) => b.count - a.count);
  // הספלטים המועדפים (מצטבר ~80%)
  let acc = 0; const sweetSplits = [];
  for (const s of evenOdd) { sweetSplits.push(s); acc += s.pct; if (acc >= 0.8) break; }
  const sweetEvenCounts = new Set(sweetSplits.map((s) => s.evens));

  // --- מספרים עוקבים (consecutive pairs) ---
  const consecPairCount = {}; // "k-k+1" -> count
  const consecPerDraw = new Array(PICK).fill(0); // כמה זוגות עוקבים בהגרלה
  let drawsWithConsec = 0;
  for (const r of rows) {
    let pairs = 0;
    for (let i = 0; i < r.nums.length - 1; i++) {
      if (r.nums[i + 1] === r.nums[i] + 1) {
        pairs++;
        const key = `${r.nums[i]}-${r.nums[i + 1]}`;
        consecPairCount[key] = (consecPairCount[key] || 0) + 1;
      }
    }
    if (pairs > 0) drawsWithConsec++;
    consecPerDraw[Math.min(pairs, PICK - 1)]++;
  }
  const topConsecPairs = Object.entries(consecPairCount)
    .map(([pair, count]) => ({ pair, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  // --- קו-הופעה: אילו מספרים מופיעים יחד (צמדים חזקים) ---
  const co = Array.from({ length: MAIN_MAX + 1 }, () => new Array(MAIN_MAX + 1).fill(0));
  for (const r of rows) {
    const ns = r.nums;
    for (let ai = 0; ai < ns.length; ai++) {
      for (let bi = ai + 1; bi < ns.length; bi++) { co[ns[ai]][ns[bi]]++; co[ns[bi]][ns[ai]]++; }
    }
  }
  const pairExpected = rows.length * (PICK / MAIN_MAX) * ((PICK - 1) / (MAIN_MAX - 1));
  const pairList = [];
  for (const a of numbers) for (let b = a + 1; b <= MAIN_MAX; b++) pairList.push({ a, b, count: co[a][b], lift: pairExpected ? co[a][b] / pairExpected : 0 });
  const topPairs = pairList.sort((p, q) => q.count - p.count || p.a - q.a || p.b - q.b).slice(0, 12);
  const companions = {};
  for (const n of numbers) {
    companions[n] = numbers.filter((m) => m !== n).map((m) => ({ n: m, count: co[n][m] }))
      .sort((x, y) => y.count - x.count || x.n - y.n).slice(0, 4);
  }
  const companionCentrality = numbers.map((n) => ({ n, v: numbers.reduce((s, m) => s + (m !== n ? co[n][m] : 0), 0) }));

  // --- שרשרת מרקוב / הסתברויות מעבר ---
  // T[y][x] = מספר הפעמים ש-x הופיע בהגרלה הבאה בהינתן ש-y הופיע בהגרלה הנוכחית
  const T = Array.from({ length: MAIN_MAX + 1 }, () => new Array(MAIN_MAX + 1).fill(0));
  const yOccurAsCurrent = new Array(MAIN_MAX + 1).fill(0); // כמה פעמים y הופיע כ"נוכחי" (לא כולל ההגרלה האחרונה)
  for (let i = 0; i < rows.length - 1; i++) {
    const cur = rows[i].nums, next = rows[i + 1].nums;
    for (const y of cur) {
      yOccurAsCurrent[y]++;
      for (const x of next) T[y][x]++;
    }
  }
  // ציון מעבר עבור ההגרלה האחרונה: לכל מועמד x ממוצע P(x|y) על פני y בהגרלה האחרונה
  const lastNums = last.nums;
  const transitionScore = numbers.map((x) => {
    let s = 0, used = 0;
    for (const y of lastNums) {
      if (yOccurAsCurrent[y] > 0) { s += T[y][x] / yOccurAsCurrent[y]; used++; }
    }
    return { n: x, score: used ? s / used : 0 };
  });
  const transRank = [...transitionScore].sort((a, b) => b.score - a.score);

  // ---------- שלב 3: יצירת תיק 5 קומבינציות ----------
  // נורמליזציה של שלושה אותות: חם, פיגור (overdue), מעבר (מרקוב)
  const norm = (arr, key) => {
    const vals = arr.map((o) => o[key]);
    const lo = Math.min(...vals), hi = Math.max(...vals);
    const sp = hi - lo || 1;
    const m = {};
    arr.forEach((o) => { m[o.n] = (o[key] - lo) / sp; });
    return m;
  };
  // ציון "חום" משוקלל: כל הזמנים + דגש על השנה האחרונה
  const hotRaw = numbers.map((n) => ({ n, v: 0.5 * allTime.counts[n] / allTime.draws + 0.5 * (last1y.draws ? last1y.counts[n] / last1y.draws : 0) }));
  const hotN = norm(hotRaw, 'v');
  const overdueN = norm(gaps.map((g) => ({ n: g.n, v: g.gap })), 'v');
  const transN = norm(transitionScore.map((t) => ({ n: t.n, v: t.score })), 'v');
  const companionN = norm(companionCentrality, 'v');

  // ציון משוקלל (ensemble) המשלב את כל המודלים — לפיזור וללוטו שיטתי
  const ensemble = {};
  for (const n of numbers) ensemble[n] = 0.35 * hotN[n] + 0.25 * overdueN[n] + 0.20 * transN[n] + 0.20 * companionN[n];
  const ensembleRank = [...numbers].sort((a, b) => ensemble[b] - ensemble[a] || a - b);

  // אסטרטגיות החיזוי (משקלי חם/פיגור/מעבר + מודלים דטרמיניסטיים)
  const strategies = [
    { key: 'balanced', name: 'איזון מלא', desc: 'משקל שווה לכל השיטות — מספרים חמים, מספרים באיחור ומגמת ההגרלה האחרונה', w: { hot: 0.34, over: 0.33, trans: 0.33 } },
    { key: 'hot', name: 'המספרים החמים', desc: 'דגש על המספרים שיוצאים הכי הרבה לאורך ההיסטוריה', w: { hot: 0.60, over: 0.15, trans: 0.25 } },
    { key: 'overdue', name: 'מספרים באיחור', desc: 'דגש על מספרים שלא יצאו הרבה זמן (“בפיגור”) וצפויים לחזור', w: { hot: 0.15, over: 0.60, trans: 0.25 } },
    { key: 'markov', name: 'לפי ההגרלה האחרונה', desc: 'מספרים שנוטים סטטיסטית להופיע מיד אחרי תוצאת ההגרלה הקודמת', w: { hot: 0.20, over: 0.20, trans: 0.60 } },
    { key: 'companions', name: 'צמדים חזקים', type: 'companions', desc: 'נבנה סביב מספרים שמופיעים יחד הכי הרבה לאורך ההיסטוריה' },
    { key: 'spread', name: 'פיזור מאוזן', type: 'spread', desc: 'מספר מכל טווח (נמוך/בינוני/גבוה) לכיסוי רחב של לוח המספרים' },
  ];

  // קטגוריזציה לתיוג בממשק
  const hotSet = new Set([...hotRaw].sort((a, b) => b.v - a.v).slice(0, 10).map((o) => o.n));
  const coldSet = new Set([...gaps].sort((a, b) => b.gap - a.gap).slice(0, 10).map((o) => o.n));
  const transSet = new Set(transRank.slice(0, 10).map((o) => o.n));
  const tagOf = (n) => {
    if (transSet.has(n)) return 'trans';
    if (coldSet.has(n)) return 'cold';
    if (hotSet.has(n)) return 'hot';
    return 'neutral';
  };

  const rng = mulberry32(0x10770 ^ last.id); // זרע קבוע התלוי בהגרלה האחרונה
  const weightFor = (w) => {
    const m = {};
    for (const n of numbers) m[n] = w.hot * hotN[n] + w.over * overdueN[n] + w.trans * transN[n] + 0.02;
    return m;
  };
  const weightedPick = (weights, exclude) => {
    const pool = numbers.filter((n) => !exclude.has(n));
    const total = pool.reduce((s, n) => s + weights[n], 0);
    let r = rng() * total;
    for (const n of pool) { r -= weights[n]; if (r <= 0) return n; }
    return pool[pool.length - 1];
  };

  const sumOk = (s) => s >= sumSweet.lo && s <= sumSweet.hi;
  const evenOk = (combo) => sweetEvenCounts.has(combo.filter((n) => n % 2 === 0).length);

  function generateTicket(weights) {
    // דגימת דחייה: בונים 6 מספרים שמקיימים את נקודות המתיקה (סכום + זוגי/אי-זוגי)
    for (let attempt = 0; attempt < 4000; attempt++) {
      const chosen = new Set();
      while (chosen.size < PICK) chosen.add(weightedPick(weights, chosen));
      const combo = [...chosen].sort((a, b) => a - b);
      if (sumOk(sum(combo)) && evenOk(combo)) return combo;
    }
    // נפילה אחורה: דגימה ללא אילוצים
    const chosen = new Set();
    while (chosen.size < PICK) chosen.add(weightedPick(weights, chosen));
    return [...chosen].sort((a, b) => a - b);
  }

  // ניבוי מספר חזק: שילוב תדירות + פיגור, ייחודי ככל האפשר בין הכרטיסים
  const strongGap = range(STRONG_MIN, STRONG_MAX).map((n) => ({ n, gap: strongLastSeen[n] === -1 ? totalDraws : totalDraws - 1 - strongLastSeen[n] }));
  const strongScore = range(STRONG_MIN, STRONG_MAX).map((n) => ({
    n, v: 0.6 * (strongCounts[n] / (strongDraws || 1)) + 0.4 * (strongGap.find((g) => g.n === n).gap / totalDraws),
  })).sort((a, b) => b.v - a.v);

  // מודל "צמדים חזקים" (דטרמיניסטי): מתחילים מהצמד החזק ביותר ומוסיפים בחמדנות
  const genCompanions = () => {
    let best = null, bestC = -1;
    for (const a of numbers) for (let b = a + 1; b <= MAIN_MAX; b++) { if (co[a][b] > bestC) { bestC = co[a][b]; best = [a, b]; } }
    const chosen = [best[0], best[1]];
    while (chosen.length < PICK) {
      let cand = -1, candScore = -1;
      for (const m of numbers) {
        if (chosen.includes(m)) continue;
        const sc = chosen.reduce((s, c) => s + co[m][c], 0);
        if (sc > candScore) { candScore = sc; cand = m; }
      }
      chosen.push(cand);
    }
    return [...chosen].sort((a, b) => a - b);
  };

  // מודל "פיזור מאוזן" (דטרמיניסטי): מספר מכל טווח לפי הציון המשוקלל
  const genSpread = () => {
    const bands = [[1, 9], [10, 18], [19, 27], [28, 37]];
    const chosen = [];
    for (const [lo, hi] of bands) {
      let cand = -1, bestE = -Infinity;
      for (let n = lo; n <= hi; n++) { if (!chosen.includes(n) && ensemble[n] > bestE) { bestE = ensemble[n]; cand = n; } }
      chosen.push(cand);
    }
    const rest = numbers.filter((n) => !chosen.includes(n)).sort((a, b) => ensemble[b] - ensemble[a] || a - b);
    while (chosen.length < PICK) chosen.push(rest.shift());
    return [...chosen].sort((a, b) => a - b);
  };

  const tickets = [];
  const seenCombos = new Set();
  strategies.forEach((st, i) => {
    let combo;
    if (st.type === 'companions') combo = genCompanions();
    else if (st.type === 'spread') combo = genSpread();
    else {
      const weights = weightFor(st.w);
      for (let tries = 0; tries < 50; tries++) {
        combo = generateTicket(weights);
        const sig = combo.join('-');
        if (!seenCombos.has(sig)) { seenCombos.add(sig); break; }
      }
    }
    seenCombos.add(combo.join('-'));
    const strong = strongScore[i % strongScore.length].n;
    const evens = combo.filter((n) => n % 2 === 0).length;
    // ניתוח הצירוף: כמה חמים/באיחור, והצמד החזק ביותר בתוכו
    let bestPair = [combo[0], combo[1]], bestPC = -1;
    for (let ai = 0; ai < PICK; ai++) for (let bi = ai + 1; bi < PICK; bi++) { if (co[combo[ai]][combo[bi]] > bestPC) { bestPC = co[combo[ai]][combo[bi]]; bestPair = [combo[ai], combo[bi]]; } }
    tickets.push({
      id: i + 1,
      strategy: st.key,
      strategyName: st.name,
      strategyDesc: st.desc,
      numbers: combo,
      strong,
      sum: sum(combo),
      evens, odds: PICK - evens,
      tags: combo.map((n) => ({ n, tag: tagOf(n) })),
      analysis: {
        hotCount: combo.filter((n) => hotSet.has(n)).length,
        overdueCount: combo.filter((n) => coldSet.has(n)).length,
        avgFreq: Math.floor((combo.reduce((s, n) => s + allTime.counts[n], 0) / PICK) * 10 + 0.5) / 10,
        bestPair: { a: bestPair[0], b: bestPair[1], count: co[bestPair[0]][bestPair[1]] },
      },
    });
  });

  // --- לוטו שיטתי: סטים מומלצים לפי הציון המשוקלל ---
  const systematic = {
    s7: { numbers: ensembleRank.slice(0, 7).slice().sort((a, b) => a - b), lines: 7, cost: Math.round(7 * 5.8) },
    s8: { numbers: ensembleRank.slice(0, 8).slice().sort((a, b) => a - b), lines: 28, cost: Math.round(28 * 5.8) },
  };

  // ---------- הרכבת הפלט ----------
  const fmtDate = (dt) => `${String(dt.getUTCDate()).padStart(2, '0')}/${String(dt.getUTCMonth() + 1).padStart(2, '0')}/${dt.getUTCFullYear()}`;

  const numberTable = numbers.map((n) => ({
    n,
    all: allTime.counts[n],
    allPct: allTime.counts[n] / allTime.draws,
    y1: last1y.counts[n],
    y5: last5y.counts[n],
    gap: gaps.find((g) => g.n === n).gap,
    transScore: transitionScore.find((t) => t.n === n).score,
    hot: hotSet.has(n),
    cold: coldSet.has(n),
  }));

  const hottest = [...numberTable].sort((a, b) => b.all - a.all).slice(0, 8);
  const coldest = [...numberTable].sort((a, b) => a.all - b.all).slice(0, 8);
  const mostOverdue = [...gaps].sort((a, b) => b.gap - a.gap).slice(0, 8);

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      source: path.basename(CSV_PATH),
      totalDraws,
      firstDraw: { id: rows[0].id, date: fmtDate(rows[0].dt) },
      lastDraw: { id: last.id, date: fmtDate(last.dt), numbers: last.nums, strong: last.strong },
      years: ((lastDate - rows[0].dt) / (365.25 * 24 * 3600 * 1000)),
      formatTransition: transition,
      anomalies,
      expectedShare,
    },
    numberTable,
    frequency: {
      allTime: { draws: allTime.draws, counts: numbers.map((n) => allTime.counts[n]) },
      last1y: { draws: last1y.draws, counts: numbers.map((n) => last1y.counts[n]) },
      last5y: { draws: last5y.draws, counts: numbers.map((n) => last5y.counts[n]) },
      hottest, coldest,
    },
    overdue: { gaps, mostOverdue },
    strong: {
      counts: range(STRONG_MIN, STRONG_MAX).map((n) => ({ n, count: strongCounts[n], pct: strongCounts[n] / (strongDraws || 1), gap: strongGap.find((g) => g.n === n).gap })),
      draws: strongDraws,
    },
    sumStats: { mean: sumMean, std: sumStd, min: sumMin, max: sumMax, hist: sumHist, sweet: sumSweet },
    evenOdd: { dist: evenOdd, sweetSplits },
    consecutive: { drawsWithConsec, pctWithConsec: drawsWithConsec / rows.length, perDraw: consecPerDraw, topPairs: topConsecPairs },
    coOccurrence: { topPairs, companions, expected: pairExpected },
    systematic,
    markov: { lastNumbers: lastNums, topNext: transRank.slice(0, 10) },
    tickets,
  };
}

// ---------- ריצה ----------
try {
  const out = build();
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2), 'utf-8');

  // דיווח אימות לקונסול
  const m = out.meta;
  console.log('✓ ניתוח הושלם בהצלחה');
  console.log(`  הגרלות תקינות: ${m.totalDraws}`);
  console.log(`  טווח (פורמט מודרני 6/37): ${m.firstDraw.date} (#${m.firstDraw.id})  →  ${m.lastDraw.date} (#${m.lastDraw.id})`);
  console.log(`  שנים מכוסות: ${m.years.toFixed(1)}  | תאריך מעבר פורמט: ${m.formatTransition}`);
  console.log(`  אנומליות:`, JSON.stringify(m.anomalies));
  console.log(`  הגרלה אחרונה: [${m.lastDraw.numbers.join(', ')}] + חזק ${m.lastDraw.strong}`);
  console.log(`  ממוצע סכום: ${out.sumStats.mean.toFixed(1)} (±${out.sumStats.std.toFixed(1)}), נקודת מתיקה ${out.sumStats.sweet.lo}-${out.sumStats.sweet.hi}`);
  console.log(`  ספליט זוגי/אי-זוגי מוביל: ${out.evenOdd.dist[0].label} (${(out.evenOdd.dist[0].pct * 100).toFixed(1)}%)`);
  console.log(`  5 הצירופים שנוצרו:`);
  for (const t of out.tickets) {
    console.log(`   #${t.id} [${t.strategyName}] ${t.numbers.map((x) => String(x).padStart(2, '0')).join(' ')} | חזק ${t.strong} | סכום ${t.sum} | ${t.evens}ז/${t.odds}א`);
  }
  console.log(`  נכתב אל: ${path.relative(ROOT, OUT_PATH)}`);
} catch (e) {
  console.error('✗ שגיאה בניתוח:', e.message);
  process.exit(1);
}
