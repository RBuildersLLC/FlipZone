import React from 'react';

/**
 * FZMonogram — FlipZone™ master brand icon.
 * Uses the official neon-green FZ logo image as the primary mark.
 * Maintains the same API as HZMonogram for drop-in replacement.
 */
export default function FZMonogram({ size = 80, showBackground = true, className = '' }) {
  const radius = Math.round(size * 0.20);

  if (!showBackground) {
    // Render just the image, no wrapping background
    return (
      <img
        src="https://media.base44.com/images/public/6a15d6bd41e221b6ded301d9/6b0108bc9_file_00000000ca8071f88406a34e48a40c2c.png"
        width={size}
        height={size}
        alt="FlipZone™"
        className={className}
        style={{
          display: 'block',
          flexShrink: 0,
          borderRadius: radius,
          objectFit: 'cover',
        }}
      />
    );
  }

  return (
    <img
      src="https://media.base44.com/images/public/6a15d6bd41e221b6ded301d9/6b0108bc9_file_00000000ca8071f88406a34e48a40c2c.png"
      width={size}
      height={size}
      alt="FlipZone™"
      className={className}
      style={{
        display: 'block',
        flexShrink: 0,
        borderRadius: radius,
        objectFit: 'cover',
        boxShadow: `0 0 ${size * 0.3}px rgba(76,175,26,0.45), 0 0 ${size * 0.6}px rgba(76,175,26,0.15)`,
      }}
    />
  );
}