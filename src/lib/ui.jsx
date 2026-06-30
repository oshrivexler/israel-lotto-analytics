// פרימיטיבים משותפים ל-UI + פונקציות עזר
import React from 'react';

export const pad2 = (n) => String(n).padStart(2, '0');
export const pct = (x, d = 1) => `${(x * 100).toFixed(d)}%`;
export const heInt = (n) => new Intl.NumberFormat('he-IL').format(Math.round(n));

// כרטיס מבני (30% מהשטח)
export function Panel({ children, className = '', title, subtitle, icon: Icon, accent, action }) {
  return (
    <section
      className={`relative rounded-xl border border-line bg-panel card-shadow ${className}`}
    >
      {(title || Icon) && (
        <header className="flex items-center justify-between gap-3 border-b border-line-soft px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <span
                className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-panel-2"
                style={accent ? { color: accent } : undefined}
              >
                <Icon size={16} strokeWidth={2.2} />
              </span>
            )}
            <div>
              <h3 className="text-[15px] font-bold leading-tight text-ink">{title}</h3>
              {subtitle && <p className="text-[11px] leading-tight text-faint">{subtitle}</p>}
            </div>
          </div>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

// תווית קטגוריה
export function Tag({ children, color = 'var(--color-muted)', solid }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium tnum"
      style={
        solid
          ? { background: color, color: '#fff' }
          : { color, background: 'color-mix(in srgb, ' + color + ' 12%, transparent)', boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${color} 30%, transparent)` }
      }
    >
      {children}
    </span>
  );
}

// כדור-מספר בסגנון הגרלה
export function Ball({ n, size = 44, variant = 'default', delay = 0 }) {
  const styles = {
    default: { bg: 'var(--color-panel-2)', ring: 'var(--color-line)', txt: 'var(--color-ink)' },
    accent: { bg: 'radial-gradient(circle at 35% 28%, #e23351, #a8123a)', ring: 'rgba(168,18,58,0.35)', txt: '#fff' },
    hot: { bg: 'color-mix(in srgb, var(--color-hot) 14%, #fff)', ring: 'color-mix(in srgb, var(--color-hot) 55%, transparent)', txt: 'var(--color-hot)' },
    cold: { bg: 'color-mix(in srgb, var(--color-cold) 14%, #fff)', ring: 'color-mix(in srgb, var(--color-cold) 55%, transparent)', txt: 'var(--color-cold)' },
    gold: { bg: 'radial-gradient(circle at 35% 28%, #f2c43b, #cc9114)', ring: 'rgba(150,105,15,0.4)', txt: '#3a2a00' },
  }[variant];
  return (
    <span
      className={`tnum grid place-items-center rounded-full font-bold ${variant === 'accent' ? 'glow-accent rise' : 'rise'}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: styles.bg,
        boxShadow: `inset 0 0 0 1.5px ${styles.ring}`,
        color: styles.txt,
        animationDelay: `${delay}ms`,
      }}
    >
      {pad2(n)}
    </span>
  );
}

// KPI יחיד
export function Kpi({ label, value, unit, hint, accent }) {
  return (
    <div className="rounded-xl border border-line bg-panel card-shadow px-4 py-3.5">
      <p className="text-[11px] font-medium text-faint">{label}</p>
      <p className="mt-1 flex items-baseline gap-1">
        <span className="tnum text-2xl font-extrabold tracking-tight" style={accent ? { color: accent } : undefined}>
          {value}
        </span>
        {unit && <span className="text-xs text-muted">{unit}</span>}
      </p>
      {hint && <p className="mt-0.5 text-[11px] text-faint">{hint}</p>}
    </div>
  );
}
