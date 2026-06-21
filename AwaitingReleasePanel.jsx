/**
 * AwaitingReleasePanel — dark-themed "Item Secured — You May Leave" panel
 * Matches the FlipZone collage: dark green bg, neon glow oval RELEASE button, countdown timer
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Clock, User, Zap } from 'lucide-react';

export default function AwaitingReleasePanel({ tx, onRelease, loading }) {
  const points = [
    { icon: Lock,   text: 'Your codes have expired. The locker is locked.' },
    { icon: User,   text: 'The buyer has not been notified yet and cannot access the locker.' },
    { icon: Clock,  text: <>The <span style={{ color: '#39FF14' }} className="font-black">12-hour pickup timer</span> starts when you confirm release.</> },
    { icon: Shield, text: 'Leave the facility when ready, then release buyer access from anywhere.' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl px-5 py-5"
      style={{
        background: 'linear-gradient(160deg, #0d2410 0%, #081508 60%, #050e05 100%)',
        border: '1px solid rgba(57,255,20,0.18)',
        boxShadow: '0 0 40px rgba(57,255,20,0.06)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(57,255,20,0.12)', border: '1px solid rgba(57,255,20,0.25)' }}>
          <Shield size={16} style={{ color: '#39FF14' }} strokeWidth={2.5} />
        </div>
        <span className="font-black text-sm" style={{ color: '#f0fff0' }}>Item Secured — You May Leave</span>
      </div>

      {/* Bullet points */}
      <div className="space-y-2.5 mb-4">
        {points.map(({ icon: Icon, text }, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <Icon size={13} style={{ color: 'rgba(134,239,172,0.5)' }} strokeWidth={2.5} className="mt-0.5 flex-shrink-0" />
            <span className="text-xs leading-relaxed" style={{ color: 'rgba(185,245,185,0.65)' }}>{text}</span>
          </div>
        ))}
      </div>

      {/* RELEASE BUYER ACCESS — neon oval button */}
      <button
        onClick={onRelease}
        disabled={loading}
        className="w-full rounded-full py-4 flex flex-col items-center justify-center gap-0.5 active:scale-[0.97] transition-all disabled:opacity-50"
        style={{
          background: 'linear-gradient(135deg, #39FF14 0%, #22C55E 60%, #16a34a 100%)',
          boxShadow: '0 0 32px rgba(57,255,20,0.7), 0 0 64px rgba(57,255,20,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
          color: '#071407',
        }}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-black/20 border-t-black/60 rounded-full animate-spin" />
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Zap size={16} strokeWidth={3} style={{ color: '#071407' }} />
              <span className="font-black text-sm tracking-[0.08em]">RELEASE BUYER ACCESS</span>
            </div>
            <span className="text-[10px] font-semibold tracking-wide" style={{ color: 'rgba(7,20,7,0.65)' }}>
              Notify Buyer & Generate Access Codes
            </span>
          </>
        )}
      </button>

      {/* Sub-note */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        <Clock size={10} style={{ color: 'rgba(134,239,172,0.35)' }} strokeWidth={2.5} />
        <p className="text-[10px] text-center" style={{ color: 'rgba(134,239,172,0.35)' }}>
          The 12-hour pickup window starts when you tap Release.
        </p>
      </div>
    </motion.div>
  );
}