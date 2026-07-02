import React from 'react';

/** לוגו האתר — תג אדום עם האות ל' לבנה וחץ-מגמה זהב עולה (זהה לאייקון האפליקציה). */
export default function Logo({ size = 40, className = '' }) {
  const id = React.useId();
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} role="img" aria-label="לוטומטריקס">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d8324a" />
          <stop offset="1" stopColor="#a8123a" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="24" fill={`url(#${id})`} />
      {/* חץ-מגמה עולה */}
      <polyline points="49,69 59,59 66,63 78,42" fill="none" stroke="#e8b23a" strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="72,40 79,41 78,49" fill="none" stroke="#e8b23a" strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="59" cy="59" r="2.3" fill="#ffffff" />
      <circle cx="66" cy="63" r="2.3" fill="#ffffff" />
      {/* האות ל' */}
      <text x="38" y="68" textAnchor="middle" fontFamily="Arial, Heebo, sans-serif" fontSize="49" fontWeight="700" fill="#ffffff">ל</text>
    </svg>
  );
}
