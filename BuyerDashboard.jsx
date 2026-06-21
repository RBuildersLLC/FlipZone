import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Clock, Star, ChevronRight, Package,
  CheckCircle, Heart, QrCode,
  Lock, RotateCcw, AlertCircle, TrendingUp,
  Fingerprint, Bell, Zap, Music
} from 'lucide-react';
import FZMonogram from '../components/FZMonogram';
import BottomNav from '../components/BottomNav';
import SwitchRoleButton from '../components/SwitchRoleButton';

// ─── Buyer-scoped mock data ────────────────────────────────────────────────

// Pending activation — seller has released the code but buyer hasn't activated yet
const mockPendingActivation = [
  {
    id: 'pa1',
    lockerNum: 'B-07',
    location: 'Eastside Plaza',
    seller: 'Jordan M.',
    sellerId: 's1',
    item: 'Sneakers (sz 11)',
    releasedAt: '2 min ago',
    value: 145,
  },
];

// Active access codes issued to this buyer (post-activation)
const mockActiveCodes = [];

// Lockers currently assigned to this buyer
const mockAssignedLockers = [
  {
    id: 'al1',
    lockerNum: 'A-12',
    location: 'North Hub Station',
    seller: 'Alex T.',
    sellerId: 's2',
    status: 'pending',
    assignedDate: 'May 27',
    item: 'Electronics bundle'
  },
];

// Personal pickup transaction history across all sellers
const mockPickupHistory = [
  { id: 'ph1', lockerNum: 'C-03', location: 'Downtown Zone',    seller: 'Jordan M.',  sellerId: 's1', date: 'May 24', ratingGiven: 5,    status: 'completed', value: 120 },
  { id: 'ph2', lockerNum: 'B-11', location: 'Westfield Center', seller: 'Marco D.',   sellerId: 's3', date: 'May 20', ratingGiven: 4,    status: 'completed', value: 75  },
  { id: 'ph3', lockerNum: 'D-02', location: 'South Terminal',   seller: 'Priya K.',   sellerId: 's4', date: 'May 14', ratingGiven: 5,    status: 'completed', value: 210 },
  { id: 'ph4', lockerNum: 'A-09', location: 'Eastside Plaza',   seller: 'Alex T.',    sellerId: 's2', date: 'May 8',  ratingGiven: null, status: 'disputed',  value: 55  },
];

// Favourite / trusted sellers
const mockTrustedSellers = [
  { id: 's1', name: 'Jordan M.',  trustScore: 98, completedWith: 3, zone: 'Eastside'  },
  { id: 's3', name: 'Marco D.',   trustScore: 94, completedWith: 1, zone: 'Westfield' },
  { id: 's4', name: 'Priya K.',   trustScore: 99, completedWith: 2, zone: 'South'     },
];

// Trusted pickup zones saved by the buyer
const mockTrustedZones = [
  { id: 'z1', name: 'Eastside Plaza',    lockers: 12, distance: '0.4 mi' },
  { id: 'z2', name: 'Downtown Zone',     lockers: 8,  distance: '1.1 mi' },
  { id: 'z3', name: 'Westfield Center',  lockers: 6,  distance: '2.0 mi' },
];

// Recent access log (locker open/release events)
const mockAccessLog = [
  { id: 'lg1', event: 'Locker Opened',    lockerNum: 'C-03', location: 'Downtown Zone',    time: 'May 24, 3:42 PM', success: true  },
  { id: 'lg2', event: 'Locker Released',  lockerNum: 'C-03', location: 'Downtown Zone',    time: 'May 24, 3:43 PM', success: true  },
  { id: 'lg3', event: 'Code Expired',     lockerNum: 'A-09', location: 'Eastside Plaza',   time: 'May 8,  6:15 PM', success: false },
];

// Buyer reputation stats
const buyerRep = { score: 96, totalPickups: 6, completionRate: 83, disputeRate: 1, memberSince: 'Mar 2024', flipScore: 96 };

// ─── Sub-components ────────────────────────────────────────────────────────

function RepBar() {
  return (
    <div className="mt-4 bg-white/20 rounded-2xl px-4 py-3 flex items-center justify-between gap-4">
      <div className="text-center">
        <p className="text-white font-black text-2xl">{buyerRep.score}</p>
        <p className="text-hz-green-deep/70 text-[10px] font-bold uppercase tracking-wider">Flip Score</p>
      </div>
      <div className="w-px h-8 bg-white/25" />
      <div className="text-center">
        <p className="text-white font-black text-2xl">{buyerRep.totalPickups}</p>
        <p className="text-hz-green-deep/70 text-[10px] font-bold uppercase tracking-wider">Pickups</p>
      </div>
      <div className="w-px h-8 bg-white/25" />
      <div className="text-center">
        <p className="text-white font-black text-2xl">{buyerRep.completionRate}%</p>
        <p className="text-hz-green-deep/70 text-[10px] font-bold uppercase tracking-wider">Completion</p>
      </div>
      <div className="w-px h-8 bg-white/25" />
      <div className="text-center flex flex-col items-center">
        <CheckCircle size={16} className="text-hz-neon" strokeWidth={2.5} />
        <p className="text-hz-green-deep/70 text-[10px] font-bold uppercase tracking-wider mt-0.5">Active</p>
      </div>
    </div>
  );
}

function SectionHeader({ title }) {
  return (
    <h2 className="text-hz-green-deep font-black text-xs tracking-widest uppercase mb-3 flex items-center gap-2">
      {title}
    </h2>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('home');
  const [pendingCodes, setPendingCodes] = useState(mockPendingActivation);
  const [activeCodes, setActiveCodes] = useState(mockActiveCodes);
  const [activatingId, setActivatingId] = useState(null);

  const handleActivate = (pending) => {
    setActivatingId(pending.id);
    setTimeout(() => {
      setPendingCodes(prev => prev.filter(p => p.id !== pending.id));
      setActiveCodes(prev => [...prev, {
        id: `ac-${pending.id}`,
        code: 'FZ-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Math.random().toString(36).slice(2, 4).toUpperCase(),
        lockerNum: pending.lockerNum,
        location: pending.location,
        seller: pending.seller,
        sellerId: pending.sellerId,
        status: 'active',
        expires: '24h 00m',
        item: pending.item,
        activatedAt: 'Just now',
      }]);
      setActivatingId(null);
    }, 1400);
  };

  return (
    <div className="min-h-screen bg-hz-cream pb-24">

      {/* Header */}
      <div className="hz-curved-header px-5 pt-12 pb-6 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #3A9010 0%, #2D7A0D 55%, #1A5008 100%)' }}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <FZMonogram size={40} showBackground />
            <div>
              <h1 className="text-hz-green-deep font-black text-xl hz-text-emboss">My Zone</h1>
              <p className="text-hz-green-deep/60 text-xs font-semibold">Buyer Access Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SwitchRoleButton variant="light" />
            <div className="w-9 h-9 rounded-xl hz-green-surface-dark flex items-center justify-center border border-hz-green-deep/20">
              <span className="text-hz-green font-black text-sm">AK</span>
            </div>
          </div>
        </div>
        <RepBar />
      </div>

      {/* Tab Bar */}
      <div className="px-5 pt-4">
        <div className="flex gap-2 bg-white rounded-2xl p-1 hz-card-shadow">
          {[
            { key: 'home',    label: 'Pickups'  },
            { key: 'inbox',   label: 'Queue',   badge: pendingCodes.length },
            { key: 'history', label: 'History'  },
            { key: 'access',  label: 'Audit'    },
            { key: 'settings',label: 'Settings' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold tracking-wide transition-all relative ${
                tab === t.key
                  ? 'bg-hz-green-deep text-white'
                  : 'text-hz-green-deep/50 hover:text-hz-green-deep'
              }`}
            >
              {t.label}
              {t.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-hz-amber text-white text-[9px] font-black flex items-center justify-center">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-4 space-y-6">

        {/* ── ACCESS QUEUE TAB — pending credential activation ── */}
        {tab === 'inbox' && (
          <div>
            <SectionHeader title="Access Queue — Pending Activation" />
            <AnimatePresence>
              {pendingCodes.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl p-6 text-center hz-card-shadow"
                >
                  <CheckCircle size={28} className="text-hz-green/30 mx-auto mb-2" strokeWidth={2} />
                  <p className="text-hz-green-deep/40 text-sm font-semibold">Access queue clear</p>
                  <p className="text-hz-green-deep/25 text-xs mt-1">Seller-released credentials will stage here for activation</p>
                </motion.div>
              ) : pendingCodes.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-3xl p-5 hz-card-shadow-lg border border-hz-amber/25 mb-4"
                >
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-hz-amber/10 flex items-center justify-center">
                      <Bell size={14} className="text-hz-amber" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <p className="text-hz-green-deep font-black text-sm">Staged Access Credential</p>
                      <p className="text-hz-green-deep/40 text-[10px]">Released by {p.seller} · {p.releasedAt} · Inactive until activated</p>
                    </div>
                    <span className="text-[10px] font-black px-2 py-1 rounded-full bg-hz-amber/12 text-hz-amber tracking-wider">
                      PENDING
                    </span>
                  </div>

                  {/* Details */}
                  <div className="bg-hz-cream rounded-2xl px-4 py-3 space-y-1.5 mb-4">
                    <div className="flex justify-between">
                      <span className="text-hz-green-deep/45 text-xs font-semibold">Locker</span>
                      <span className="text-hz-green-deep font-black text-xs">{p.lockerNum} · {p.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-hz-green-deep/45 text-xs font-semibold">Item</span>
                      <span className="text-hz-green-deep font-bold text-xs italic">{p.item}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-hz-green-deep/45 text-xs font-semibold">Value</span>
                      <span className="text-hz-green-deep font-black text-xs">${p.value}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-hz-green-deep/45 text-xs font-semibold">Seller Trust</span>
                      <div className="flex items-center gap-1">
                        <CheckCircle size={10} className="text-hz-green" strokeWidth={2.5} />
                        <span className="text-hz-green-dark font-black text-xs">FlipZone™ Account</span>
                      </div>
                    </div>
                  </div>

                  {/* Security notice */}
                  <div className="flex items-start gap-2 mb-4 px-1">
                    <Lock size={11} className="text-hz-green-deep/35 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                    <p className="text-hz-green-deep/40 text-[10px] leading-relaxed">
                      Credential is <strong>staged and inactive</strong>. Locker access window is not live until you authorize activation. Activation is tied to your verified FZ account and logged to the audit chain.
                    </p>
                  </div>

                  {/* Activate CTA */}
                  <button
                    onClick={() => handleActivate(p)}
                    disabled={activatingId === p.id}
                    className="w-full py-4 rounded-2xl font-black text-base tracking-wide transition-all active:scale-[0.97]
                      bg-hz-green-deep text-white flex items-center justify-center gap-2.5
                      disabled:opacity-60 disabled:scale-100"
                  >
                    {activatingId === p.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Authorizing Credential…
                      </>
                    ) : (
                      <>
                        <Fingerprint size={18} strokeWidth={2.5} />
                        Authorize &amp; Activate Access
                      </>
                    )}
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Audit note */}
            <div className="mt-2 flex items-start gap-2.5 px-1">
              <CheckCircle size={12} className="text-hz-green/50 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
              <p className="text-hz-green-deep/35 text-[10px] leading-relaxed">
                All credential authorizations are bound to your FlipZone™ account, timestamped, and written to the audit chain.
              </p>
            </div>
          </div>
        )}

        {/* ── PICKUPS TAB ── */}
        {tab === 'home' && (
          <>
            {/* Active Access Codes */}
            <div>
              <SectionHeader title="Authorized Credentials — Live" />
              <AnimatePresence>
                {activeCodes.length === 0 ? (
                  <div className="bg-white rounded-2xl p-5 text-center hz-card-shadow">
                    <QrCode size={28} className="text-hz-green/30 mx-auto mb-2" />
                    <p className="text-hz-green-deep/40 text-sm font-semibold">No active codes</p>
                    <p className="text-hz-green-deep/25 text-xs mt-1">Authorize a staged credential from your Access Queue</p>
                  </div>
                ) : activeCodes.map((c, i) => (
                  <motion.button
                    key={c.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => navigate('/buyer/codes')}
                    className="w-full text-left bg-white rounded-2xl p-4 hz-card-shadow-lg border border-hz-neon/20 active:scale-[0.98] transition-transform mb-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-hz-neon hz-neon-glow" />
                        <span className="text-hz-green-deep font-black text-base">Locker {c.lockerNum}</span>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-hz-green/15 text-hz-green-dark">ACTIVATED</span>
                    </div>
                    <p className="text-hz-green-deep/50 text-xs mb-1 flex items-center gap-1">
                      <MapPin size={10} strokeWidth={2.5} />{c.location} · From {c.seller}
                    </p>
                    <p className="text-hz-green-deep/40 text-xs mb-2 italic">{c.item}</p>
                    <div className="bg-hz-green/8 rounded-xl px-3 py-2.5 flex items-center justify-between">
                      <span className="text-hz-green-deep font-black text-xl tracking-widest">{c.code}</span>
                      <div className="flex items-center gap-1 text-hz-green-deep/50 text-xs">
                        <Clock size={10} /><span>{c.expires}</span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5">
                      <Zap size={10} className="text-hz-green" strokeWidth={2.5} />
                      <span className="text-hz-green-dark text-[10px] font-bold">Access window live · Credential authorized {c.activatedAt}</span>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            {/* Assigned Lockers (pending pickup) */}
            <div>
              <SectionHeader title="Assigned Lockers — Awaiting Pickup" />
              {mockAssignedLockers.map((l, i) => (
                <motion.div
                  key={l.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-2xl p-4 hz-card-shadow border border-hz-amber/20 mb-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Lock size={14} className="text-hz-amber" strokeWidth={2.5} />
                      <span className="text-hz-green-deep font-black">Locker {l.lockerNum}</span>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-hz-amber">PENDING</span>
                  </div>
                  <p className="text-hz-green-deep/50 text-xs flex items-center gap-1">
                    <MapPin size={10} strokeWidth={2.5} />{l.location} · From {l.seller}
                  </p>
                  <p className="text-hz-green-deep/40 text-xs mt-1 italic">{l.item} · Assigned {l.assignedDate}</p>
                </motion.div>
              ))}
            </div>

            {/* Trusted Zones */}
            <div>
              <SectionHeader title="Trusted Pickup Zones" />
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {mockTrustedZones.map(z => (
                  <div key={z.id} className="flex-shrink-0 bg-white rounded-2xl px-4 py-3 hz-card-shadow text-center min-w-[120px]">
                    <MapPin size={16} className="text-hz-green mx-auto mb-1" strokeWidth={2.5} />
                    <p className="text-hz-green-deep font-bold text-xs leading-tight">{z.name}</p>
                    <p className="text-hz-green-deep/40 text-[10px] mt-0.5">{z.lockers} lockers · {z.distance}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── HISTORY TAB ── */}
        {tab === 'history' && (
          <div>
            <SectionHeader title="My Pickup History — All Sellers" />
            <div className="space-y-2">
              {mockPickupHistory.map((h, i) => (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-white rounded-2xl p-3.5 hz-card-shadow flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      h.status === 'completed' ? 'bg-hz-green/10' : 'bg-red-50'
                    }`}>
                      {h.status === 'completed'
                        ? <CheckCircle size={15} className="text-hz-green" strokeWidth={2.5} />
                        : <AlertCircle size={15} className="text-red-400" strokeWidth={2.5} />
                      }
                    </div>
                    <div>
                      <p className="text-hz-green-deep font-bold text-sm">Locker {h.lockerNum}</p>
                      <p className="text-hz-green-deep/50 text-xs">{h.location} · {h.seller}</p>
                      <p className="text-hz-green-deep/35 text-[10px]">{h.date} · ${h.value}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      h.status === 'completed' ? 'bg-hz-green/10 text-hz-green-dark' : 'bg-red-50 text-red-500'
                    }`}>
                      {h.status.toUpperCase()}
                    </span>
                    {h.ratingGiven ? (
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} size={9} className={j < h.ratingGiven ? 'text-hz-gold fill-hz-gold' : 'text-gray-200 fill-gray-200'} />
                        ))}
                      </div>
                    ) : (
                      <span className="text-[9px] text-hz-amber font-semibold">Rate Seller</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── SELLERS TAB ── */}
        {tab === 'sellers' && (
          <div>
            <SectionHeader title="Trusted Sellers" />
            <div className="space-y-2.5">
              {mockTrustedSellers.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-2xl p-4 hz-card-shadow flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl hz-green-surface flex items-center justify-center">
                      <span className="text-hz-green-deep font-black text-sm">{s.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-hz-green-deep font-bold text-sm">{s.name}</p>
                      <p className="text-hz-green-deep/45 text-xs">{s.zone} zone · {s.completedWith} pickup{s.completedWith > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-hz-green/10 px-2.5 py-1 rounded-full">
                      <Star size={11} className="text-hz-green fill-hz-green" strokeWidth={2} />
                      <span className="text-hz-green-dark font-black text-xs">{s.trustScore}</span>
                    </div>
                    <Heart size={16} className="text-red-300 fill-red-200" strokeWidth={2} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {tab === 'settings' && (
          <div className="space-y-3">
            <SectionHeader title="Account Settings" />
            <button
              onClick={() => navigate('/settings/notification-sounds')}
              className="w-full bg-white rounded-2xl p-4 hz-card-shadow flex items-center justify-between active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-hz-green/15 flex items-center justify-center">
                  <Music size={18} className="text-hz-green" strokeWidth={2.5} />
                </div>
                <div className="text-left">
                  <p className="text-hz-green-deep font-bold text-sm">Notification Sounds</p>
                  <p className="text-hz-green-deep/50 text-xs">Customize alerts, library sounds &amp; voice</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-hz-green/50" />
            </button>
          </div>
        )}

        {/* ── ACCESS LOG TAB ── */}
        {tab === 'access' && (
          <div>
            <SectionHeader title="Credential & Access Audit Log" />
            <div className="space-y-2">
              {mockAccessLog.map((log, i) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-white rounded-2xl p-3.5 hz-card-shadow flex items-center gap-3"
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    log.success ? 'bg-hz-green/10' : 'bg-red-50'
                  }`}>
                    {log.success
                      ? <CheckCircle size={14} className="text-hz-green" strokeWidth={2.5} />
                      : <AlertCircle size={14} className="text-red-400" strokeWidth={2.5} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-hz-green-deep font-bold text-sm truncate">{log.event} · {log.lockerNum}</p>
                    <p className="text-hz-green-deep/45 text-xs truncate">{log.location}</p>
                  </div>
                  <p className="text-hz-green-deep/35 text-[10px] font-semibold flex-shrink-0 text-right">{log.time}</p>
                </motion.div>
              ))}
            </div>

            {/* Locker Release Confirmations note */}
            <div className="mt-4 bg-hz-green/8 rounded-2xl px-4 py-3 flex items-start gap-2.5">
              <RotateCcw size={15} className="text-hz-green mt-0.5 flex-shrink-0" strokeWidth={2.5} />
              <p className="text-hz-green-deep/60 text-xs leading-relaxed">
              All credential activations and locker access events are written to your private audit record, visible only to you and FlipZone™ support.
              </p>
            </div>
          </div>
        )}

      </div>

      <BottomNav role="buyer" />
    </div>
  );
}