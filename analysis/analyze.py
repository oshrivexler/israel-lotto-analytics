"""
מנוע ניתוח סטטיסטי ללוטו הישראלי (מפעל הפיס) — גרסת Python / Pandas
-------------------------------------------------------------------------
קורא את ההיסטוריה המלאה מ-lotto.csv (קידוד windows-1255),
מחשב תדירות / פערים / נקודות מתיקה / שרשרת מרקוב,
ומייצר תיק של 5 קומבינציות מאוזנות.
הפלט נכתב ל-src/data/stats.json לצריכת ה-Frontend.

זוהי טרנספורמציה נאמנה של analyze.mjs — כולל אותו מחולל פסאודו-אקראי
(mulberry32) ואותו סדר פעולות, כך שנוצרים אותם 5 הצירופים בדיוק.

הרצה:  python analysis/analyze.py
"""
from __future__ import annotations
import json
import math
import os
import sys
from datetime import datetime, timezone

import numpy as np
import pandas as pd

# הקונסול ב-Windows הוא cp1252 כברירת מחדל — מעבר ל-UTF-8 לתמיכה בעברית/סמלים
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:  # noqa: BLE001
    pass

# ---------- קבועים ----------
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
CSV_PATH = os.environ.get("LOTTO_CSV", os.path.join(ROOT, "data", "lotto.csv"))
OUT_PATH = os.path.join(ROOT, "src", "data", "stats.json")

MAIN_MIN, MAIN_MAX, PICK = 1, 37, 6
STRONG_MIN, STRONG_MAX = 1, 7
NUMBERS = list(range(MAIN_MIN, MAIN_MAX + 1))


# ---------- כלי עזר ----------
def js_round(x: float) -> int:
    """עיגול בסגנון JavaScript (Math.round) — חצי כלפי מעלה."""
    return math.floor(x + 0.5)


def sample_std(values) -> float:
    """סטיית תקן מדגמית (n-1) — תואם לחישוב ב-JS."""
    a = np.asarray(values, dtype=float)
    if a.size < 2:
        return 0.0
    m = a.mean()
    return math.sqrt(((a - m) ** 2).sum() / (a.size - 1))


def _imul(a: int, b: int) -> int:
    """שכפול Math.imul של JS (כפל 32-ביט)."""
    return (a * b) & 0xFFFFFFFF


def mulberry32(seed: int):
    """מחולל פסאודו-אקראי דטרמיניסטי — זהה לגרסת ה-JS (לשחזוריות)."""
    state = {"t": seed & 0xFFFFFFFF}

    def rng() -> float:
        state["t"] = (state["t"] + 0x6D2B79F5) & 0xFFFFFFFF
        t = state["t"]
        r = _imul(t ^ (t >> 15), 1 | t)
        # מקביל ל-JS:  r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
        r = (r ^ ((r + _imul(r ^ (r >> 7), 61 | r)) & 0xFFFFFFFF)) & 0xFFFFFFFF
        r ^= r >> 14
        return (r & 0xFFFFFFFF) / 4294967296.0

    return rng


def fmt_date(d: datetime) -> str:
    return f"{d.day:02d}/{d.month:02d}/{d.year}"


# ---------- שלב 1: קליטה ופענוח (Pandas) ----------
def parse_csv():
    """
    קליטה עם Pandas (קידוד windows-1255), זיהוי אוטומטי של עידן הפורמט המודרני
    (6/37) ושמירתו בלבד — כדי לא לזהם את הסטטיסטיקה בעירוב מאגרים היסטוריים.
    """
    raw = pd.read_csv(
        CSV_PATH,
        encoding="windows-1255",
        header=0,
        dtype=str,
        keep_default_na=False,
        engine="python",
        on_bad_lines="skip",
    )
    anomalies = {
        "tooFewCols": 0, "badNumbers": 0, "dupNumbers": 0, "badDate": 0,
        "dupDraw": 0, "badStrong": 0, "preModern": 0, "total": int(len(raw)),
    }

    # עמודות לפי מיקום: 0=הגרלה, 1=תאריך, 2..7=מספרים, 8=מספר חזק
    ids = pd.to_numeric(raw.iloc[:, 0], errors="coerce")
    date_str = raw.iloc[:, 1].astype(str).str.strip()
    nums_df = raw.iloc[:, 2:8].apply(pd.to_numeric, errors="coerce")
    strong = pd.to_numeric(raw.iloc[:, 8], errors="coerce")

    # פענוח תאריך dd/mm/yyyy
    dt = pd.to_datetime(date_str, format="%d/%m/%Y", errors="coerce")

    df = pd.DataFrame({"id": ids, "dt": dt, "strong": strong})
    df[["n1", "n2", "n3", "n4", "n5", "n6"]] = nums_df.values
    num_cols = ["n1", "n2", "n3", "n4", "n5", "n6"]

    # תקינות בסיסית
    ok_id = df["id"].notna()
    ok_nums = nums_df.notna().all(axis=1) & (nums_df >= 1).all(axis=1)
    ok_date = df["dt"].notna()
    anomalies["badNumbers"] = int((~(ok_id & ok_nums)).sum())
    anomalies["badDate"] = int((ok_id & ok_nums & ~ok_date).sum())

    df = df[ok_id & ok_nums & ok_date].copy()
    df["maxNum"] = df[num_cols].max(axis=1)

    # זיהוי תאריך המעבר: ההגרלה המאוחרת ביותר שהכילה מספר מעל 37 (עידן ישן)
    old_era = df[df["maxNum"] > MAIN_MAX]
    transition_dt = old_era["dt"].max() if len(old_era) else None

    # שמירת העידן המודרני בלבד
    modern_mask = (df["maxNum"] <= MAIN_MAX)
    if transition_dt is not None:
        modern_mask &= df["dt"] > transition_dt
    anomalies["preModern"] = int((~modern_mask).sum())

    # --- מאגר חיפוש: כל ההגרלות (שני העידנים) לצורך חיפוש לפי מספר הגרלה ---
    modern_ids = set(df.loc[modern_mask, "id"].astype(int))
    all_draws = []
    for _, r in df.sort_values(["dt", "id"]).drop_duplicates(subset="id", keep="first").iterrows():
        s = r["strong"]
        all_draws.append({
            "id": int(r["id"]),
            "date": fmt_date(r["dt"].to_pydatetime()),
            "n": sorted(int(r[c]) for c in num_cols),
            "s": int(s) if pd.notna(s) else None,  # הערך ההיסטורי בפועל (גם אם >7 בעידן הישן)
            "era": "modern" if int(r["id"]) in modern_ids else "legacy",
        })

    df = df[modern_mask].copy()

    # ניקוי כפילויות מספר-הגרלה
    before = len(df)
    df = df.drop_duplicates(subset="id", keep="first")
    anomalies["dupDraw"] = int(before - len(df))

    # מספר חזק תקין (1..7); אחרת None — שומרים את ההגרלה לניתוח 6 המספרים
    bad_strong = ~df["strong"].between(STRONG_MIN, STRONG_MAX)
    anomalies["badStrong"] = int(bad_strong.sum())

    # מיון מהישן לחדש
    df = df.sort_values(["dt", "id"]).reset_index(drop=True)

    rows = []
    for _, r in df.iterrows():
        s = r["strong"]
        strong_val = int(s) if (STRONG_MIN <= s <= STRONG_MAX) else None
        nums = sorted(int(r[c]) for c in num_cols)
        rows.append({
            "id": int(r["id"]),
            "dt": r["dt"].to_pydatetime().replace(tzinfo=timezone.utc),
            "date": fmt_date(r["dt"].to_pydatetime()),
            "nums": nums,
            "strong": strong_val,
        })

    transition = fmt_date(transition_dt.to_pydatetime()) if transition_dt is not None else None
    return rows, anomalies, transition, all_draws


# ---------- שלב 2+3: ניתוח ויצירת תיק ----------
def freq_in_window(rows, predicate):
    counts = [0] * (MAIN_MAX + 1)
    draws = 0
    for r in rows:
        if predicate and not predicate(r):
            continue
        draws += 1
        for n in r["nums"]:
            counts[n] += 1
    return counts, draws


def normalize(values: dict) -> dict:
    vals = list(values.values())
    lo, hi = min(vals), max(vals)
    sp = (hi - lo) or 1
    return {k: (v - lo) / sp for k, v in values.items()}


def build():
    rows, anomalies, transition, all_draws = parse_csv()
    if len(rows) < 50:
        raise RuntimeError(f"מעט מדי הגרלות תקינות ({len(rows)}) — בדוק את הקובץ")

    # כתיבת מאגר החיפוש (כל ההגרלות) לקובץ נפרד
    draws_out = os.path.join(ROOT, "src", "data", "draws.json")
    os.makedirs(os.path.dirname(draws_out), exist_ok=True)
    with open(draws_out, "w", encoding="utf-8") as f:
        json.dump({"count": len(all_draws), "draws": all_draws}, f, ensure_ascii=False, separators=(",", ":"))

    last = rows[-1]
    last_date = last["dt"]
    one_year_ago = last_date.replace(year=last_date.year - 1)
    five_years_ago = last_date.replace(year=last_date.year - 5)

    # --- תדירות לפי חלונות ---
    all_counts, all_draws = freq_in_window(rows, None)
    y1_counts, y1_draws = freq_in_window(rows, lambda r: r["dt"] >= one_year_ago)
    y5_counts, y5_draws = freq_in_window(rows, lambda r: r["dt"] >= five_years_ago)
    expected_share = PICK / MAIN_MAX

    # --- פערים / overdue ---
    total_draws = len(rows)
    last_seen = [-1] * (MAIN_MAX + 1)
    for idx, r in enumerate(rows):
        for n in r["nums"]:
            last_seen[n] = idx
    gaps = [{"n": n, "gap": (total_draws if last_seen[n] == -1 else total_draws - 1 - last_seen[n])} for n in NUMBERS]
    gap_of = {g["n"]: g["gap"] for g in gaps}

    # --- מספר חזק ---
    strong_counts = [0] * (STRONG_MAX + 1)
    strong_draws = 0
    strong_last_seen = [-1] * (STRONG_MAX + 1)
    for idx, r in enumerate(rows):
        if r["strong"] is not None:
            strong_counts[r["strong"]] += 1
            strong_draws += 1
            strong_last_seen[r["strong"]] = idx

    # --- סכום ---
    sums = [sum(r["nums"]) for r in rows]
    sum_mean = sum(sums) / len(sums)
    sum_std = sample_std(sums)
    sum_min, sum_max = min(sums), max(sums)
    bin_size = 10
    hist_start = (sum_min // bin_size) * bin_size
    hist_end = math.ceil(sum_max / bin_size) * bin_size
    sum_hist = []
    b = hist_start
    while b < hist_end:
        c = sum(1 for s in sums if b <= s < b + bin_size)
        sum_hist.append({"bin": f"{b}-{b + bin_size - 1}", "lo": b, "hi": b + bin_size - 1,
                         "count": c, "pct": c / len(sums)})
        b += bin_size
    sum_sweet = {"lo": js_round(sum_mean - sum_std), "hi": js_round(sum_mean + sum_std)}

    # --- זוגי/אי-זוגי ---
    eo_dist = [0] * (PICK + 1)
    for r in rows:
        evens = sum(1 for n in r["nums"] if n % 2 == 0)
        eo_dist[evens] += 1
    even_odd = [{"evens": e, "odds": PICK - e, "count": c, "pct": c / len(rows),
                 "label": f"{e} זוגי / {PICK - e} אי-זוגי"} for e, c in enumerate(eo_dist)]
    even_odd.sort(key=lambda s: -s["count"])
    acc, sweet_splits = 0.0, []
    for s in even_odd:
        sweet_splits.append(s)
        acc += s["pct"]
        if acc >= 0.8:
            break
    sweet_even_counts = {s["evens"] for s in sweet_splits}

    # --- עוקבים ---
    consec_pair = {}
    consec_per_draw = [0] * PICK
    draws_with_consec = 0
    for r in rows:
        pairs = 0
        ns = r["nums"]
        for i in range(len(ns) - 1):
            if ns[i + 1] == ns[i] + 1:
                pairs += 1
                key = f"{ns[i]}-{ns[i + 1]}"
                consec_pair[key] = consec_pair.get(key, 0) + 1
        if pairs > 0:
            draws_with_consec += 1
        consec_per_draw[min(pairs, PICK - 1)] += 1
    top_consec = sorted(({"pair": k, "count": v} for k, v in consec_pair.items()),
                        key=lambda x: -x["count"])[:12]

    # --- שרשרת מרקוב ---
    T = [[0] * (MAIN_MAX + 1) for _ in range(MAIN_MAX + 1)]
    y_as_current = [0] * (MAIN_MAX + 1)
    for i in range(len(rows) - 1):
        cur, nxt = rows[i]["nums"], rows[i + 1]["nums"]
        for y in cur:
            y_as_current[y] += 1
            for x in nxt:
                T[y][x] += 1
    last_nums = last["nums"]
    transition_score = []
    for x in NUMBERS:
        s, used = 0.0, 0
        for y in last_nums:
            if y_as_current[y] > 0:
                s += T[y][x] / y_as_current[y]
                used += 1
        transition_score.append({"n": x, "score": (s / used if used else 0.0)})
    trans_rank = sorted(transition_score, key=lambda t: -t["score"])
    score_of = {t["n"]: t["score"] for t in transition_score}

    # --- אותות מנורמלים ---
    hot_raw = {n: 0.5 * all_counts[n] / all_draws + 0.5 * (y1_counts[n] / y1_draws if y1_draws else 0)
               for n in NUMBERS}
    hot_n = normalize(hot_raw)
    overdue_n = normalize({g["n"]: g["gap"] for g in gaps})
    trans_n = normalize({t["n"]: t["score"] for t in transition_score})

    strategies = [
        {"key": "balanced", "name": "איזון מלא",
         "desc": "משקל שווה לכל השיטות — מספרים חמים, מספרים באיחור ומגמת ההגרלה האחרונה",
         "w": {"hot": 0.34, "over": 0.33, "trans": 0.33}},
        {"key": "hot", "name": "המספרים החמים",
         "desc": "דגש על המספרים שיוצאים הכי הרבה לאורך ההיסטוריה",
         "w": {"hot": 0.60, "over": 0.15, "trans": 0.25}},
        {"key": "overdue", "name": "מספרים באיחור",
         "desc": "דגש על מספרים שלא יצאו הרבה זמן (“בפיגור”) וצפויים לחזור",
         "w": {"hot": 0.15, "over": 0.60, "trans": 0.25}},
        {"key": "markov", "name": "לפי ההגרלה האחרונה",
         "desc": "מספרים שנוטים סטטיסטית להופיע מיד אחרי תוצאת ההגרלה הקודמת",
         "w": {"hot": 0.20, "over": 0.20, "trans": 0.60}},
        {"key": "contrarian", "name": "איזון נגדי",
         "desc": "דגש מוגבר על מספרים נשכחים — בחירה שונה מהמספרים הפופולריים",
         "w": {"hot": 0.25, "over": 0.45, "trans": 0.30}},
    ]

    hot_set = {o[0] for o in sorted(hot_raw.items(), key=lambda kv: -kv[1])[:10]}
    cold_set = {g["n"] for g in sorted(gaps, key=lambda g: -g["gap"])[:10]}
    trans_set = {t["n"] for t in trans_rank[:10]}

    def tag_of(n):
        if n in trans_set:
            return "trans"
        if n in cold_set:
            return "cold"
        if n in hot_set:
            return "hot"
        return "neutral"

    rng = mulberry32(0x10770 ^ last["id"])

    def weight_for(w):
        return {n: w["hot"] * hot_n[n] + w["over"] * overdue_n[n] + w["trans"] * trans_n[n] + 0.02
                for n in NUMBERS}

    def weighted_pick(weights, exclude):
        pool = [n for n in NUMBERS if n not in exclude]
        total = sum(weights[n] for n in pool)
        r = rng() * total
        for n in pool:
            r -= weights[n]
            if r <= 0:
                return n
        return pool[-1]

    def sum_ok(s):
        return sum_sweet["lo"] <= s <= sum_sweet["hi"]

    def even_ok(combo):
        return sum(1 for n in combo if n % 2 == 0) in sweet_even_counts

    def generate_ticket(weights):
        for _ in range(4000):
            chosen = set()
            while len(chosen) < PICK:
                chosen.add(weighted_pick(weights, chosen))
            combo = sorted(chosen)
            if sum_ok(sum(combo)) and even_ok(combo):
                return combo
        chosen = set()
        while len(chosen) < PICK:
            chosen.add(weighted_pick(weights, chosen))
        return sorted(chosen)

    strong_gap = {n: (total_draws if strong_last_seen[n] == -1 else total_draws - 1 - strong_last_seen[n])
                  for n in range(STRONG_MIN, STRONG_MAX + 1)}
    strong_score = sorted(
        ({"n": n, "v": 0.6 * (strong_counts[n] / (strong_draws or 1)) + 0.4 * (strong_gap[n] / total_draws)}
         for n in range(STRONG_MIN, STRONG_MAX + 1)),
        key=lambda x: -x["v"],
    )

    tickets = []
    seen = set()
    for i, st in enumerate(strategies):
        weights = weight_for(st["w"])
        combo = None
        for _ in range(50):
            combo = generate_ticket(weights)
            sig = "-".join(map(str, combo))
            if sig not in seen:
                seen.add(sig)
                break
        strong_pick = strong_score[i % len(strong_score)]["n"]
        evens = sum(1 for n in combo if n % 2 == 0)
        tickets.append({
            "id": i + 1, "strategy": st["key"], "strategyName": st["name"], "strategyDesc": st["desc"],
            "numbers": combo, "strong": strong_pick, "sum": sum(combo),
            "evens": evens, "odds": PICK - evens,
            "tags": [{"n": n, "tag": tag_of(n)} for n in combo],
        })

    # ---------- הרכבת הפלט ----------
    number_table = [{
        "n": n, "all": all_counts[n], "allPct": all_counts[n] / all_draws,
        "y1": y1_counts[n], "y5": y5_counts[n], "gap": gap_of[n],
        "transScore": score_of[n], "hot": n in hot_set, "cold": n in cold_set,
    } for n in NUMBERS]

    hottest = sorted(number_table, key=lambda d: -d["all"])[:8]
    coldest = sorted(number_table, key=lambda d: d["all"])[:8]
    most_overdue = sorted(gaps, key=lambda g: -g["gap"])[:8]

    years = (last_date - rows[0]["dt"]).total_seconds() / (365.25 * 24 * 3600)

    return {
        "meta": {
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "source": os.path.basename(CSV_PATH),
            "totalDraws": total_draws,
            "firstDraw": {"id": rows[0]["id"], "date": rows[0]["date"]},
            "lastDraw": {"id": last["id"], "date": last["date"], "numbers": last["nums"], "strong": last["strong"]},
            "years": years,
            "formatTransition": transition,
            "anomalies": anomalies,
            "expectedShare": expected_share,
            "engine": "python-pandas",
        },
        "numberTable": number_table,
        "frequency": {
            "allTime": {"draws": all_draws, "counts": [all_counts[n] for n in NUMBERS]},
            "last1y": {"draws": y1_draws, "counts": [y1_counts[n] for n in NUMBERS]},
            "last5y": {"draws": y5_draws, "counts": [y5_counts[n] for n in NUMBERS]},
            "hottest": hottest, "coldest": coldest,
        },
        "overdue": {"gaps": gaps, "mostOverdue": most_overdue},
        "strong": {
            "counts": [{"n": n, "count": strong_counts[n], "pct": strong_counts[n] / (strong_draws or 1),
                        "gap": strong_gap[n]} for n in range(STRONG_MIN, STRONG_MAX + 1)],
            "draws": strong_draws,
        },
        "sumStats": {"mean": sum_mean, "std": sum_std, "min": sum_min, "max": sum_max,
                     "hist": sum_hist, "sweet": sum_sweet},
        "evenOdd": {"dist": even_odd, "sweetSplits": sweet_splits},
        "consecutive": {"drawsWithConsec": draws_with_consec, "pctWithConsec": draws_with_consec / len(rows),
                        "perDraw": consec_per_draw, "topPairs": top_consec},
        "markov": {"lastNumbers": last_nums, "topNext": trans_rank[:10]},
        "tickets": tickets,
    }


# ---------- ריצה ----------
def main():
    out = build()
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    m = out["meta"]
    print("✓ ניתוח הושלם בהצלחה (Python / Pandas)")
    print(f"  הגרלות תקינות: {m['totalDraws']}")
    print(f"  טווח (פורמט מודרני 6/37): {m['firstDraw']['date']} (#{m['firstDraw']['id']})  →  "
          f"{m['lastDraw']['date']} (#{m['lastDraw']['id']})")
    print(f"  שנים מכוסות: {m['years']:.1f}  | תאריך מעבר פורמט: {m['formatTransition']}")
    print(f"  אנומליות: {json.dumps(m['anomalies'], ensure_ascii=False)}")
    print(f"  הגרלה אחרונה: {m['lastDraw']['numbers']} + חזק {m['lastDraw']['strong']}")
    print(f"  ממוצע סכום: {out['sumStats']['mean']:.1f} (±{out['sumStats']['std']:.1f}), "
          f"נקודת מתיקה {out['sumStats']['sweet']['lo']}-{out['sumStats']['sweet']['hi']}")
    print(f"  ספליט מוביל: {out['evenOdd']['dist'][0]['label']} "
          f"({out['evenOdd']['dist'][0]['pct'] * 100:.1f}%)")
    print("  5 הצירופים שנוצרו:")
    for t in out["tickets"]:
        nums = " ".join(f"{x:02d}" for x in t["numbers"])
        print(f"   #{t['id']} [{t['strategyName']}] {nums} | חזק {t['strong']} | "
              f"סכום {t['sum']} | {t['evens']}ז/{t['odds']}א")
    print(f"  נכתב אל: {os.path.relpath(OUT_PATH, ROOT)}")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:  # noqa: BLE001
        print(f"✗ שגיאה בניתוח: {e}")
        raise
