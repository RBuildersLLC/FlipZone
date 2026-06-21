import React from 'react';
import { Zap, Briefcase, Crown } from 'lucide-react';

const tierConfig = {
  starter: {
    label: 'Starter',
    icon: Zap,
    bg: 'bg-hz-green/20',
    border: 'border-hz-green/40',
    text: 'text-hz-green-deep',
    iconColor: 'text-hz-green',
  },
  business: {
    label: 'Business',
    icon: Briefcase,
    bg: 'bg-hz-green/30',
    border: 'border-hz-green',
    text: 'text-hz-green-deep',
    iconColor: 'text-hz-green-dark',
  },
  enterprise: {
    label: 'Enterprise',
    icon: Crown,
    bg: 'bg-amber-50',
    border: 'border-hz-gold',
    text: 'text-hz-green-deep',
    iconColor: 'text-hz-gold',
  },
};

export default function TierBadge({ tier = 'starter', size = 'md' }) {
  const config = tierConfig[tier] || tierConfig.starter;
  const Icon = config.icon;
  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-[10px] gap-1'
    : 'px-3 py-1 text-xs gap-1.5';

  return (
    <div className={`inline-flex items-center rounded-full border font-bold tracking-wider uppercase
      ${config.bg} ${config.border} ${config.text} ${sizeClasses}`}>
      <Icon size={size === 'sm' ? 10 : 12} className={config.iconColor} strokeWidth={2.5} />
      {config.label}
    </div>
  );
}