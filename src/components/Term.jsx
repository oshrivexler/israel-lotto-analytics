import React from 'react';

/**
 * מונח עם הסבר קופץ (Tooltip) — לכל מילה מקצועית.
 * נגיש: ניתן למיקוד במקלדת, מוצג ב-hover וב-focus, וגם כ-title.
 */
export default function Term({ children, def }) {
  return (
    <span className="group relative inline-flex cursor-help items-center" tabIndex={0} aria-label={`${children}: ${def}`}>
      <span
        className="border-b border-dashed border-faint/70 decoration-dashed underline-offset-2"
        title={def}
      >
        {children}
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full right-1/2 z-50 mb-1.5 w-56 translate-x-1/2 translate-y-1 rounded-lg border border-line bg-panel px-3 py-2 text-[12px] font-normal leading-relaxed text-ink opacity-0 shadow-xl transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus:translate-y-0 group-focus:opacity-100"
      >
        {def}
        <span className="absolute right-1/2 top-full h-2 w-2 -translate-y-1 translate-x-1/2 rotate-45 border-b border-l border-line bg-panel" />
      </span>
    </span>
  );
}
