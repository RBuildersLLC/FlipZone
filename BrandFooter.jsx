/**
 * BrandFooter — R-Builders LLC ownership attribution footer.
 * theme="dark"  (default) — dark/green gradient screens (splash, PIN)
 * theme="light"           — light background screens (subscription, account)
 * variant="trademark"     — splash/pin/onboarding: stacked legal attribution block
 * variant="legal"         — about/account/subscription: © copyright line
 */
export default function BrandFooter({ variant = 'trademark', theme = 'dark', className = '' }) {
  const color = theme === 'light' ? 'rgba(13,42,13,0.35)' : 'rgba(255,255,255,0.38)';

  if (variant === 'legal') {
    return (
      <p
        className={`text-center text-[10px] font-medium tracking-wide ${className}`}
        style={{ color, lineHeight: 1.4 }}
      >
        © 2026 R-Builders LLC. All rights reserved.
      </p>
    );
  }

  // Stacked trademark attribution block
  const lines = ['FlipZone™ is a trademark', 'of R-Builders LLC'];

  return (
    <div
      className={`flex flex-col items-center mx-auto ${className}`}
      style={{ maxWidth: 220, gap: 1 }}
    >
      {lines.map((line, i) => (
        <span
          key={i}
          className="text-center text-[10px] font-medium tracking-wide block"
          style={{ color, lineHeight: 1.5 }}
        >
          {line}
        </span>
      ))}
    </div>
  );
}