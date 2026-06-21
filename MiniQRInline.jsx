/**
 * MiniQRInline — inline QR derived deterministically from a FlipZone access code string.
 * The QR is ALWAYS a visual encoding of the same code — never an independent credential.
 */
import React from 'react';

export default function MiniQRInline({ code, size = 80 }) {
  if (!code) return null;
  const cells = 9;
  const hash = Array.from(code).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const grid = Array.from({ length: cells * cells }, (_, i) => {
    const x = i % cells;
    const y = Math.floor(i / cells);
    const inCorner = (x < 3 && y < 3) || (x >= cells - 3 && y < 3) || (x < 3 && y >= cells - 3);
    if (inCorner) return true;
    return ((hash * (i + 7) * (x + 3) * (y + 5)) % 17) < 9;
  });
  const cellSize = size / cells;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ borderRadius: 6, display: 'block' }}>
      <rect width={size} height={size} fill="white" rx={6} />
      {grid.map((filled, i) => {
        const x = (i % cells) * cellSize;
        const y = Math.floor(i / cells) * cellSize;
        return filled ? (
          <rect key={i} x={x + 0.5} y={y + 0.5} width={cellSize - 1} height={cellSize - 1} rx={1} fill="#071407" />
        ) : null;
      })}
    </svg>
  );
}