import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function SwitchRoleButton({ variant = 'light' }) {
  const isDark = variant === 'dark';

  const handlePress = () => {
    window.location.href = '/role-select';
  };

  return (
    <button
      type="button"
      onClick={handlePress}
      className={[
        'flex items-center gap-1.5 px-3 py-1.5 rounded-xl',
        'transition-all active:scale-95 select-none',
        'border',
        isDark
          ? 'bg-white/12 border-white/20 text-white'
          : 'bg-white/30 border-hz-green-deep/20 text-hz-green-deep',
      ].join(' ')}
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        cursor: 'pointer',
      }}
    >
      <RefreshCw size={11} strokeWidth={2.5} />
      Switch Role
    </button>
  );
}