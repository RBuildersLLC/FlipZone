/**
 * EmergencyButton — 🚨 EMERGENCY ASSISTANCE
 * Accidental-use protection: user must hold for 3 seconds to trigger modal.
 * Opens the device's native phone dialer (tel: link) — NO in-app calling.
 * Logs a DialerLog record + EmergencyIncident record on confirm.
 *
 * Props:
 *   tx        — current transaction object (optional)
 *   userRole  — 'seller' | 'buyer' | 'operator' | 'admin'
 *   contacts  — optional array of { label, number } to show multiple dial options.
 *               Defaults to [{ label: '911 Emergency', number: '911' }]
 */
import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const HOLD_DURATION = 3000;
const TICK = 50;

const DEFAULT_CONTACTS = [
  { label: '911 Emergency', number: '911' },
];

async function logDialerAction({ tx, userRole, contact, action }) {
  const userId = tx?.[`${userRole}_id`] || 'unknown';
  await base44.entities.DialerLog.create({
    user_id: userId,
    user_role: userRole,
    facility_id: tx?.locker_id || tx?.facility_id || '',
    facility_name: tx?.facility_name || '',
    transaction_id: tx?.id || '',
    locker_number: tx?.locker_number || '',
    contact_label: contact.label,
    contact_number: contact.number,
    timestamp: new Date().toISOString(),
    action,
  });
}

async function logEmergencyIncident({ tx, userRole }) {
  await base44.entities.EmergencyIncident.create({
    transaction_id: tx?.id || 'unknown',
    user_id: tx?.[`${userRole}_id`] || 'unknown',
    user_role: userRole,
    facility_name: tx?.facility_name || '',
    locker_number: tx?.locker_number || '',
    timestamp: new Date().toISOString(),
    cctv_zone: 'PENDING_REVIEW',
    status: 'emergency_logged',
  });
}

export default function EmergencyButton({ tx, userRole, contacts = DEFAULT_CONTACTS }) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [showModal, setShowModal] = useState(false);
  const [logging, setLogging] = useState(false);
  const [logged, setLogged] = useState(false);

  const intervalRef = useRef(null);
  const elapsedRef = useRef(0);

  const startHold = useCallback(() => {
    elapsedRef.current = 0;
    setHolding(true);
    setProgress(0);
    setCountdown(3);

    intervalRef.current = setInterval(() => {
      elapsedRef.current += TICK;
      const p = Math.min(elapsedRef.current / HOLD_DURATION, 1);
      setProgress(p);
      const remaining = Math.ceil((HOLD_DURATION - elapsedRef.current) / 1000);
      setCountdown(remaining > 0 ? remaining : 0);

      if (elapsedRef.current >= HOLD_DURATION) {
        clearInterval(intervalRef.current);
        setHolding(false);
        setProgress(0);
        setShowModal(true);
      }
    }, TICK);
  }, []);

  const cancelHold = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setHolding(false);
    setProgress(0);
    setCountdown(3);
  }, []);

  const handleDial = async (contact) => {
    setLogging(true);
    // Log both incident (for 911 contacts) and dialer action
    const is911 = contact.number === '911';
    await Promise.all([
      logDialerAction({ tx, userRole, contact, action: 'dialer_opened' }),
      is911 ? logEmergencyIncident({ tx, userRole }) : Promise.resolve(),
    ]);
    setLogging(false);
    setLogged(true);
    setShowModal(false);
    // Open native device dialer — user must confirm call themselves
    window.location.href = `tel:${contact.number}`;
  };

  const handleCancel = async () => {
    setShowModal(false);
  };

  return (
    <>
      {/* Hold-to-activate button */}
      <div className="flex flex-col items-center gap-2 pt-2 pb-1">
        <div className="relative select-none">
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              boxShadow: holding
                ? '0 0 32px rgba(239,68,68,0.7), 0 0 64px rgba(239,68,68,0.3)'
                : logged
                  ? '0 0 16px rgba(153,27,27,0.5)'
                  : '0 0 20px rgba(220,38,38,0.4), 0 4px 12px rgba(0,0,0,0.25)',
              transition: 'box-shadow 0.2s',
              borderRadius: 9999,
            }}
          />
          <button
            onMouseDown={startHold}
            onMouseUp={cancelHold}
            onMouseLeave={cancelHold}
            onTouchStart={e => { e.preventDefault(); startHold(); }}
            onTouchEnd={cancelHold}
            onTouchCancel={cancelHold}
            className="relative rounded-full py-4 px-8 flex flex-col items-center justify-center gap-0.5 transition-transform"
            style={{
              background: holding
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                : logged
                  ? 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)'
                  : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              border: '1px solid rgba(239,68,68,0.45)',
              transform: holding ? 'scale(0.97)' : 'scale(1)',
              minWidth: 220,
            }}
          >
            {holding && (
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ borderRadius: 9999, overflow: 'visible' }}
              >
                <rect x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)"
                  rx="9999" ry="9999" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
                <rect x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)"
                  rx="9999" ry="9999" fill="none" stroke="#fff" strokeWidth="3"
                  strokeLinecap="round" strokeDasharray={`${progress * 100}% 100%`}
                  style={{ transition: 'stroke-dasharray 0.05s linear' }} />
              </svg>
            )}
            <div className="flex items-center gap-2 relative z-10">
              <span className="text-base leading-none">🚨</span>
              <span className="font-black text-sm tracking-[0.06em] text-white">EMERGENCY ASSISTANCE</span>
            </div>
            <span className="text-[10px] font-semibold text-red-200/80 tracking-wide relative z-10">
              {holding
                ? `${countdown}...`
                : logged
                  ? 'Incident logged — Hold again to re-dial'
                  : 'Hold for 3 Seconds'}
            </span>
          </button>
        </div>

        {holding && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-[11px] font-bold tracking-widest uppercase"
          >
            Keep holding…
          </motion.p>
        )}
      </div>

      {/* Confirmation modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/85"
              onClick={handleCancel}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 24 }}
              transition={{ type: 'spring', stiffness: 340, damping: 30 }}
              className="fixed inset-x-5 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto rounded-3xl px-6 pt-7 pb-6"
              style={{
                background: 'linear-gradient(160deg, #1c0a0a 0%, #140505 100%)',
                border: '1px solid rgba(239,68,68,0.3)',
                boxShadow: '0 0 60px rgba(220,38,38,0.2), 0 8px 40px rgba(0,0,0,0.8)',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex flex-col items-center mb-5">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
                  style={{ background: 'rgba(220,38,38,0.15)', border: '1.5px solid rgba(239,68,68,0.35)', boxShadow: '0 0 28px rgba(220,38,38,0.3)' }}>
                  <Phone size={28} className="text-red-400" strokeWidth={2} />
                </div>
                <h2 className="font-black text-xl text-white text-center">Emergency Assistance</h2>
                <p className="text-red-200/50 text-xs text-center mt-1.5 leading-relaxed">
                  Select a contact to open your device dialer.<br />
                  <span className="font-bold text-red-200/70">FlipZone does not place calls — you confirm on your device.</span>
                </p>
              </div>

              {/* Contact options */}
              <div className="space-y-2 mb-5">
                {contacts.map((contact) => (
                  <button
                    key={contact.number}
                    onClick={() => handleDial(contact)}
                    disabled={logging}
                    className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl font-black text-sm active:scale-[0.97] transition-all disabled:opacity-50"
                    style={{
                      background: contact.number === '911'
                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                        : 'rgba(239,68,68,0.15)',
                      color: '#fff',
                      border: contact.number === '911' ? 'none' : '1px solid rgba(239,68,68,0.3)',
                      boxShadow: contact.number === '911' ? '0 0 20px rgba(239,68,68,0.45)' : 'none',
                      letterSpacing: '0.04em',
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      {logging
                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <Phone size={15} strokeWidth={2.5} />}
                      <div className="text-left">
                        <p className="font-black text-sm leading-tight">{contact.label}</p>
                        <p className="font-semibold text-[11px] opacity-70">{contact.number}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="opacity-60" strokeWidth={2.5} />
                  </button>
                ))}
              </div>

              <p className="text-red-200/30 text-[10px] text-center mb-4 leading-relaxed">
                A call action log will be recorded with your user ID, role, and timestamp.
              </p>

              <button
                onClick={handleCancel}
                disabled={logging}
                className="w-full font-bold text-sm py-3.5 rounded-full flex items-center justify-center gap-2 active:scale-[0.97] transition-all"
                style={{ background: 'transparent', border: '1.5px solid rgba(239,68,68,0.25)', color: 'rgba(255,200,200,0.5)', letterSpacing: '0.06em' }}
              >
                <X size={14} strokeWidth={2.5} />Cancel
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}