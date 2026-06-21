import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Package, Clock, AlertTriangle, CheckCircle2, XCircle,
  Shield, Zap, ArrowLeft, ChevronRight, Trash2, ShieldAlert,
  RotateCcw, Lock, Timer, DollarSign, MapPin, User
} from 'lucide-react';
import FZMonogram from '../components/FZMonogram';

// ─── Notification definitions ─────────────────────────────────────────────

const ROLE_COLORS = {
  seller: { bg: 'bg-green-50', border: 'border-green-200', dot: '#4CAF1A', label: 'bg-green-100 text-green-800' },
  buyer:  { bg: 'bg-blue-50',  border: 'border-blue-200',  dot: '#2563EB', label: 'bg-blue-100 text-blue-800'  },
  admin:  { bg: 'bg-amber-50', border: 'border-amber-200', dot: '#C97A1A', label: 'bg-amber-100 text-amber-800' },
};

const ICON_MAP = {
  success:  { icon: CheckCircle2, color: '#4CAF1A' },
  warning:  { icon: Clock,        color: '#C97A1A' },
  alert:    { icon: AlertTriangle,color: '#EF4444' },
  info:     { icon: Bell,         color: '#2563EB' },
  lock:     { icon: Lock,         color: '#2D7A0D' },
  dollar:   { icon: DollarSign,   color: '#C97A1A' },
  shield:   { icon: ShieldAlert,  color: '#EF4444' },
  rotate:   { icon: RotateCcw,    color: '#4CAF1A' },
  timer:    { icon: Timer,        color: '#C97A1A' },
  user:     { icon: User,         color: '#2563EB' },
};

const ALL_TEMPLATES = [
  // ── SELLER ──
  { id: 'seller_deposit_ok',    role: 'seller', type: 'success', title: 'Item Successfully Deposited',        body: 'Your item in Locker B-07 (Eastside Plaza) has been confirmed deposited. Buyer access credential has been generated and is pending your release.',                 time: null },
  { id: 'seller_pickup_done',   role: 'seller', type: 'success', title: 'Buyer Picked Up Item',               body: 'Jordan M. has successfully retrieved the item from Locker B-07. Transaction #FZ-8821 is now marked complete. Your trust score has been updated.',             time: null },
  { id: 'seller_6hr',          role: 'seller', type: 'warning', title: 'Buyer Has 6 Hours Remaining',        body: 'The buyer\'s pickup window for Locker A-12 (North Hub Station) expires in 6 hours. No action required — this is an advance notice.',                          time: null },
  { id: 'seller_2hr',          role: 'seller', type: 'warning', title: 'Buyer Has 2 Hours Remaining',        body: 'Urgent: The buyer\'s pickup window for Locker A-12 expires in 2 hours. If the item is not collected, an automatic no-show will be logged.',                   time: null },
  { id: 'seller_noshow',       role: 'seller', type: 'alert',   title: 'Buyer Missed Pickup Window',         body: 'The credential for Locker A-12 has expired unused. A no-show event has been recorded. Your locker will remain held pending your retrieval request.',           time: null },
  { id: 'seller_24hr',         role: 'seller', type: 'alert',   title: 'Item Still in Locker After 24 Hours',body: 'Your item has been in Locker A-12 for over 24 hours without buyer collection. Please initiate a retrieval or contact FlipZone™ Operator Support.',           time: null },
  // ── BUYER ──
  { id: 'buyer_code_issued',   role: 'buyer',  type: 'lock',    title: 'Pickup Credential Issued',           body: 'A secure access credential for Locker B-07 (Eastside Plaza) is now staged in your FlipZone™ account. Open the app to view and activate your credential.',   time: null },
  { id: 'buyer_6hr',          role: 'buyer',  type: 'warning', title: '6 Hours Remaining on Your Credential',body: 'Your pickup credential for Locker B-07 expires in 6 hours. Activate your access code inside the app before time runs out.',                                time: null },
  { id: 'buyer_2hr',          role: 'buyer',  type: 'timer',   title: '2 Hours Remaining — Act Now',        body: 'Your access credential for Locker B-07 expires in under 2 hours. Head to Eastside Plaza now. Late fee may apply if window expires.',                          time: null },
  { id: 'buyer_expired',      role: 'buyer',  type: 'alert',   title: 'Pickup Window Expired',              body: 'Your access credential for Locker B-07 has expired. A no-show has been recorded on your account. Contact the seller or open a dispute if needed.',            time: null },
  { id: 'buyer_latefee',      role: 'buyer',  type: 'dollar',  title: 'Late Fee Applied',                   body: 'A $12.00 late fee has been applied to your account for the expired pickup on Locker B-07. This covers the seller\'s locker holding cost.',                   time: null },
  { id: 'buyer_newcode',      role: 'buyer',  type: 'rotate',  title: 'New Pickup Credential Issued',       body: 'The seller has issued a new access credential for Locker B-07. Your previous credential has been revoked. Activate your new credential inside the app.',       time: null },
  // ── ADMIN ──
  { id: 'admin_occupied',     role: 'admin',  type: 'info',    title: 'Locker Occupied — Active Transaction',body: 'Locker D-03 at Downtown Zone is now active under Transaction #FZ-9944 (Seller: Alex T. → Buyer: Jordan M.). Monitoring window started.',                    time: null },
  { id: 'admin_overdue',      role: 'admin',  type: 'warning', title: 'Locker Overdue — Credential Expired', body: 'Locker D-03 at Downtown Zone has exceeded its credential window. Buyer has not collected. No-show flag initiated. Seller retrieval required.',               time: null },
  { id: 'admin_noshow',       role: 'admin',  type: 'shield',  title: 'No-Show Detected',                   body: 'Transaction #FZ-9944 recorded a buyer no-show on Locker D-03. Audit event logged. Seller has been notified to initiate retrieval protocol.',                  time: null },
  { id: 'admin_retrieval',    role: 'admin',  type: 'user',    title: 'Seller Retrieval Requested',         body: 'Seller Alex T. has requested retrieval access for Locker D-03 (Transaction #FZ-9944). Please verify identity and authorize manual override if required.',     time: null },
];

// ─── Demo Control definitions ─────────────────────────────────────────────

const DEMO_TRIGGERS = [
  { id: 'trigger_6hr',     label: 'Simulate 6-Hour Reminder',     ids: ['seller_6hr', 'buyer_6hr'],                      color: 'amber'  },
  { id: 'trigger_2hr',     label: 'Simulate 2-Hour Reminder',     ids: ['seller_2hr', 'buyer_2hr'],                      color: 'amber'  },
  { id: 'trigger_latefee', label: 'Simulate Late Fee',            ids: ['buyer_latefee', 'admin_overdue'],               color: 'red'    },
  { id: 'trigger_24hr',    label: 'Simulate 24-Hour Seller Alert', ids: ['seller_24hr', 'admin_overdue'],                 color: 'red'    },
  { id: 'trigger_pickup',  label: 'Simulate Successful Pickup',   ids: ['seller_pickup_done', 'admin_occupied'],         color: 'green'  },
  { id: 'trigger_noshow',  label: 'Simulate No-Show',             ids: ['seller_noshow', 'buyer_expired', 'admin_noshow'], color: 'red'  },
];

const TRIGGER_COLORS = {
  green: { btn: 'bg-hz-green text-hz-green-deep', ring: 'ring-hz-green/30' },
  amber: { btn: 'bg-hz-amber text-white',         ring: 'ring-hz-amber/30' },
  red:   { btn: 'bg-red-500 text-white',          ring: 'ring-red-400/30'  },
};

const TABS = ['All', 'Seller', 'Buyer', 'Admin'];

function timestamp() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function NotificationCenter() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [tab, setTab] = useState('All');
  const [firing, setFiring] = useState(null);

  const fire = (templateId) => {
    const tpl = ALL_TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return;
    const note = { ...tpl, uid: `${tpl.id}-${Date.now()}`, time: timestamp(), read: false };
    setNotifications(prev => [note, ...prev]);
  };

  const triggerDemo = (trigger) => {
    setFiring(trigger.id);
    trigger.ids.forEach((id, i) => {
      setTimeout(() => fire(id), i * 350);
    });
    setTimeout(() => setFiring(null), trigger.ids.length * 350 + 300);
  };

  const dismiss = (uid) => setNotifications(prev => prev.filter(n => n.uid !== uid));
  const markRead = (uid) => setNotifications(prev => prev.map(n => n.uid === uid ? { ...n, read: true } : n));
  const clearAll = () => setNotifications([]);

  const filtered = tab === 'All' ? notifications : notifications.filter(n => n.role === tab.toLowerCase());
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-hz-cream pb-6">

      {/* Header */}
      <div className="hz-curved-header px-5 pt-12 pb-6 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #1A3A1A 0%, #0D2A0D 60%, #071A07 100%)' }}>
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate('/demo')} className="flex items-center gap-2 text-white/60 active:text-white transition-colors">
            <ArrowLeft size={18} strokeWidth={2.5} />
            <span className="text-xs font-bold">Demo Hub</span>
          </button>
          <div className="flex items-center gap-2">
            <FZMonogram size={32} showBackground />
            {unread > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {unread} NEW
              </span>
            )}
          </div>
        </div>
        <div>
          <div className="text-hz-green text-xs font-bold tracking-widest uppercase mb-1">Demo Mode · Visual Only</div>
          <h1 className="text-white font-black text-2xl">Notification Center</h1>
          <p className="text-white/50 text-xs mt-1 leading-relaxed">Simulated in-app notification workflow. No SMS or email integrations.</p>
        </div>
      </div>

      {/* Demo Controls */}
      <div className="px-5 pt-5">
        <div className="text-hz-green-deep/60 text-[10px] font-bold uppercase tracking-widest mb-3">Demo Controls — Fire Notification Events</div>
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          {DEMO_TRIGGERS.map(trigger => {
            const c = TRIGGER_COLORS[trigger.color];
            const isActive = firing === trigger.id;
            return (
              <button
                key={trigger.id}
                onClick={() => triggerDemo(trigger)}
                disabled={isActive}
                className={`${c.btn} rounded-2xl py-3 px-3 text-xs font-bold flex items-center gap-2 justify-center active:scale-95 transition-all ring-2 ${c.ring} disabled:opacity-60`}
              >
                {isActive ? (
                  <div className="w-3.5 h-3.5 border-2 border-current/40 border-t-current rounded-full animate-spin" />
                ) : (
                  <Zap size={12} strokeWidth={2.5} />
                )}
                <span className="leading-tight text-center">{trigger.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick fire individual notifications */}
        <div className="text-hz-green-deep/60 text-[10px] font-bold uppercase tracking-widest mb-3">Individual Notification Templates</div>
        <div className="bg-white rounded-2xl hz-card-shadow overflow-hidden mb-5">
          {[
            { section: 'Seller', color: '#4CAF1A', items: ALL_TEMPLATES.filter(t => t.role === 'seller') },
            { section: 'Buyer',  color: '#2563EB', items: ALL_TEMPLATES.filter(t => t.role === 'buyer')  },
            { section: 'Admin',  color: '#C97A1A', items: ALL_TEMPLATES.filter(t => t.role === 'admin')  },
          ].map(({ section, color, items }) => (
            <div key={section}>
              <div className="px-4 py-2.5 border-b border-gray-100" style={{ background: `${color}0C` }}>
                <span className="text-xs font-black uppercase tracking-wide" style={{ color }}>{section} Notifications</span>
              </div>
              {items.map((tpl, i) => {
                const { icon: Icon, color: iconColor } = ICON_MAP[tpl.type];
                return (
                  <button
                    key={tpl.id}
                    onClick={() => fire(tpl.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors ${i < items.length - 1 ? 'border-b border-gray-50' : ''}`}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${iconColor}18` }}>
                      <Icon size={13} style={{ color: iconColor }} strokeWidth={2.5} />
                    </div>
                    <span className="text-hz-green-deep text-xs font-semibold flex-1 leading-tight">{tpl.title}</span>
                    <ChevronRight size={12} className="text-gray-300 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Notification Feed */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-hz-green-deep/60 text-[10px] font-bold uppercase tracking-widest">In-App Notification Feed</div>
          {notifications.length > 0 && (
            <button onClick={clearAll} className="flex items-center gap-1 text-red-400 text-[10px] font-bold">
              <Trash2 size={10} strokeWidth={2.5} />
              Clear All
            </button>
          )}
        </div>

        {/* Tab Filter */}
        <div className="flex gap-1.5 bg-white rounded-2xl p-1 hz-card-shadow mb-4">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all ${
                tab === t ? 'bg-hz-green-deep text-white' : 'text-hz-green-deep/40'
              }`}
            >
              {t}
              {t !== 'All' && notifications.filter(n => n.role === t.toLowerCase() && !n.read).length > 0 && (
                <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-red-400 align-middle" />
              )}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center hz-card-shadow">
            <Bell size={28} className="text-hz-green/25 mx-auto mb-2" strokeWidth={1.5} />
            <p className="text-hz-green-deep/35 text-sm font-semibold">No notifications yet</p>
            <p className="text-hz-green-deep/20 text-xs mt-1">Use the demo controls above to simulate notification events</p>
          </div>
        )}

        {/* Notification list */}
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((note) => {
              const { icon: Icon, color: iconColor } = ICON_MAP[note.type];
              const rc = ROLE_COLORS[note.role];
              return (
                <motion.div
                  key={note.uid}
                  initial={{ opacity: 0, y: -12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 40, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                  onClick={() => markRead(note.uid)}
                  className={`relative rounded-2xl p-4 hz-card-shadow border cursor-pointer transition-all active:scale-[0.98] ${rc.bg} ${rc.border} ${note.read ? 'opacity-60' : ''}`}
                >
                  {/* Unread dot */}
                  {!note.read && (
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full" style={{ background: rc.dot }} />
                  )}

                  <div className="flex items-start gap-3 pr-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${iconColor}18` }}>
                      <Icon size={16} style={{ color: iconColor }} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-hz-green-deep font-black text-sm leading-tight">{note.title}</span>
                      </div>
                      <p className="text-hz-green-deep/55 text-xs leading-relaxed mb-2">{note.body}</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide ${rc.label}`}>
                          {note.role}
                        </span>
                        <span className="text-hz-green-deep/30 text-[10px]">{note.time}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); dismiss(note.uid); }}
                          className="ml-auto text-gray-300 hover:text-red-400 transition-colors"
                        >
                          <XCircle size={14} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Legend */}
        {notifications.length > 0 && (
          <div className="mt-5 bg-white/60 rounded-2xl px-4 py-3">
            <p className="text-hz-green-deep/40 text-[10px] leading-relaxed text-center">
              <Shield size={10} className="inline mr-1 text-hz-green/50" strokeWidth={2.5} />
              Visual demo only — no external notifications sent. All events are simulated in-app exclusively per FlipZone™ credential security policy.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}