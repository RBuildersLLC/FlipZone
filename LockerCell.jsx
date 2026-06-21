import React from 'react';
import { Lock, Unlock, AlertTriangle, Wrench } from 'lucide-react';

const statusConfig = {
  available: {
    bg: 'bg-hz-green/20',
    border: 'border-hz-green',
    icon: Unlock,
    iconColor: 'text-hz-green',
    dot: 'bg-hz-green',
    label: 'Open',
  },
  assigned: {
    bg: 'bg-amber-50',
    border: 'border-hz-amber',
    icon: Lock,
    iconColor: 'text-hz-amber',
    dot: 'bg-hz-amber',
    label: 'Assigned',
  },
  active: {
    bg: 'bg-green-50',
    border: 'border-hz-neon',
    icon: Lock,
    iconColor: 'text-hz-green-dark',
    dot: 'bg-hz-neon',
    label: 'Active',
    neonGlow: true,
  },
  flagged: {
    bg: 'bg-red-50',
    border: 'border-red-400',
    icon: AlertTriangle,
    iconColor: 'text-red-500',
    dot: 'bg-red-500',
    label: 'Flagged',
  },
  maintenance: {
    bg: 'bg-gray-50',
    border: 'border-gray-300',
    icon: Wrench,
    iconColor: 'text-gray-400',
    dot: 'bg-gray-400',
    label: 'Maint.',
  },
};

export default function LockerCell({ locker, onPress }) {
  const cfg = statusConfig[locker.status] || statusConfig.available;
  const Icon = cfg.icon;

  return (
    <button
      onClick={() => onPress?.(locker)}
      className={`relative flex flex-col items-center justify-center rounded-xl border-2 aspect-square p-2
        ${cfg.bg} ${cfg.border} transition-all active:scale-95
        ${cfg.neonGlow ? 'hz-neon-glow' : 'hz-card-shadow'}`}>
      <Icon size={20} className={cfg.iconColor} strokeWidth={2} />
      <span className="text-hz-green-deep font-bold text-[11px] mt-1 leading-none">{locker.locker_number}</span>
      <div className="flex items-center gap-1 mt-1">
        <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        <span className="text-hz-green-deep/60 text-[9px] font-semibold">{cfg.label}</span>
      </div>
    </button>
  );
}