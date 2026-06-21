/**
 * BuyerTransactionView — Full buyer chain-of-custody flow
 * Covers: fee payment → code generation → locker open → photo → close → dispute
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, DollarSign, Lock, CheckCircle,
  AlertTriangle, ShieldOff, MapPin, Package, Clock, Zap
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  payBuyerFee, confirmBuyerLockerOpened,
  uploadBuyerPhoto, confirmBuyerLockerClosed, openDispute
} from '@/lib/fzEngine';
import FZMonogram from '../components/FZMonogram';
import QRAccessBlock from '../components/QRAccessBlock';
import EmergencyButton from '../components/EmergencyButton';
import ManualCodeReceiver from '../components/ManualCodeReceiver';
import LiveCameraCapture from '../components/LiveCameraCapture';

function FeeButton({ label, amount, paid, loading, onClick }) {
  return paid ? (
    <div className="flex items-center gap-2.5 bg-hz-green/10 border border-hz-green/20 rounded-2xl px-4 py-3.5">
      <CheckCircle size={16} className="text-hz-green" strokeWidth={2.5} />
      <span className="text-hz-green-dark font-bold text-sm">{label} — Paid ✓</span>
      <span className="ml-auto text-hz-green font-black">${amount}</span>
    </div>
  ) : (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full bg-hz-green text-hz-green-deep font-black text-sm py-4 rounded-2xl flex items-center justify-center gap-2.5 active:scale-[0.97] transition-all disabled:opacity-50 shadow-lg shadow-hz-green/25"
    >
      {loading ? <div className="w-4 h-4 border-2 border-hz-green-deep/30 border-t-hz-green-deep rounded-full animate-spin" /> : (
        <><DollarSign size={16} strokeWidth={2.5} />{label} — ${amount}</>
      )}
    </button>
  );
}

export default function BuyerTransactionView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const txId = searchParams.get('txId');

  const [tx, setTx] = useState(null);
  const [loading, setLoading] = useState(false);
  const [codesRevealed, setCodesRevealed] = useState(false);
  const [facilityConfirmed, setFacilityConfirmed] = useState(false);
  const [disputeMode, setDisputeMode] = useState(false);
  const [disputeNote, setDisputeNote] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      if (txId) {
        const results = await base44.entities.Transaction.filter({ id: txId });
        if (results[0]) setTx(results[0]);
      }
    })();
  }, [txId]);

  const refresh = async () => {
    if (!txId) return;
    const results = await base44.entities.Transaction.filter({ id: txId });
    if (results[0]) setTx(results[0]);
  };

  const act = async (fn) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      if (result?.tx) setTx(result.tx);
      else if (result) setTx(result);
      else await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!txId) {
    return (
      <div className="min-h-screen bg-hz-cream flex flex-col items-center justify-center px-8 text-center gap-4">
        <Package size={40} className="text-hz-green/40" strokeWidth={1.5} />
        <p className="text-hz-green-deep font-black text-lg">No Transaction Selected</p>
        <p className="text-hz-green-deep/50 text-sm">Ask your seller to share the pickup link.</p>
        <button onClick={() => navigate('/buyer')} className="bg-hz-green-deep text-white font-black text-sm px-6 py-3 rounded-2xl active:scale-95 transition-all">
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="min-h-screen bg-hz-cream flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-hz-green/20 border-t-hz-green rounded-full animate-spin" />
      </div>
    );
  }

  const ctx = { buyer_id: tx.buyer_id, seller_id: tx.seller_id, locker_id: tx.locker_id, locker_number: tx.locker_number };
  const codesInvalidated = tx.buyer_codes_invalidated;
  const isFrozen = tx.status === 'frozen';
  const isComplete = tx.status === 'completed';
  const isLate = tx.status === 'late';

  // Buyer can act once seller has released access and buyer credentials have been generated.
  // buyer_codes_issued is now set at release time — no separate generate step required.
  const itemReady = ['item_dropped', 'buyer_notified', 'buyer_paid', 'buyer_codes_issued', 'buyer_accessed', 'late'].includes(tx.status);
  // Credentials are always present once status is buyer_codes_issued or beyond
  const hasCredentials = !!tx.buyer_facility_code && !!tx.buyer_locker_code;

  return (
    <div className="min-h-screen bg-hz-cream pb-10">
      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg, #3A9010 0%, #2D7A0D 55%, #1A5008 100%)' }} className="hz-curved-header px-5 pt-12 pb-5">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate('/buyer')} className="w-9 h-9 rounded-xl bg-hz-green-deep/15 flex items-center justify-center">
            <ArrowLeft size={17} className="text-hz-green-deep" strokeWidth={2.5} />
          </button>
          <div className="flex-1">
            <h1 className="text-hz-green-deep font-black text-xl">Buyer Pickup</h1>
            <p className="text-hz-green-deep/55 text-xs">Locker {tx.locker_number} · {tx.facility_name}</p>
          </div>
          <FZMonogram size={36} />
        </div>
        {/* Status */}
        <div className={`rounded-2xl px-4 py-2.5 flex items-center gap-2 ${isFrozen || codesInvalidated ? 'bg-red-900/30' : isLate ? 'bg-hz-amber/20' : 'bg-hz-green-deep/20'}`}>
          <span className={`font-black text-xs tracking-wider ${isFrozen || codesInvalidated ? 'text-red-300' : isLate ? 'text-hz-amber' : 'text-hz-green-deep'}`}>
            {isFrozen ? '🔒 FROZEN — Dispute Active' : codesInvalidated ? '⛔ Access Revoked' : isLate ? '⚠️ LATE — Fees Accruing' : tx.status.replace(/_/g, ' ').toUpperCase()}
          </span>
        </div>
      </div>

      <div className="px-5 py-5 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm font-semibold">{error}</div>
        )}

        {/* Item info */}
        <div className="bg-white rounded-2xl p-4 hz-card-shadow">
          <div className="flex items-center gap-2 mb-2">
            <Package size={14} className="text-hz-green" strokeWidth={2.5} />
            <span className="text-hz-green-deep font-black text-sm">Item Details</span>
          </div>
          <p className="text-hz-green-deep/70 text-sm">{tx.item_description}</p>
          <div className="flex items-center gap-1 mt-1">
            <MapPin size={10} className="text-hz-green-deep/35" strokeWidth={2.5} />
            <p className="text-hz-green-deep/35 text-xs">{tx.locker_number} · {tx.facility_name}</p>
          </div>
          {tx.seller_item_photo_url && (
            <img src={tx.seller_item_photo_url} alt="Item" className="w-full h-28 object-cover rounded-xl mt-3" />
          )}
        </div>

        {/* Not ready yet */}
        {!itemReady && !isFrozen && (
          tx.status === 'awaiting_release' ? (
            <div className="rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, #0a2010 0%, #071407 100%)',
                border: '1px solid rgba(34,197,94,0.2)',
                boxShadow: '0 0 24px rgba(57,255,20,0.05)',
              }}>
              <div className="flex items-start gap-3 px-4 py-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(201,120,26,0.15)', border: '1px solid rgba(201,120,26,0.3)' }}>
                  <Clock size={18} style={{ color: '#C97A1A' }} strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <p className="font-black text-sm mb-1" style={{ color: '#C97A1A' }}>Item Secured in Locker</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(185,245,185,0.55)' }}>
                    Access codes will arrive shortly once the seller releases access.
                  </p>
                </div>
                {/* Locker thumbnail */}
                <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center"
                  style={{ background: 'rgba(15,91,46,0.3)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <div className="grid grid-cols-2 gap-0.5">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-4 h-4 rounded-sm" style={{ background: i === 1 ? 'rgba(34,197,94,0.5)' : 'rgba(34,197,94,0.15)' }} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-4 pb-3">
                <p className="text-[10px] font-bold text-center" style={{ color: 'rgba(134,239,172,0.35)' }}>
                  No pickup actions available until seller releases access.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-hz-amber/10 border border-hz-amber/25 rounded-2xl px-4 py-3 flex items-center gap-2.5">
              <Clock size={14} className="text-hz-amber" strokeWidth={2.5} />
              <p className="text-hz-amber font-bold text-sm">Waiting for seller to drop off item</p>
            </div>
          )
        )}

        {/* Late fee warning */}
        {isLate && (
          <div className="bg-hz-amber/15 border border-hz-amber/30 rounded-2xl px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={14} className="text-hz-amber" strokeWidth={2.5} />
              <span className="text-hz-amber font-black text-sm">Late Pickup — Fees Accruing</span>
            </div>
            <p className="text-hz-green-deep/60 text-xs">Late fees charged: {tx.late_fee_count}x · Total: ${tx.late_fee_total?.toFixed(2)}</p>
            <p className="text-hz-green-deep/45 text-xs mt-0.5">$2.00 charged at 12h overdue, then every 4 hours until pickup, force pickup, dispute, or cancellation.</p>
          </div>
        )}

        {/* STEP 1 — Pay pickup fee */}
        {itemReady && !codesInvalidated && (
          <FeeButton
            label="Pay Pickup Fee"
            amount="4.99"
            paid={tx.buyer_pickup_fee_paid}
            loading={loading && !tx.buyer_pickup_fee_paid}
            onClick={() => act(() => payBuyerFee(tx.id, ctx))}
          />
        )}

        {/* STEP 2 — Buyer Credential Package (generated at seller release — no separate step needed) */}
        {itemReady && !codesInvalidated && hasCredentials && (
          <div className="space-y-3">
            {/* Credential package header */}
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-black text-hz-green-deep/40 uppercase tracking-widest">Your Access Credentials</p>
              <div className="flex-1 h-px bg-hz-green/10" />
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-hz-green/10 text-hz-green tracking-wider">BUYER ONLY</span>
            </div>
            <QRAccessBlock
              facilityCode={tx.buyer_facility_code}
              lockerCode={tx.buyer_locker_code}
              revealed={codesRevealed}
              pickupDeadlineAt={tx.pickup_deadline_at}
            />
            {/* Manual Code — only shown if operator issued one */}
            {tx.manual_code_package && (
              <ManualCodeReceiver manualCodePackage={tx.manual_code_package} />
            )}
            <button onClick={() => setCodesRevealed(r => !r)} className="text-xs text-hz-green font-bold underline">
              {codesRevealed ? 'Hide codes' : 'Tap to reveal your access codes'}
            </button>
            <p className="text-[9px] text-hz-green-deep/30 leading-relaxed text-center px-2">
              Your facility code is unique to your entry. The locker code and QR correspond to
              your assigned locker for this transaction. QR is a backup if the keypad is unavailable.
            </p>
          </div>
        )}

        {/* STEP 3a — Confirm facility entry */}
        {hasCredentials && !codesInvalidated && tx.status !== 'buyer_accessed' && tx.status !== 'completed' && (
          facilityConfirmed ? (
            <div className="flex items-center gap-2.5 bg-hz-green/10 border border-hz-green/20 rounded-2xl px-4 py-3">
              <CheckCircle size={15} className="text-hz-green" strokeWidth={2.5} />
              <span className="text-hz-green-dark font-bold text-sm">Facility entry confirmed ✓</span>
            </div>
          ) : (
            <button
              onClick={async () => {
                await act(() => base44.entities.AuditLog.create({
                  transaction_id: tx.id, locker_id: tx.locker_id, locker_number: tx.locker_number,
                  user_id: tx.buyer_id, user_role: 'buyer', event_type: 'buyer_facility_accessed',
                  timestamp: new Date().toISOString(), success: true, immutable: true,
                  notes: 'Buyer confirmed facility entry',
                }));
                setFacilityConfirmed(true);
              }}
              disabled={loading}
              className="w-full bg-white border border-hz-green/25 rounded-2xl py-4 flex items-center justify-center gap-2 font-bold text-hz-green-deep text-sm active:scale-[0.97] transition-all disabled:opacity-50 hz-card-shadow"
            >
              {loading ? <div className="w-4 h-4 border-2 border-hz-green/20 border-t-hz-green rounded-full animate-spin" /> : (
                <><MapPin size={16} className="text-hz-green" strokeWidth={2.5} />Confirm Facility Entry</>
              )}
            </button>
          )
        )}

        {/* STEP 3b — Confirm locker opened */}
        {facilityConfirmed && hasCredentials && !codesInvalidated && tx.status !== 'buyer_accessed' && tx.status !== 'completed' && (
          <button
            onClick={() => act(() => confirmBuyerLockerOpened(tx.id, ctx))}
            disabled={loading}
            className="w-full bg-hz-green text-hz-green-deep font-black text-sm py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-50 shadow-lg shadow-hz-green/25"
          >
            {loading ? <div className="w-4 h-4 border-2 border-hz-green-deep/30 border-t-hz-green-deep rounded-full animate-spin" /> : (
              <><Zap size={16} strokeWidth={2.5} />Confirm Locker Opened — Notify Seller</>
            )}
          </button>
        )}

        {/* STEP 4 — Live camera pickup verification photo */}
        {tx.status === 'buyer_accessed' && !tx.buyer_confirm_photo_url && (
          <div className="space-y-2">
            <p className="text-[10px] font-black text-hz-green-deep/40 uppercase tracking-widest">Pickup Verification Photo</p>
            <LiveCameraCapture
              label="Take Pickup Verification Photo"
              sublabel="Live camera required — gallery uploads not accepted for pickup verification."
              loading={loading}
              onCapture={({ photo_url, capture_timestamp, upload_timestamp }) =>
                act(() => uploadBuyerPhoto(tx.id, { ...ctx, photo_url, capture_timestamp, upload_timestamp }))
              }
            />
          </div>
        )}

        {tx.buyer_confirm_photo_url && tx.status === 'buyer_accessed' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 bg-hz-green/10 border border-hz-green/20 rounded-2xl px-4 py-3">
              <CheckCircle size={15} className="text-hz-green" strokeWidth={2.5} />
              <div className="flex-1">
                <span className="text-hz-green-dark font-bold text-sm">Pickup photo captured ✓</span>
                {tx.buyer_photo_capture_ts && (
                  <p className="text-hz-green-deep/40 text-[10px] mt-0.5">
                    Captured: {new Date(tx.buyer_photo_capture_ts).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            <img src={tx.buyer_confirm_photo_url} alt="Pickup" className="w-full h-32 object-cover rounded-2xl border border-hz-green/15" />
          </div>
        )}

        {/* STEP 5 — Confirm locker closed */}
        {tx.buyer_confirm_photo_url && tx.status === 'buyer_accessed' && (
          <button
            onClick={() => act(() => confirmBuyerLockerClosed(tx.id, ctx))}
            disabled={loading}
            className="w-full bg-hz-green-deep text-white font-black text-sm py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-50"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
              <><Lock size={16} strokeWidth={2.5} />Confirm Locker Closed — Return to Inventory</>
            )}
          </button>
        )}

        {/* Dispute option */}
        {itemReady && !isComplete && !isFrozen && !codesInvalidated && (
          <button
            onClick={() => setDisputeMode(d => !d)}
            className="w-full border border-red-200 bg-red-50 text-red-600 font-bold text-sm py-3 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.97] transition-all"
          >
            <AlertTriangle size={14} strokeWidth={2.5} />
            {disputeMode ? 'Cancel Dispute' : 'Open a Dispute'}
          </button>
        )}

        {disputeMode && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3">
            <p className="text-red-700 font-black text-sm">Open Dispute</p>
            <p className="text-red-600 text-xs leading-relaxed">Transaction will freeze. Locker removed from inventory. Seller issued investigation codes and charged $4.99 retrieval fee.</p>
            <textarea
              value={disputeNote}
              onChange={e => setDisputeNote(e.target.value)}
              placeholder="Describe the issue…"
              rows={3}
              className="w-full border border-red-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-red-400 resize-none"
            />
            <div className="flex gap-2">
              <button onClick={() => setDisputeMode(false)} className="flex-1 border border-gray-200 bg-white rounded-xl py-2.5 text-gray-500 font-bold text-xs">Cancel</button>
              <button
                onClick={async () => { await act(() => openDispute(tx.id, { ...ctx, notes: disputeNote })); setDisputeMode(false); }}
                disabled={loading || !disputeNote.trim()}
                className="flex-1 bg-red-500 text-white font-black text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirm Dispute'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Frozen state */}
        {isFrozen && (
          <div className="bg-red-50 border border-red-300 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldOff size={16} className="text-red-500" strokeWidth={2.5} />
              <span className="text-red-700 font-black text-sm">Transaction Frozen</span>
            </div>
            <p className="text-red-600 text-xs leading-relaxed">Your access has been revoked. FlipZone™ support will reach out within 24 hours to resolve the dispute.</p>
          </div>
        )}

        {/* Access revoked (force pickup) */}
        {codesInvalidated && !isFrozen && (
          <div className="bg-gray-100 border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <ShieldOff size={14} className="text-gray-500" strokeWidth={2.5} />
              <span className="text-gray-600 font-black text-sm">Access Revoked</span>
            </div>
            <p className="text-gray-500 text-xs">Seller initiated a force pickup. Your codes are no longer valid. Contact FlipZone™ support.</p>
          </div>
        )}

        {/* Complete */}
        {isComplete && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-hz-green/10 border border-hz-green/25 rounded-3xl p-5 text-center">
            <CheckCircle size={32} className="text-hz-green mx-auto mb-2" strokeWidth={2} />
            <p className="text-hz-green-dark font-black text-lg">Pickup Complete!</p>
            <p className="text-hz-green-deep/50 text-xs mt-1">Locker returned to inventory · Audit trail sealed</p>
            <button onClick={() => navigate('/buyer')} className="mt-4 bg-hz-green-deep text-white font-black text-sm px-6 py-3 rounded-2xl active:scale-95 transition-all">Back to Dashboard</button>
          </motion.div>
        )}

        {/* Emergency Button — shown on all active (non-terminal) states */}
        {!isComplete && tx.status !== 'cancelled' && (
          <div className="pt-2">
            <EmergencyButton tx={tx} userRole="buyer" />
          </div>
        )}

        {/* Anti-loitering notice */}
        {itemReady && !isComplete && !isFrozen && (
          <div className="flex items-start gap-2 px-1">
            <ShieldOff size={11} className="text-hz-green-deep/25 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
            <p className="text-hz-green-deep/30 text-[10px] leading-relaxed">
              You may wait at the facility for pickup. Repeated loitering complaints may trigger a warning, incident log, or account review under FlipZone™ community guidelines.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}