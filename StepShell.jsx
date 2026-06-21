import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function StepShell({ onBack, icon, title, subtitle, badge, children }) {
  return (
    <div className="px-5 pt-6 pb-12">
      {onBack && (
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-gray-400 text-xs font-bold mb-5 active:opacity-60 transition-opacity">
          <ArrowLeft size={14} strokeWidth={2.5} /> Back
        </button>
      )}

      <div className="flex items-start gap-3 mb-6">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, rgba(76,175,26,0.14) 0%, rgba(45,122,13,0.08) 100%)' }}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-hz-green-deep leading-tight">{title}</h2>
            {badge}
          </div>
          <p className="text-gray-400 text-xs leading-relaxed mt-1">{subtitle}</p>
        </div>
      </div>

      {children}
    </div>
  );
}