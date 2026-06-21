/**
 * ReleaseConfirmDialog — fixed-position centered modal for releasing buyer access.
 * Locks body scroll while open. Closes on backdrop tap or X button.
 */
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Bell, Clock, LockOpen, X } from 'lucide-react';

export default function ReleaseConfirmDialog({ open, onConfirm, onCancel, loading }) {
  // Lock body scroll while modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.85)' }}
            onClick={onCancel}
          />

          {/* Modal — truly centered in viewport */}
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 20 }}
              transition={{ type: 'spring', stiffness: 340, damping: 30 }}
              className="w-full max-w-sm rounded-3xl pointer-events-auto flex flex-col"
              style={{
                background: 'linear-gradient(160deg, #0F2910 0%, #091A09 60%, #050E05 100%)',
                border: '1px solid rgba(34,197,94,0.18)',
                boxShadow: '0 0 60px rgba(57,255,20,0.10), 0 8px 40px rgba(0,0,0,0.6)',
                maxHeight: 'calc(100dvh - 48px)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Scrollable content area */}
              <div className="overflow-y-auto px-6 pt-6 pb-2" style={{ overscrollBehavior: 'contain' }}>
                {/* X close button */}
                <div className="flex justify-end mb-2">
                  <button
                    onClick={onCancel}
                    disabled={loading}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 disabled:opacity-50"
                    style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
                  >
                    <X size={14} style={{ color: 'rgba(134,239,172,0.7)' }} strokeWidth={2.5} />
                  </button>
                </div>

                {/* Lock icon + title */}
                <div className="flex flex-col items-center mb-5">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
                    style={{
                      background: 'radial-gradient(circle, #1a4a1a 0%, #0d2a0d 100%)',
                      boxShadow: '0 0 24px rgba(57,255,20,0.25)',
                      border: '1.5px solid rgba(57,255,20,0.3)',
                    }}>
                    <LockOpen size={28} style={{ color: '#39FF14' }} strokeWidth={2} />
                  </div>
                  <h2 className="font-black text-xl text-center" style={{ color: '#f0fff0' }}>
                    Release Buyer Access?
                  </h2>
                  <p className="text-center text-xs mt-1" style={{ color: 'rgba(134,239,172,0.5)' }}>
                    This will notify the buyer and start their pickup window.
                  </p>
                </div>

                {/* Checklist */}
                <div className="space-y-3 mb-5">
                  {[
                    { icon: Key,   text: 'Buyer facility access code will be generated' },
                    { icon: Key,   text: 'Existing locker code will be released to buyer' },
                    { icon: Bell,  text: 'Buyer will be notified immediately' },
                    { icon: Clock, text: '12-hour pickup timer begins now' },
                  ].map(({ icon: Icon, text }, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)' }}>
                        <Icon size={14} style={{ color: '#22C55E' }} strokeWidth={2.5} />
                      </div>
                      <span className="text-sm font-semibold" style={{ color: 'rgba(220,255,220,0.75)' }}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sticky buttons — always visible at bottom */}
              <div className="px-6 pb-6 pt-2 space-y-3 flex-shrink-0">
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="w-full font-black text-sm py-4 rounded-full flex items-center justify-center gap-2.5 active:scale-[0.97] transition-all disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #39FF14 0%, #22C55E 100%)',
                    color: '#071407',
                    boxShadow: '0 0 28px rgba(57,255,20,0.55), 0 4px 16px rgba(57,255,20,0.25)',
                    letterSpacing: '0.06em',
                  }}
                >
                  {loading
                    ? <div className="w-4 h-4 border-2 border-black/20 border-t-black/60 rounded-full animate-spin" />
                    : 'CONFIRM RELEASE'}
                </button>

                <button
                  onClick={onCancel}
                  disabled={loading}
                  className="w-full font-black text-sm py-3.5 rounded-full active:scale-[0.97] transition-all disabled:opacity-50"
                  style={{
                    background: 'transparent',
                    border: '1.5px solid rgba(57,255,20,0.25)',
                    color: 'rgba(220,255,220,0.6)',
                    letterSpacing: '0.06em',
                  }}
                >
                  CANCEL
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}