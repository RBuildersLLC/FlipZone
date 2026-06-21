import React from 'react';
import { Bell } from 'lucide-react';
import FZMonogram from './FZMonogram';
import TierBadge from './TierBadge';

export default function CurvedHeader({ title, subtitle, tier, showNotification = true, rightElement }) {
  return (
    <div className="hz-green-surface hz-curved-header px-5 pt-12 pb-10 relative overflow-hidden">


      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          {tier && <TierBadge tier={tier} size="sm" />}
          <h1 className="text-hz-green-deep font-black text-2xl mt-1 hz-text-emboss leading-tight">{title}</h1>
          {subtitle && <p className="text-hz-green-deep/70 text-sm font-medium mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {rightElement}
          {showNotification && (
            <button className="w-9 h-9 rounded-full bg-hz-green-deep/15 flex items-center justify-center">
              <Bell size={18} className="text-hz-green-deep" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}