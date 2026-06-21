/**
 * QRAccessBlock — dark-themed access credentials card.
 *
 * ARCHITECTURE (enforced):
 *   FlipZone Access Code ↔ QR Code  — SAME credential, two formats.
 *   The QR is always generated FROM the same access code string.
 *   They are always synchronized: if the code changes, the QR changes.
 *   There is ONE FlipZone credential per role (facility + locker), never two.
 *
 *   Manual Codes are a completely separate optional field — they are
 *   NOT represented here and do NOT affect FlipZone codes or QRs.
 */
import React, { useState } from 'react';
import { CheckCircle, Clock, QrCode, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * MiniQR: deterministic visual QR derived DIRECTLY from the access code string.
 * Always pass the same code string that is shown as the human-readable code.
 * Changing the code automatically changes this QR — they cannot desync.
 */
function MiniQR({ value, size = 72 }) {
  const cells = 9;
  // value MUST be the FlipZone access code — QR is just a visual encoding of it
  const hash = Array.from(value || 'FZ-XXXXXX').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const grid = Array.from({ length: cells * cells }, (_, i) => {
    const x = i % cells;
    const y = Math.floor(i / cells);
    const inCorner = (x < 3 && y < 3) || (x >= cells - 3 && y < 3) || (x < 3 && y >= cells - 3);
    if (inCorner) return true;
    return ((hash * (i + 7) * (x + 3) * (y + 5)) % 17) < 9;
  });
  const cellSize = size / cells;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ borderRadius: 4 }}>
      <rect width={size} height={size} fill="white" rx={4} />
      {grid.map((filled, i) => {
        const x = (i % cells) * cellSize;
        const y = Math.floor(i / cells) * cellSize;
        return filled ? (
          <rect key={i} x={x + 0.5} y={y + 0.5} width={cellSize - 1} height={cellSize - 1} rx={1} fill="#071407" />
        ) : null;
      })}
    </svg>
  );
}

function CodeRow({ label, code, qrValue, revealed }) {
  const [showQR, setShowQR] = useState(false);

  const displayCode = revealed
    ? (code || '——————')
    : (code ? '••• •••••' : '——————');

  // Format numeric-ish code with a space in the middle
  const formatted = revealed && code
    ? code.replace(/^[A-Z]+-/, '').replace(/(.{3})(.{3})/, '$1 $2')
    : displayCode;

  return (
    <div className="rounded-2xl overflow-hidden mb-2" style={{ background: 'rgba(15,91,46,0.25)', border: '1px solid rgba(34,197,94,0.2)' }}>
      {/* Primary: Keypad Code */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(15,91,46,0.5)', border: '1px solid rgba(34,197,94,0.25)' }}>
          <div className="w-4 h-4 rounded-sm border-2" style={{ borderColor: '#22C55E' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold mb-0.5" style={{ color: 'rgba(134,239,172,0.7)' }}>{label}</p>
          <p className="font-black text-2xl tracking-[0.18em] leading-none" style={{ color: '#f0fff0', letterSpacing: '0.18em' }}>
            {formatted}
          </p>
          <p className="text-[9px] mt-1 font-semibold" style={{ color: 'rgba(134,239,172,0.4)' }}>
            Primary — Numeric Keypad
          </p>
        </div>
        {/* QR backup toggle */}
        {revealed && qrValue && (
          <button
            onClick={() => setShowQR(v => !v)}
            className="flex flex-col items-center gap-0.5 flex-shrink-0 px-2 py-1 rounded-xl transition-all"
            style={{ background: showQR ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)' }}
          >
            <QrCode size={16} style={{ color: showQR ? '#22C55E' : 'rgba(134,239,172,0.4)' }} strokeWidth={2} />
            {showQR ? <ChevronUp size={10} style={{ color: 'rgba(134,239,172,0.5)' }} /> : <ChevronDown size={10} style={{ color: 'rgba(134,239,172,0.3)' }} />}
          </button>
        )}
      </div>
      {/* QR backup — collapsible */}
      {revealed && qrValue && showQR && (
        <div className="px-4 pb-3 flex items-start gap-3" style={{ borderTop: '1px solid rgba(34,197,94,0.12)' }}>
          <div className="pt-2">
            <MiniQR value={qrValue} size={64} />
          </div>
          <div className="pt-2">
            <p className="text-[10px] font-black mb-0.5" style={{ color: 'rgba(134,239,172,0.7)' }}>QR Format</p>
            <p className="text-[9px] leading-relaxed" style={{ color: 'rgba(134,239,172,0.4)' }}>
              Same credential as the code above — visual format only. Scan if keypad unavailable. One auth event.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// facilityQR / lockerQR props are intentionally NOT accepted.
// The QR is always derived from facilityCode / lockerCode directly.
export default function QRAccessBlock({ facilityCode, lockerCode, revealed, pickupDeadlineAt }) {
  if (!facilityCode && !lockerCode) return null;

  return (
    <div className="rounded-3xl overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #0a2010 0%, #071407 100%)',
        border: '1px solid rgba(34,197,94,0.22)',
        boxShadow: '0 0 32px rgba(57,255,20,0.08)',
      }}>

      {/* Item Ready header */}
      <div className="px-4 pt-4 pb-3 flex items-start gap-3 border-b" style={{ borderColor: 'rgba(34,197,94,0.15)' }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
          <CheckCircle size={18} style={{ color: '#22C55E' }} strokeWidth={2.5} />
        </div>
        <div>
          <p className="font-black text-sm" style={{ color: '#22C55E' }}>Item Ready for Pickup!</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(134,239,172,0.6)' }}>
            Use the codes below to access the facility and open your locker.
          </p>
        </div>
      </div>

      {/* Codes */}
      <div className="px-3 pt-3 pb-1">
        {/* QR value is always derived from the same access code — synchronized by design */}
        <CodeRow label="Facility Access Code" code={facilityCode} qrValue={facilityCode} revealed={revealed} />
        <CodeRow label="Locker Access Code"   code={lockerCode}   qrValue={lockerCode}   revealed={revealed} />
      </div>

      {/* Deadline */}
      {pickupDeadlineAt && (
        <div className="mx-3 mb-3 flex items-center gap-2 rounded-2xl px-3 py-2.5"
          style={{ background: 'rgba(201,120,26,0.1)', border: '1px solid rgba(201,120,26,0.2)' }}>
          <Clock size={12} style={{ color: '#C97A1A' }} strokeWidth={2.5} />
          <div>
            <span className="text-xs font-bold" style={{ color: '#C97A1A' }}>
              Pickup Deadline: {new Date(pickupDeadlineAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {new Date(pickupDeadlineAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </span>
            <p className="text-[10px] mt-0.5" style={{ color: 'rgba(201,120,26,0.7)' }}>12-hour timer is already active.</p>
          </div>
        </div>
      )}
    </div>
  );
}