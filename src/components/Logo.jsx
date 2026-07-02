import React from 'react';

/** לוגו האתר — תג אדום עם האות ל' וקו-דופק זהב (זהה לאייקון האפליקציה). */
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
      <polyline points="20,60 42,60 49,46 59,71 66,60 80,60" fill="none" stroke="#e8b23a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <text x="50" y="70" textAnchor="middle" fontFamily="Heebo, Arial, sans-serif" fontSize="60" fontWeight="800" fill="#ffffff">ל</text>
    </svg>
  );
}
