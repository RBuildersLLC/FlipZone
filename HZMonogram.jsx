import React from 'react';

/**
 * HZMonogram — pure SVG, no wrapper div positioning tricks.
 *
 * The entire logo (background + letterforms) lives inside one square SVG
 * on a 100×100 viewBox. The glyph is perfectly optically centered:
 *   - H: x 12–63, y 20–80  → horizontal center ≈ 37.5
 *   - Z: x 50–88, y 20–80  → horizontal center ≈ 69
 *   - Combined HZ: x 12–88 → center = 50  ✓
 *   - Vertical: y 20–80    → center = 50  ✓
 *
 * Using a unique id suffix based on the size prevents gradient/filter
 * collisions when multiple instances appear on the same page.
 */
export default function HZMonogram({ size = 80, showBackground = true, className = '' }) {
  // Use a stable unique key — size is fine since each usage has a distinct size
  const uid = `hz-${size}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        {/* Glossy green background gradient */}
        <radialGradient id={`bg-${uid}`} cx="50%" cy="28%" r="72%">
          <stop offset="0%"   stopColor="#80E040" />
          <stop offset="45%"  stopColor="#4CAF1A" />
          <stop offset="100%" stopColor="#2A7010" />
        </radialGradient>

        {/* Deep embossed letterform gradient */}
        <linearGradient id={`ltr-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#1A4A1A" />
          <stop offset="55%"  stopColor="#0D2A0D" />
          <stop offset="100%" stopColor="#060F06" />
        </linearGradient>

        {/* Drop-shadow filter for letterforms */}
        <filter id={`shadow-${uid}`} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1.2" stdDeviation="0.8"
            floodColor="#000" floodOpacity="0.55" />
          <feDropShadow dx="0" dy="-0.6" stdDeviation="0.4"
            floodColor="#3A9010" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* ── Glossy rounded-square background ── */}
      {showBackground && (
        <>
          <rect x="2" y="2" width="96" height="96" rx="20" ry="20"
            fill={`url(#bg-${uid})`}
            stroke="#3A9010" strokeWidth="1"
          />
          {/* Top-left gloss sheen */}
          <ellipse cx="36" cy="20" rx="28" ry="12"
            fill="white" fillOpacity="0.09" />
        </>
      )}

      {/* ══════════════════════════════════════
          HZ LETTERFORMS
          Bounding box: x 12–88, y 20–80
          Optical center: x=50, y=50  ✓
          ══════════════════════════════════════ */}

      {/* ── H ── */}
      {/* H left vertical  x:12–24  y:20–80 */}
      <rect x="12" y="20" width="12" height="60" rx="2.5"
        fill={`url(#ltr-${uid})`} filter={`url(#shadow-${uid})`} />
      {/* H right vertical x:38–50  y:20–80 */}
      <rect x="38" y="20" width="12" height="60" rx="2.5"
        fill={`url(#ltr-${uid})`} filter={`url(#shadow-${uid})`} />
      {/* H crossbar       x:12–50  y:44–56 */}
      <rect x="12" y="44" width="38" height="12" rx="2"
        fill={`url(#ltr-${uid})`} filter={`url(#shadow-${uid})`} />

      {/* ── Z ── */}
      {/* Z top bar        x:50–88  y:20–32 */}
      <rect x="50" y="20" width="38" height="12" rx="2.5"
        fill={`url(#ltr-${uid})`} filter={`url(#shadow-${uid})`} />
      {/* Z diagonal parallelogram:  top-right → bottom-left */}
      <polygon points="84,32 88,32 54,68 50,68"
        fill={`url(#ltr-${uid})`} filter={`url(#shadow-${uid})`} />
      {/* Z bottom bar     x:50–88  y:68–80 */}
      <rect x="50" y="68" width="38" height="12" rx="2.5"
        fill={`url(#ltr-${uid})`} filter={`url(#shadow-${uid})`} />
    </svg>
  );
}