/**
 * TransactionFlow — Seller setup wizard (Steps 1–3 only)
 * STEP 1: Describe item
 * STEP 2: Select verified receiver
 * STEP 3: Select locker / facility
 * STEP 4: Confirm & create transaction → redirect to SellerTransactionView
 *
 * Payment, code generation, deposit, and release all happen in SellerTransactionView.
 * Nothing in this wizard generates or touches access credentials.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Search, User, Lock, CheckCircle,
  MapPin, Package, ShieldCheck, Clock, AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FZMonogram from '../components/FZMonogram';
import { base44 } from '@/api/base44Client';
import { createTransaction } from '@/lib/fzEngine';

// ── Static demo data ────────────────────────────────────────────────────────

const LOCKERS = [
  { id: 'B-07', zone: 'Eastside Plaza',    size: 'Medium', distance: '0.4 mi' },
  { id: 'A-04', zone: 'North Hub Station', size: 'Large',  distance: '1.2 mi' },
  { id: 'C-02', zone: 'Downtown Zone',     size: 'Small',  distance: '1.8 mi' },
  { id: 'B-08', zone: 'Westfield Center',  size: 'Medium', distance: '2.3 mi' },
];

const BUYERS = [
  { id: 'b1', name: 'Alex K.',  handle: '@alexk',  trust: 96, pickups: 14 },
  { id: 'b2', name: 'Sam T.',   handle: '@samt',   trust: 88, pickups: 7  },
  { id: 'b3', name: 'Dana R.',  handle: '@danar',  trust: 99, pickups: 31 },
];

// ── Step phases ─────────────────────────────────────────────────────────────

const PHASES = [
  { id: 'order',    label: 'Order'    },
  { id: 'receiver', label: 'Receiver' },
  { id: 'locker',   label: 'Locker'   },
  { id: 'confirm',  label: 'Confirm'  },
];

// ── Sub-components ───────────────────────────────────────────────────────────

function ConfirmRow({ label, value, highlight }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-hz-green/8 last:border-0">
      <span className="text-hz-green-deep/45 text-xs font-semibold uppercase tracking-wide">{label}</span>
      <span className={`font-bold text-sm ${highlight ? 'text-hz-green' : 'text-hz-green-deep'}`}>{value}</span>
    </div>
  );
}

// STEP 1 — Item description
function PhaseOrder({ state, setState }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-hz-green-deep font-black text-xl mb-1">New Order</h2>
        <p className="text-hz-green-deep/50 text-sm">Describe what you're handing off to the receiver.</p>
      </div>
      <div>
        <label className="text-hz-green-deep/60 text-xs font-bold uppercase tracking-wider mb-1.5 block">
          Item Description
        </label>
        <input
          value={state.itemDescription}
          onChange={e => setState(s => ({ ...s, itemDescription: e.target.value }))}
          placeholder="e.g. Sneakers size 11, Electronics bundle…"
          className="w-full bg-white rounded-2xl px-4 py-3.5 text-hz-green-deep font-medium text-sm border border-hz-green/20 hz-card-shadow outline-none focus:border-hz-green"
        />
      </div>
      <div className="bg-hz-green/8 border border-hz-green/20 rounded-2xl px-4 py-3 flex items-start gap-2.5">
        <Clock size={13} className="text-hz-green mt-0.5 flex-shrink-0" strokeWidth={2.5} />
        <div>
          <p className="text-hz-green-dark font-black text-xs">12-Hour Pickup Window</p>
          <p className="text-hz-green-deep/55 text-xs mt-0.5 leading-relaxed">
            Buyer has <strong>12 hours</strong> to retrieve the item after you release access. A $2.00 late fee
            applies at 12 h, then every 4 h until pickup, force pickup, or resolution.
          </p>
        </div>
      </div>
    </div>
  );
}

// STEP 2 — Select receiver
function PhaseReceiver({ state, setState }) {
  const [search, setSearch] = useState('');
  const filtered = BUYERS.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.handle.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-hz-green-deep font-black text-xl mb-1">Select Receiver</h2>
        <p className="text-hz-green-deep/50 text-sm">Choose a verified buyer from your network.</p>
      </div>
      <div className="relative">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-hz-green-deep/30" strokeWidth={2.5} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or handle…"
          className="w-full bg-white rounded-2xl pl-10 pr-4 py-3.5 text-hz-green-deep font-medium text-sm border border-hz-green/20 hz-card-shadow outline-none focus:border-hz-green"
        />
      </div>
      <div className="space-y-2">
        {filtered.map(b => (
          <button
            key={b.id}
            onClick={() => setState(s => ({ ...s, buyer: b }))}
            className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
              state.buyer?.id === b.id ? 'bg-hz-green/8 border-hz-green' : 'bg-white border-hz-green/15'
            } hz-card-shadow`}
          >
            <div className="w-10 h-10 rounded-xl hz-green-surface flex items-center justify-center flex-shrink-0">
              <span className="text-hz-green-deep font-black text-sm">{b.name[0]}</span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-hz-green-deep font-bold text-sm">
                {b.name} <span className="text-hz-green-deep/40 font-medium">{b.handle}</span>
              </p>
              <p className="text-hz-green-deep/40 text-xs">{b.pickups} pickups · Trust {b.trust}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className={state.buyer?.id === b.id ? 'text-hz-green' : 'text-hz-green/30'} strokeWidth={2.5} />
              {state.buyer?.id === b.id && <CheckCircle size={14} className="text-hz-green" strokeWidth={2.5} />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// STEP 3 — Select locker
function PhaseLocker({ state, setState }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-hz-green-deep font-black text-xl mb-1">Reserve Locker</h2>
        <p className="text-hz-green-deep/50 text-sm">Select an available locker at a facility near you.</p>
      </div>
      <div className="space-y-2.5">
        {LOCKERS.map(l => (
          <button
            key={l.id}
            onClick={() => setState(s => ({ ...s, locker: l }))}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
              state.locker?.id === l.id ? 'bg-hz-green/8 border-hz-green' : 'bg-white border-hz-green/15'
            } hz-card-shadow`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              state.locker?.id === l.id ? 'bg-hz-green text-white' : 'bg-hz-green/10'
            }`}>
              <Lock size={20} className={state.locker?.id === l.id ? 'text-white' : 'text-hz-green'} strokeWidth={2} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-hz-green-deep font-black text-base">{l.id}</p>
              <p className="text-hz-green-deep/50 text-xs flex items-center gap-1">
                <MapPin size={10} strokeWidth={2.5} />{l.zone}
              </p>
              <p className="text-hz-green-deep/35 text-[10px] mt-0.5">{l.size} · {l.distance}</p>
            </div>
            {state.locker?.id === l.id && <CheckCircle size={18} className="text-hz-green flex-shrink-0" strokeWidth={2.5} />}
          </button>
        ))}
      </div>
    </div>
  );
}

// STEP 4 — Confirm & create
function PhaseConfirm({ state }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-hz-green-deep font-black text-xl mb-1">Confirm Order</h2>
        <p className="text-hz-green-deep/50 text-sm">Review details. Confirming creates the transaction and takes you to pay the Drop-Off Fee.</p>
      </div>

      <div className="bg-white rounded-3xl p-5 hz-card-shadow-lg space-y-0.5">
        <ConfirmRow label="Item"         value={state.itemDescription || '—'} />
        <ConfirmRow label="Locker"       value={state.locker?.id ?? '—'} />
        <ConfirmRow label="Facility"     value={state.locker?.zone ?? '—'} />
        <ConfirmRow label="Receiver"     value={state.buyer ? `${state.buyer.name} ${state.buyer.handle}` : '—'} />
        <ConfirmRow label="Pickup Window" value="12 hours (late fees apply after release)" />
        <ConfirmRow label="Drop-Off Fee" value="$4.99 — due on next screen" highlight />
      </div>

      <div className="bg-hz-green-deep rounded-2xl px-4 py-4 space-y-2.5">
        <div className="flex items-center gap-2">
          <ShieldCheck size={15} className="text-hz-neon" strokeWidth={2.5} />
          <span className="text-white font-bold text-sm">What happens next</span>
        </div>
        <div className="space-y-1.5 text-hz-green/55 text-xs leading-relaxed">
          <p>1. Pay the $4.99 Drop-Off Fee to activate the transaction</p>
          <p>2. Your Seller Facility Access Code + Locker Code are generated</p>
          <p>3. Deposit item, upload photo, confirm locker closed</p>
          <p>4. Release buyer access when you're ready — timer starts then</p>
        </div>
      </div>

      <div className="flex items-center gap-2 px-1">
        <AlertCircle size={12} className="text-hz-amber flex-shrink-0" strokeWidth={2.5} />
        <p className="text-hz-green-deep/40 text-xs">
          No access credentials are generated until after payment.
        </p>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function TransactionFlow() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  const [state, setState] = useState({
    itemDescription: '',
    buyer: null,
    locker: null,
  });

  const canAdvance = () => {
    if (phase === 0) return state.itemDescription.trim().length > 0;
    if (phase === 1) return !!state.buyer;
    if (phase === 2) return !!state.locker;
    if (phase === 3) return true; // confirm screen — always advanceable
    return false;
  };

  const advance = async () => {
    if (phase < PHASES.length - 1) {
      setPhase(p => p + 1);
      return;
    }
    // Final step — create transaction then redirect to Seller Portal
    setDone(true);
    setSaving(true);
    try {
      const me = await base44.auth.me();
      const tx = await createTransaction({
        seller_id:        me?.id || 'demo-seller',
        seller_name:      me?.full_name || 'Seller',
        buyer_id:         state.buyer?.id || 'demo-buyer',
        buyer_name:       state.buyer?.name || 'Buyer',
        locker_id:        state.locker?.id,
        locker_number:    state.locker?.id,
        facility_name:    state.locker?.zone,
        item_description: state.itemDescription,
        pickup_window:    '12 hours',
      });
      setTimeout(() => navigate(`/seller/transaction?txId=${tx.id}`), 1800);
    } catch {
      setTimeout(() => navigate('/seller'), 1800);
    } finally {
      setSaving(false);
    }
  };

  const back = () => {
    if (phase === 0) navigate(-1);
    else setPhase(p => p - 1);
  };

  const currentPhase = PHASES[phase];

  if (done) {
    return (
      <div className="min-h-screen bg-hz-cream flex flex-col items-center justify-center px-8 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
          className="w-24 h-24 rounded-3xl bg-hz-green/15 flex items-center justify-center mb-6 hz-glow"
        >
          <ShieldCheck size={44} className="text-hz-green" strokeWidth={2} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-hz-green-deep font-black text-3xl mb-2">Order Created</h2>
          <p className="text-hz-green-deep/55 text-sm mb-3">Taking you to the Seller Portal to pay the Drop-Off Fee…</p>
          {saving && <div className="w-6 h-6 border-4 border-hz-green/20 border-t-hz-green rounded-full animate-spin mx-auto" />}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hz-cream pb-10">
      {/* Header */}
      <div className="hz-green-surface hz-curved-header px-5 pt-12 pb-5">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={back}
            className="w-9 h-9 rounded-xl bg-hz-green-deep/15 flex items-center justify-center flex-shrink-0"
          >
            <ArrowLeft size={17} className="text-hz-green-deep" strokeWidth={2.5} />
          </button>
          <div className="flex-1">
            <h1 className="text-hz-green-deep font-black text-xl hz-text-emboss">{currentPhase.label}</h1>
            <p className="text-hz-green-deep/55 text-xs font-semibold mt-0.5">
              Step {phase + 1} of {PHASES.length} · New Handoff
            </p>
          </div>
          <FZMonogram size={34} />
        </div>

        {/* Progress bar */}
        <div className="flex gap-1">
          {PHASES.map((p, i) => (
            <div key={p.id} className="flex flex-col items-center gap-1 flex-1">
              <div className={`w-full h-1 rounded-full transition-all duration-300 ${
                i < phase ? 'bg-hz-green-deep' : i === phase ? 'bg-hz-green-deep/50' : 'bg-white/25'
              }`} />
              <span className={`text-[8px] font-bold uppercase tracking-wide transition-all ${
                i === phase ? 'text-hz-green-deep' : i < phase ? 'text-hz-green-deep/60' : 'text-white/35'
              }`}>{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Phase content */}
      <div className="px-5 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.18 }}
          >
            {phase === 0 && <PhaseOrder    state={state} setState={setState} />}
            {phase === 1 && <PhaseReceiver state={state} setState={setState} />}
            {phase === 2 && <PhaseLocker   state={state} setState={setState} />}
            {phase === 3 && <PhaseConfirm  state={state} />}
          </motion.div>
        </AnimatePresence>

        <motion.button
          onClick={advance}
          disabled={!canAdvance()}
          className="w-full mt-8 py-4 rounded-2xl font-black text-hz-green-deep text-base hz-green-surface hz-card-shadow active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-35 disabled:pointer-events-none"
        >
          {phase === PHASES.length - 1
            ? <><ShieldCheck size={18} strokeWidth={2.5} />Confirm &amp; Create Transaction</>
            : <>Continue <ArrowRight size={18} strokeWidth={2.5} /></>}
        </motion.button>
      </div>
    </div>
  );
}