import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package, Zap, ShieldCheck,
  ChevronRight, TrendingUp, Lock, Bell, Clock, AlertTriangle, Music
} from 'lucide-react';
import BottomNav from '../components/BottomNav';
import TierBadge from '../components/TierBadge';
import RadialHub from '../components/RadialHub';
import SwitchRoleButton from '../components/SwitchRoleButton';
import ManualCodeReceiver from '../components/ManualCodeReceiver';
import { base44 } from '@/api/base44Client';

function ReleaseCountdown({ deadlineAt }) {
  const calc = () => {
    const diff = new Date(deadlineAt) - Date.now();
    if (diff <= 0) return null;
    const s = Math.floor(diff / 1000);
    return { h: Math.floor(s / 3600), m: Math.floor((s % 3600) / 60) };
  };
  const [left, setLeft] = useState(calc());
  useEffect(() => {
    const t = setInterval(() => setLeft(calc()), 60000);
    return () => clearInterval(t);
  }, [deadlineAt]);
  if (!left) return <span className="text-red-500 font-black text-[10px]">OVERDUE</span>;
  const isUrgent = left.h < 3;
  return (
    <span className="font-black text-[10px]" style={{ color: isUrgent ? '#C97A1A' : '#4CAF1A' }}>
      {left.h}h {left.m}m remaining
    </span>
  );
}

// iconKey maps to inline SVG paths inside RadialHub (no Lucide dependency)
const SPOKES = [
  { id: 'lockers',      label: 'My Lockers',   iconKey: 'package',    path: '/seller/lockers',      color: '#4CAF1A' },
  { id: 'transactions', label: 'Transactions', iconKey: 'zap',        path: '/seller/transactions', color: '#3A9010' },
  { id: 'codes',        label: 'Access Codes', iconKey: 'lock',       path: '/seller/codes',        color: '#56C41A' },
  { id: 'reputation',   label: 'Reputation',   iconKey: 'star',       path: '/seller/reputation',   color: '#2D7A0D' },
  { id: 'analytics',    label: 'Analytics',    iconKey: 'barChart',   path: '/seller/analytics',    color: '#4CAF1A' },
  { id: 'subscription', label: 'Subscription', iconKey: 'creditCard', path: '/seller/subscription', color: '#3A9010' },
];

export default function SellerHub() {
  const navigate = useNavigate();
  const [activeSpoke, setActiveSpoke] = useState(null);
  const [releaseQueue, setReleaseQueue] = useState([]);
  const tier = 'business'; // TODO: fetch from user

  useEffect(() => {
    base44.auth.me().then(me => {
      if (!me) return;
      base44.entities.Transaction.filter({ status: 'awaiting_release', seller_id: me.id })
        .then(setReleaseQueue)
        .catch(() => {});
    });
  }, []);

  const handleSpoke = (spoke) => {
    setActiveSpoke(spoke);
    setTimeout(() => navigate(spoke.path), 200);
  };

  const stats = [
    { label: 'Active Lockers', value: '12', icon: Package, trend: '+2' },
    { label: 'Transactions', value: '47', icon: Zap, trend: '+8' },
    { label: 'Flip Score', value: '94', icon: ShieldCheck, trend: '+1.2' },
  ];

  return (
    <div className="min-h-screen bg-hz-cream pb-20">
      {/* Curved Header */}
      <div className="hz-curved-header px-5 pt-12 pb-6 relative overflow-hidden" style={{ background: 'linear-gradient(150deg, #6DD42A 0%, #4CAF1A 40%, #2D7A0D 100%)' }}>
        {/* Subtle bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent, rgba(13,42,13,0.12))' }} />
        <div className="flex items-center justify-between mb-4">
          <div>
            <TierBadge tier={tier} size="sm" />
            <h1 className="text-hz-green-deep font-black text-2xl mt-1 hz-text-emboss">Seller Hub</h1>
            <p className="text-hz-green-deep/60 text-xs font-semibold">Welcome back, Jordan</p>
          </div>
          <div className="flex items-center gap-2">
            <SwitchRoleButton variant="light" />
            <div className="w-10 h-10 rounded-2xl hz-green-surface-dark flex items-center justify-center border border-hz-green-deep/20">
              <span className="text-hz-green font-black text-sm">JD</span>
            </div>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {stats.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-2xl px-3 py-2 min-w-[100px]">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Icon size={12} className="text-hz-green-deep" strokeWidth={2.5} />
                  <span className="text-hz-green-deep/70 text-[10px] font-semibold">{s.label}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-hz-green-deep font-black text-lg leading-none">{s.value}</span>
                  <span className="text-hz-green-dark text-[10px] font-bold">{s.trend}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Radial Hub */}
      <div className="flex justify-center py-2">
        <RadialHub spokes={SPOKES} onPress={handleSpoke} />
      </div>

      {/* Quick Action Cards */}
      <div className="px-5 space-y-3">
        <h2 className="text-hz-green-deep font-black text-sm tracking-wider uppercase">Quick Actions</h2>

        {/* Release Queue — primary seller action */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Bell size={13} className="text-hz-amber" strokeWidth={2.5} />
              <span className="text-hz-green-deep font-black text-xs tracking-wider uppercase">Release Queue</span>
              {releaseQueue.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-hz-amber text-white text-[9px] font-black flex items-center justify-center">
                  {releaseQueue.length}
                </span>
              )}
            </div>
          </div>

          {releaseQueue.length === 0 ? (
            <div className="rounded-2xl p-4 hz-card-shadow border border-hz-green/10 bg-white flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-hz-green/10 flex items-center justify-center">
                <Bell size={16} className="text-hz-green/40" strokeWidth={2.5} />
              </div>
              <p className="text-hz-green-deep/40 text-sm font-semibold">No items awaiting release</p>
            </div>
          ) : (
            <div className="space-y-2">
              {releaseQueue.map(tx => {
                const lateFeeSoonMs = tx.pickup_deadline_at ? new Date(tx.pickup_deadline_at) - Date.now() : null;
                const lateFeeSoon = lateFeeSoonMs !== null && lateFeeSoonMs < 3 * 60 * 60 * 1000;
                return (
                  <motion.button
                    key={tx.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => navigate(`/seller/transaction?txId=${tx.id}`)}
                    className="w-full text-left rounded-2xl p-4 hz-card-shadow-lg active:scale-[0.98] transition-transform"
                    style={{
                      background: 'linear-gradient(135deg, #0d2410 0%, #081508 100%)',
                      border: `1px solid ${lateFeeSoon ? 'rgba(201,120,26,0.4)' : 'rgba(57,255,20,0.2)'}`,
                      boxShadow: '0 0 20px rgba(57,255,20,0.06)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-black text-sm" style={{ color: '#f0fff0' }}>
                          Locker {tx.locker_number}
                          {tx.facility_name ? ` · ${tx.facility_name}` : ''}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(134,239,172,0.5)' }}>
                          {tx.item_description}
                        </p>
                      </div>
                      {lateFeeSoon && (
                        <AlertTriangle size={14} style={{ color: '#C97A1A' }} strokeWidth={2.5} className="flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Clock size={11} style={{ color: lateFeeSoon ? '#C97A1A' : 'rgba(134,239,172,0.5)' }} strokeWidth={2.5} />
                        {tx.pickup_deadline_at
                          ? <ReleaseCountdown deadlineAt={tx.pickup_deadline_at} />
                          : <span className="text-[10px]" style={{ color: 'rgba(134,239,172,0.4)' }}>No deadline set</span>
                        }
                      </div>
                      {/* Neon mini-CTA */}
                      <div className="rounded-full px-3 py-1 flex items-center gap-1.5"
                        style={{ background: 'linear-gradient(135deg, #39FF14 0%, #22C55E 100%)', boxShadow: '0 0 10px rgba(57,255,20,0.5)' }}>
                        <Zap size={10} style={{ color: '#071407' }} strokeWidth={3} />
                        <span className="font-black text-[10px] tracking-wide" style={{ color: '#071407' }}>RELEASE</span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        <button onClick={() => navigate('/seller/transactions')}
          className="w-full bg-white rounded-2xl p-4 hz-card-shadow flex items-center justify-between active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-hz-green/15 flex items-center justify-center">
              <Zap size={18} className="text-hz-green" strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <p className="text-hz-green-deep font-bold text-sm">New Transaction</p>
              <p className="text-hz-green-deep/50 text-xs">Assign a locker to a buyer</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-hz-green/50" />
        </button>

        <button onClick={() => navigate('/seller/codes')}
          className="w-full bg-white rounded-2xl p-4 hz-card-shadow flex items-center justify-between active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-hz-green/15 flex items-center justify-center">
              <Lock size={18} className="text-hz-green" strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <p className="text-hz-green-deep font-bold text-sm">Generate Access Code</p>
              <p className="text-hz-green-deep/50 text-xs">Create a new secure entry code</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-hz-green/50" />
        </button>

        <button onClick={() => navigate('/seller/audit')}
          className="w-full bg-white rounded-2xl p-4 hz-card-shadow flex items-center justify-between active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-hz-green/15 flex items-center justify-center">
              <TrendingUp size={18} className="text-hz-green" strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <p className="text-hz-green-deep font-bold text-sm">Audit History</p>
              <p className="text-hz-green-deep/50 text-xs">View all access events & logs</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-hz-green/50" />
        </button>

        <button onClick={() => navigate('/settings/notification-sounds')}
          className="w-full bg-white rounded-2xl p-4 hz-card-shadow flex items-center justify-between active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-hz-green/15 flex items-center justify-center">
              <Music size={18} className="text-hz-green" strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <p className="text-hz-green-deep font-bold text-sm">Notification Sounds</p>
              <p className="text-hz-green-deep/50 text-xs">Customize your alert sounds &amp; voice</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-hz-green/50" />
        </button>

        {/* Manual Locker Access — always visible, read-only */}
        <div>
          <h2 className="text-hz-green-deep font-black text-sm tracking-wider uppercase mb-2">Manual Locker Access</h2>
          <ManualCodeReceiver manualCodePackage={null} />
        </div>
      </div>

      <BottomNav role="seller" />
    </div>
  );
}