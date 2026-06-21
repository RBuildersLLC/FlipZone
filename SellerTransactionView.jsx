/**
 * SellerTransactionView — Full seller chain-of-custody flow
 * Covers: fee payment → code generation → item drop → photo → locker close
 * Then: late fee monitoring, force pickup option
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, DollarSign, Key, Camera, Lock, CheckCircle,
  AlertTriangle, RotateCcw, Phone, ShieldOff, Clock,
  MapPin, Package, Zap, ShieldCheck, QrCode, Copy, Share2
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  paySellerFee, generateSellerCodes, uploadSellerPhoto,
  confirmSellerLockerClosed, releaseBuyerAccess, initiateForcePickup,
  payRetrievalFee, completeForcePickup, chargeLateFee,
  confirmSellerFacilityAccessed, confirmSellerLockerOpened
} from '@/lib/fzEngine';
import FZMonogram from '../components/FZMonogram';
import ReleaseConfirmDialog from '../components/ReleaseConfirmDialog';
import AwaitingReleasePanel from '../components/AwaitingReleasePanel';
import EmergencyButton from '../components/EmergencyButton';
import ManualCodeReceiver from '../components/ManualCodeReceiver';
import MiniQRInline from '../components/MiniQRInline';
import LiveCameraCapture from '../components/LiveCameraCapture';

// ── helpers ────────────────────────────────────────────────────────────────
function maskCode(code) {
  if (!code) return '——————';
  const parts = code.split('-');
  return parts.map((p, i) => i === parts.length - 1 ? p.slice(0, 2) + '****' : p).join('-');
}

function CodeBlock({ label, code, revealed }) {
  return (
    <div className="bg-hz-green-deep rounded-2xl px-4 py-3 flex items-center justify-between">
      <div>
        <p className="text-hz-green/50 text-[10px] font-bold uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-white font-black text-xl tracking-widest">{revealed ? code : maskCode(code)}</p>
      </div>
      <Key size={18} className="text-hz-green/40" strokeWidth={2} />
    </div>
  );
}

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

// ── Main Component ─────────────────────────────────────────────────────────
export default function SellerTransactionView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const txId = searchParams.get('txId');

  const [tx, setTx] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [codesRevealed, setCodesRevealed] = useState(false);
  const [facilityConfirmed, setFacilityConfirmed] = useState(false);
  const [forceMode, setForceMode] = useState(false);
  const [showReleaseDialog, setShowReleaseDialog] = useState(false);
  const [releaseLoading, setReleaseLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      const me = await base44.auth.me();
      setUser(me);
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
        <p className="text-hz-green-deep/50 text-sm">Create a new transaction from the Seller Hub.</p>
        <button onClick={() => navigate('/seller/transactions')} className="bg-hz-green-deep text-white font-black text-sm px-6 py-3 rounded-2xl active:scale-95 transition-all">
          New Transaction
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

  const ctx = { seller_id: tx.seller_id, locker_id: tx.locker_id, locker_number: tx.locker_number };

  const STATUS_LABELS = {
    initiated: 'Awaiting Fee Payment',
    seller_paid: 'Fee Paid — Generate Codes',
    seller_codes_issued: 'Codes Issued — Drop Off Item',
    awaiting_release: 'Item Secured — Release When Ready',
    item_dropped: 'Buyer Released — Awaiting Pickup',
    buyer_notified: 'Buyer Notified',
    buyer_paid: 'Buyer Paid',
    buyer_codes_issued: 'Buyer Has Codes',
    buyer_accessed: 'Buyer Accessed Locker',
    completed: 'Transaction Complete',
    late: 'BUYER LATE',
    force_pickup_initiated: 'Force Pickup — Retrieval Codes Issued',
    force_pickup_complete: 'Force Pickup Complete',
    disputed: 'Disputed',
    frozen: 'FROZEN — Dispute Active',
    cancelled: 'Cancelled',
  };

  const isLate = tx.status === 'late';
  const isFrozen = tx.status === 'frozen';
  const isComplete = ['completed', 'force_pickup_complete'].includes(tx.status);

  const isAwaitingRelease = tx.status === 'awaiting_release';
  const headerStyle = isAwaitingRelease
    ? { background: 'linear-gradient(160deg, #071407 0%, #050e05 100%)' }
    : undefined;

  // Step progress for collage-style header
  const STEPS = [
    { label: 'Fee Paid',      done: tx.seller_drop_fee_paid },
    { label: 'Codes Issued',  done: !!tx.seller_facility_code },
    { label: 'Item Secured',  done: tx.seller_codes_expired },
    { label: 'Release',       done: ['item_dropped','buyer_notified','buyer_paid','buyer_codes_issued','buyer_accessed','completed','late'].includes(tx.status), active: isAwaitingRelease },
    { label: 'Buyer Pickup',  done: ['buyer_accessed','completed'].includes(tx.status) },
  ];

  return (
    <div className={isAwaitingRelease ? 'min-h-screen pb-10' : 'min-h-screen bg-hz-cream pb-10'} style={isAwaitingRelease ? { background: '#050e05' } : undefined}>
      {/* Header */}
      <div className={`hz-curved-header px-5 pt-12 pb-5 ${!isAwaitingRelease ? 'hz-green-surface' : ''}`} style={headerStyle}>
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate('/seller')} className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: isAwaitingRelease ? 'rgba(34,197,94,0.12)' : 'rgba(13,42,13,0.15)' }}>
            <ArrowLeft size={17} style={{ color: isAwaitingRelease ? '#22C55E' : '#0D2A0D' }} strokeWidth={2.5} />
          </button>
          <div className="flex-1">
            <h1 className="font-black text-xl" style={{ color: isAwaitingRelease ? '#f0fff0' : '#0D2A0D' }}>Seller Portal</h1>
            <p className="text-xs" style={{ color: isAwaitingRelease ? 'rgba(134,239,172,0.5)' : 'rgba(13,42,13,0.55)' }}>
              Locker {tx.locker_number} · {tx.facility_name}
            </p>
          </div>
          <FZMonogram size={36} />
        </div>

        {/* Transaction ID + status badge */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold" style={{ color: isAwaitingRelease ? 'rgba(134,239,172,0.6)' : 'rgba(13,42,13,0.5)' }}>
            Transaction #{tx.id?.slice(-6).toUpperCase()}
          </span>
          <div className={`rounded-full px-3 py-1 ${isLate || isFrozen ? 'bg-hz-amber/20' : isAwaitingRelease ? '' : 'bg-hz-green-deep/20'}`}
            style={isAwaitingRelease && !isLate && !isFrozen ? { background: 'rgba(201,120,26,0.2)', border: '1px solid rgba(201,120,26,0.35)' } : undefined}>
            <span className={`font-black text-[10px] tracking-widest ${isLate || isFrozen ? 'text-hz-amber' : isAwaitingRelease ? '' : 'text-hz-green-deep'}`}
              style={isAwaitingRelease && !isLate && !isFrozen ? { color: '#C97A1A' } : undefined}>
              {isAwaitingRelease ? 'AWAITING_RELEASE' : (STATUS_LABELS[tx.status] || tx.status).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Step progress bar — shown when awaiting_release */}
        {isAwaitingRelease && (
          <div className="flex items-center gap-1 mt-1">
            {STEPS.map((step, i) => (
              <React.Fragment key={step.label}>
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black"
                    style={{
                      background: step.done ? '#22C55E' : step.active ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.08)',
                      border: step.active ? '1.5px solid #22C55E' : step.done ? 'none' : '1.5px solid rgba(255,255,255,0.15)',
                      color: step.done ? '#071407' : step.active ? '#22C55E' : 'rgba(255,255,255,0.3)',
                    }}>
                    {step.done ? '✓' : i + 1}
                  </div>
                  <span className="text-[8px] font-bold leading-tight text-center w-10" style={{ color: step.done || step.active ? 'rgba(134,239,172,0.7)' : 'rgba(255,255,255,0.2)' }}>
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-[1.5px] mb-3 rounded-full" style={{ background: step.done ? '#22C55E' : 'rgba(255,255,255,0.08)' }} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Status badge (non-awaiting states) */}
        {!isAwaitingRelease && (
          <div className={`rounded-2xl px-4 py-2.5 flex items-center gap-2 ${isLate || isFrozen ? 'bg-hz-amber/20' : 'bg-hz-green-deep/20'}`}>
            {isLate || isFrozen
              ? <AlertTriangle size={14} className="text-hz-amber" strokeWidth={2.5} />
              : <ShieldCheck size={14} className="text-hz-green-deep" strokeWidth={2.5} />}
            <span className={`font-black text-xs tracking-wider ${isLate || isFrozen ? 'text-hz-amber' : 'text-hz-green-deep'}`}>
              {STATUS_LABELS[tx.status] || tx.status}
            </span>
          </div>
        )}
      </div>

      <div className="px-5 py-5 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm font-semibold">{error}</div>
        )}

        {/* Item summary */}
        <div className="rounded-2xl p-4 hz-card-shadow" style={{ background: isAwaitingRelease ? 'rgba(15,40,15,0.8)' : 'white', border: isAwaitingRelease ? '1px solid rgba(34,197,94,0.15)' : undefined }}>
          <div className="flex items-center gap-2 mb-2">
            <Package size={14} className="text-hz-green" strokeWidth={2.5} />
            <span className="font-black text-sm" style={{ color: isAwaitingRelease ? '#f0fff0' : '#0D2A0D' }}>Order Details</span>
          </div>
          <p className="text-sm" style={{ color: isAwaitingRelease ? 'rgba(185,245,185,0.6)' : 'rgba(13,42,13,0.7)' }}>{tx.item_description}</p>
          {tx.transaction_value && <p className="text-xs mt-1" style={{ color: isAwaitingRelease ? 'rgba(134,239,172,0.4)' : 'rgba(13,42,13,0.45)' }}>Declared Value: ${tx.transaction_value}</p>}
          <div className="flex items-center gap-1 mt-1">
            <MapPin size={10} style={{ color: isAwaitingRelease ? 'rgba(134,239,172,0.3)' : 'rgba(13,42,13,0.35)' }} strokeWidth={2.5} />
            <p className="text-xs" style={{ color: isAwaitingRelease ? 'rgba(134,239,172,0.3)' : 'rgba(13,42,13,0.35)' }}>{tx.locker_number} · {tx.facility_name}</p>
          </div>
        </div>

        {/* STEP 1 — Pay seller fee */}
        <FeeButton
          label="Pay Drop-Off Fee"
          amount="4.99"
          paid={tx.seller_drop_fee_paid}
          loading={loading && tx.status === 'initiated'}
          onClick={() => act(() => paySellerFee(tx.id, ctx))}
        />

        {/* STEP 2 — Generate seller codes */}
        {tx.seller_drop_fee_paid && (
          <div className="space-y-3">
            <p className="text-[10px] font-black text-hz-green-deep/40 uppercase tracking-widest">Your Access Codes</p>
            {tx.seller_facility_code && tx.seller_locker_code ? (
              <>
                {/* Facility Access Code — NOT shared with buyer */}
                <div className="bg-hz-green-deep rounded-2xl px-4 py-3 space-y-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-hz-green/50 text-[10px] font-bold uppercase tracking-wider">Seller Facility Access Code</p>
                    <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-hz-amber/20 text-hz-amber tracking-wider">DO NOT SHARE</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-white font-black text-xl tracking-widest">
                      {codesRevealed && !tx.seller_codes_expired ? tx.seller_facility_code : maskCode(tx.seller_facility_code)}
                    </p>
                    <Key size={18} className="text-hz-green/40" strokeWidth={2} />
                  </div>
                  <p className="text-hz-green/30 text-[9px]">Your entry code only · Expires after locker close</p>
                </div>

                {/* Locker Code — shareable with buyer + QR */}
                <div className="bg-hz-green-deep rounded-2xl px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-hz-green/50 text-[10px] font-bold uppercase tracking-wider">Locker Code</p>
                    <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-hz-green/20 text-hz-neon tracking-wider">SHARE WITH BUYER</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-white font-black text-xl tracking-widest">
                      {codesRevealed && !tx.seller_codes_expired ? tx.seller_locker_code : maskCode(tx.seller_locker_code)}
                    </p>
                    <Key size={18} className="text-hz-green/40" strokeWidth={2} />
                  </div>
                  {/* QR — synced to locker code */}
                  {codesRevealed && !tx.seller_codes_expired && (
                    <div className="flex items-start gap-3 pt-2 border-t border-white/10">
                      <MiniQRInline code={tx.seller_locker_code} size={64} />
                      <div className="flex-1 pt-1">
                        <p className="text-hz-neon/70 text-[9px] font-black mb-0.5">FlipZone QR Code</p>
                        <p className="text-white/30 text-[8px] leading-relaxed">Same credential as Locker Code above — visual format only. Share QR or code with buyer.</p>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => navigator.clipboard?.writeText(tx.seller_locker_code)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-hz-green/15 text-hz-green text-[9px] font-bold"
                          >
                            <Copy size={9} strokeWidth={2.5} />Copy
                          </button>
                          <button
                            onClick={() => navigator.share?.({ title: 'Locker Code', text: `Locker Code: ${tx.seller_locker_code}` })}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-hz-green/15 text-hz-green text-[9px] font-bold"
                          >
                            <Share2 size={9} strokeWidth={2.5} />Share
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  <p className="text-hz-green/30 text-[9px]">Connected to Locker {tx.locker_number} · {tx.facility_name}</p>
                </div>

                {tx.seller_codes_expired ? (
                  <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2.5">
                    <ShieldOff size={13} className="text-gray-400" strokeWidth={2.5} />
                    <span className="text-gray-500 text-xs font-bold">Codes expired after locker close ✓</span>
                  </div>
                ) : (
                  <button onClick={() => setCodesRevealed(r => !r)} className="text-xs text-hz-green font-bold underline">
                    {codesRevealed ? 'Hide codes' : 'Tap to reveal codes'}
                  </button>
                )}

                {/* Manual Code — always visible, read-only */}
                <ManualCodeReceiver manualCodePackage={tx.manual_code_package || null} />
              </>
            ) : (
              <button
                onClick={() => act(() => generateSellerCodes(tx.id, ctx))}
                disabled={loading}
                className="w-full bg-hz-green-deep text-white font-black text-sm py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-50"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                  <><Key size={16} strokeWidth={2.5} />Generate My Access Codes</>
                )}
              </button>
            )}
          </div>
        )}

        {/* STEP 2b — Confirm facility entry */}
        {tx.seller_facility_code && !tx.seller_codes_expired && (
          facilityConfirmed ? (
            <div className="flex items-center gap-2.5 bg-hz-green/10 border border-hz-green/20 rounded-2xl px-4 py-3">
              <CheckCircle size={15} className="text-hz-green" strokeWidth={2.5} />
              <span className="text-hz-green-dark font-bold text-sm">Facility entry confirmed ✓</span>
            </div>
          ) : (
            <button
              onClick={async () => {
                await act(() => confirmSellerFacilityAccessed(tx.id, ctx));
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

        {/* STEP 2c — Confirm locker opened */}
        {facilityConfirmed && tx.seller_facility_code && !tx.seller_codes_expired && (
          tx.seller_locker_opened_at ? (
            <div className="flex items-center gap-2.5 bg-hz-green/10 border border-hz-green/20 rounded-2xl px-4 py-3">
              <CheckCircle size={15} className="text-hz-green" strokeWidth={2.5} />
              <span className="text-hz-green-dark font-bold text-sm">Locker opened confirmed ✓</span>
            </div>
          ) : (
            <button
              onClick={() => act(() => confirmSellerLockerOpened(tx.id, ctx))}
              disabled={loading}
              className="w-full bg-white border border-hz-green/25 rounded-2xl py-4 flex items-center justify-center gap-2 font-bold text-hz-green-deep text-sm active:scale-[0.97] transition-all disabled:opacity-50 hz-card-shadow"
            >
              {loading ? <div className="w-4 h-4 border-2 border-hz-green/20 border-t-hz-green rounded-full animate-spin" /> : (
                <><Zap size={16} className="text-hz-green" strokeWidth={2.5} />Confirm Locker Opened</>
              )}
            </button>
          )
        )}

        {/* STEP 3 — Upload item photo */}
        {tx.seller_locker_opened_at && tx.status === 'seller_codes_issued' && !tx.seller_codes_expired && (
          <div className="space-y-3">
            <p className="text-[10px] font-black text-hz-green-deep/40 uppercase tracking-widest">Item Photo</p>
            {tx.seller_item_photo_url ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 bg-hz-green/10 border border-hz-green/20 rounded-2xl px-4 py-3">
                  <CheckCircle size={15} className="text-hz-green" strokeWidth={2.5} />
                  <div className="flex-1">
                    <span className="text-hz-green-dark font-bold text-sm">Deposit photo captured ✓</span>
                    {tx.seller_photo_capture_ts && (
                      <p className="text-hz-green-deep/40 text-[10px] mt-0.5">
                        Captured: {new Date(tx.seller_photo_capture_ts).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <img src={tx.seller_item_photo_url} alt="Deposit" className="w-full h-32 object-cover rounded-2xl border border-hz-green/15" />
              </div>
            ) : (
              <LiveCameraCapture
                label="Take Deposit Photo"
                sublabel="Live camera required — gallery uploads not accepted for deposit verification."
                loading={loading}
                onCapture={({ photo_url, capture_timestamp, upload_timestamp }) =>
                  act(() => uploadSellerPhoto(tx.id, { ...ctx, photo_url, capture_timestamp, upload_timestamp }))
                }
              />
            )}
          </div>
        )}

        {/* STEP 4 — Confirm locker closed */}
        {tx.seller_item_photo_url && tx.seller_locker_opened_at && !tx.seller_codes_expired && (
          <button
            onClick={() => act(() => confirmSellerLockerClosed(tx.id, ctx))}
            disabled={loading}
            className="w-full bg-hz-green-deep text-white font-black text-sm py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-50"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
              <><Lock size={16} strokeWidth={2.5} />Confirm Locker Closed</>
            )}
          </button>
        )}

        {/* STEP 5 — Seller-Controlled Release */}
        {tx.status === 'awaiting_release' && (
          <AwaitingReleasePanel
            tx={tx}
            loading={loading}
            onRelease={() => setShowReleaseDialog(true)}
          />
        )}

        <ReleaseConfirmDialog
          open={showReleaseDialog}
          deadlineAt={tx.pickup_deadline_at}
          loading={releaseLoading}
          onCancel={() => setShowReleaseDialog(false)}
          onConfirm={async () => {
            setReleaseLoading(true);
            setError(null);
            try {
              const result = await releaseBuyerAccess(tx.id, { ...ctx, buyer_id: tx.buyer_id });
              if (result?.tx) setTx(result.tx);
              else if (result) setTx(result);
              else await refresh();
              setShowReleaseDialog(false);
            } catch (e) {
              setError(e.message);
              setShowReleaseDialog(false);
            } finally {
              setReleaseLoading(false);
            }
          }}
        />

        {/* Buyer awaiting panel */}
        {['awaiting_release', 'item_dropped', 'buyer_notified', 'buyer_paid', 'buyer_codes_issued', 'buyer_accessed', 'late'].includes(tx.status) && tx.status !== 'awaiting_release' && (
          <div className="bg-white rounded-2xl p-4 hz-card-shadow border border-hz-amber/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} className="text-hz-amber" strokeWidth={2.5} />
              <span className="text-hz-amber font-black text-sm">Awaiting Buyer Pickup</span>
            </div>
            <p className="text-hz-green-deep/50 text-xs">Buyer: {tx.buyer_name}</p>
            {tx.pickup_deadline_at && (
              <p className="text-hz-green-deep/40 text-xs mt-1">
                Deadline: {new Date(tx.pickup_deadline_at).toLocaleString()}
              </p>
            )}
            <div className="flex gap-2 mt-3">
              <button className="flex-1 flex items-center justify-center gap-1.5 bg-hz-green/10 rounded-xl py-2.5 text-hz-green-dark font-bold text-xs active:scale-95 transition-all">
                <Phone size={13} strokeWidth={2.5} />Contact Buyer
              </button>
              <button
                onClick={() => setForceMode(true)}
                className="flex-1 flex items-center justify-center gap-1.5 bg-hz-amber/10 rounded-xl py-2.5 text-hz-amber font-bold text-xs active:scale-95 transition-all"
              >
                <RotateCcw size={13} strokeWidth={2.5} />Force Pickup
              </button>
            </div>
          </div>
        )}

        {/* Late fee panel */}
        {isLate && (
          <div className="bg-hz-amber/10 border border-hz-amber/30 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-hz-amber" strokeWidth={2.5} />
              <span className="text-hz-amber font-black text-sm">Buyer Is Late</span>
            </div>
            <p className="text-hz-green-deep/60 text-xs">Late fees charged: {tx.late_fee_count}x · Total: ${tx.late_fee_total?.toFixed(2)} · $2.00 at 12h, then every 4h</p>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => act(() => chargeLateFee(tx.id, { buyer_id: tx.buyer_id, seller_id: tx.seller_id, ...ctx, feeNumber: (tx.late_fee_count || 0) + 1, hoursOverdue: 12 + (tx.late_fee_count || 0) * 4 }))}
                disabled={loading}
                className="flex-1 bg-hz-amber text-white font-black text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
              >
                <DollarSign size={12} strokeWidth={2.5} />Charge $2 Late Fee
              </button>
              <button
                onClick={() => setForceMode(true)}
                className="flex-1 bg-hz-green-deep text-white font-black text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <RotateCcw size={12} strokeWidth={2.5} />Force Pickup
              </button>
            </div>
          </div>
        )}

        {/* Force Pickup flow */}
        <AnimatePresence>
          {forceMode && tx.status !== 'force_pickup_initiated' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-center gap-2">
                <ShieldOff size={16} className="text-red-500" strokeWidth={2.5} />
                <span className="text-red-700 font-black text-sm">Initiate Force Pickup</span>
              </div>
              <p className="text-red-600 text-xs leading-relaxed">
                Buyer codes will be <strong>invalidated immediately</strong>. You'll be issued new retrieval codes and charged a $4.99 retrieval fee.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setForceMode(false)} className="flex-1 border border-gray-200 bg-white rounded-xl py-2.5 text-gray-500 font-bold text-xs">Cancel</button>
                <button
                  onClick={() => act(() => initiateForcePickup(tx.id, ctx))}
                  disabled={loading}
                  className="flex-1 bg-red-500 text-white font-black text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirm Force Pickup'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Force pickup — pay retrieval fee */}
        {tx.status === 'force_pickup_initiated' && (
          <div className="space-y-3">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <p className="text-red-700 font-black text-sm mb-1">Force Pickup Active</p>
              <p className="text-red-600 text-xs">Buyer codes revoked. Your new retrieval codes:</p>
            </div>
            <CodeBlock label="Retrieval Facility Code" code={tx.seller_facility_code} revealed={codesRevealed} />
            <CodeBlock label="Retrieval Locker Code"   code={tx.seller_locker_code}   revealed={codesRevealed} />
            <button onClick={() => setCodesRevealed(r => !r)} className="text-xs text-hz-green font-bold underline">{codesRevealed ? 'Hide' : 'Reveal codes'}</button>
            <FeeButton
              label="Pay Retrieval Fee"
              amount="4.99"
              paid={tx.retrieval_fee_paid}
              loading={loading}
              onClick={() => act(() => payRetrievalFee(tx.id, ctx))}
            />
            {tx.retrieval_fee_paid && (
              <button
                onClick={() => act(() => completeForcePickup(tx.id, ctx))}
                disabled={loading}
                className="w-full bg-hz-green-deep text-white font-black text-sm py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-50"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                  <><CheckCircle size={16} strokeWidth={2.5} />Confirm Retrieval Complete</>
                )}
              </button>
            )}
          </div>
        )}

        {/* Frozen / Dispute panel */}
        {isFrozen && (
          <div className="bg-red-50 border border-red-300 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" strokeWidth={2.5} />
              <span className="text-red-700 font-black text-sm">Transaction Frozen — Dispute Active</span>
            </div>
            <p className="text-red-600 text-xs leading-relaxed">
              Locker removed from inventory rotation. You've been issued new investigation codes. Pay the $4.99 retrieval fee to investigate.
            </p>
            <FeeButton label="Pay Investigation Fee" amount="4.99" paid={tx.retrieval_fee_paid} loading={loading} onClick={() => act(() => payRetrievalFee(tx.id, ctx))} />
          </div>
        )}

        {/* Emergency Button — shown on all active (non-terminal) states */}
        {!isComplete && tx.status !== 'cancelled' && (
          <div className="pt-2">
            <EmergencyButton tx={tx} userRole="seller" />
          </div>
        )}

        {/* Complete */}
        {isComplete && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-hz-green/10 border border-hz-green/25 rounded-3xl p-5 text-center">
            <CheckCircle size={32} className="text-hz-green mx-auto mb-2" strokeWidth={2} />
            <p className="text-hz-green-dark font-black text-lg">Transaction Complete</p>
            <p className="text-hz-green-deep/50 text-xs mt-1">Locker returned to inventory · Audit trail sealed</p>
            <button onClick={() => navigate('/seller')} className="mt-4 bg-hz-green-deep text-white font-black text-sm px-6 py-3 rounded-2xl active:scale-95 transition-all">Back to Hub</button>
          </motion.div>
        )}
      </div>
    </div>
  );
}