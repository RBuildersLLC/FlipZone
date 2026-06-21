import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Package, Users, BarChart2, Lock, Star,
  ArrowRight, Play, Zap, Globe, CheckCircle, Bell
} from 'lucide-react';

import FZMonogram from '../components/FZMonogram';

const FEATURES = [
  { icon: Package, color: '#4CAF1A', title: 'Flip & Go Locker Handoffs', desc: 'Drop the item, release the code, collect payment — the reseller workflow, perfected.' },
  { icon: Lock, color: '#2D7A0D', title: 'Secure Access Code System', desc: 'Randomized pickup codes with expiry, single-use limits, and instant revocation.' },
  { icon: Zap, color: '#C9A84C', title: 'Instant Deal Activation', desc: 'Buyers activate codes on demand. No meetups, no exposure, no wasted time.' },
  { icon: BarChart2, color: '#4CAF1A', title: 'Flip Tracking & Analytics', desc: 'Track every transaction, monitor your hustle, and grow your resale business.' },
  { icon: Users, color: '#2D7A0D', title: 'Operator Locker Network', desc: 'Real-time facility management, multi-location support, and staff tiers.' },
  { icon: Star, color: '#C9A84C', title: 'Seller Reputation Score', desc: 'Build trust with verified ratings. The best hustlers rise to the top.' },
];

const ROLES = [
  { label: 'Seller', path: '/seller', desc: 'Manage lockers, generate codes, track transactions', color: '#4CAF1A' },
  { label: 'Buyer', path: '/buyer', desc: 'Activate credentials, track pickups, view history', color: '#2D7A0D' },
  { label: 'Operator', path: '/operator', desc: 'Oversee facilities, audit logs, staff management', color: '#C9A84C' },
];

const STATS = [
  { value: '3', label: 'User Roles' },
  { value: '6+', label: 'Core Modules' },
  { value: '100%', label: 'Code-Gated Access' },
  { value: 'MVP', label: 'Live Prototype' },
];

export default function DemoLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-hz-cream font-inter overflow-x-hidden">

      {/* Hero */}
      <section className="hz-forest-surface relative overflow-hidden pt-16 pb-20 px-5">
        {/* Subtle ambient glow — no rings */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-48 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center bottom, rgba(76,175,26,0.18) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-lg mx-auto text-center">
          <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} className="flex justify-center mb-6">
            <FZMonogram size={96} showBackground />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <p className="text-hz-green text-xs font-bold tracking-[0.2em] uppercase mb-2">Buy. Flip. Repeat. — Interactive Demo</p>
            <h1 className="text-white font-black text-4xl leading-tight mb-4" style={{ textShadow: '0 2px 16px rgba(76,175,26,0.3)' }}>
              FlipZone™<br />
              <span className="text-hz-green">The Hustle Zone.</span>
            </h1>
            <p className="text-white/60 text-base leading-relaxed mb-8">
              The reseller's marketplace infrastructure. Buy, flip, and repeat — with secure locker handoffs, verified transactions, and entrepreneur-grade tools.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="flex flex-col gap-3 items-center">
            <button
              onClick={() => navigate('/role-select')}
              className="w-full max-w-xs bg-hz-green text-hz-green-deep font-black text-sm py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform hz-glow"
            >
              <Play size={16} strokeWidth={3} />
              Launch Demo
            </button>
            <button
              onClick={() => navigate('/slideshow')}
              className="w-full max-w-xs bg-white/10 border border-white/15 text-white font-bold text-sm py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Zap size={16} strokeWidth={2.5} />
              Brand Slideshow
            </button>
            <button
              onClick={() => navigate('/demo/notifications')}
              className="w-full max-w-xs bg-white/10 border border-white/15 text-white font-bold text-sm py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Bell size={16} strokeWidth={2.5} />
              Notification Center
            </button>
            <button
              onClick={() => navigate('/demo/verify')}
              className="w-full max-w-xs bg-white/10 border border-white/15 text-white font-bold text-sm py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <ShieldCheck size={16} strokeWidth={2.5} />
              Account Verification Flow
            </button>

          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-hz-green/10 px-5 py-6">
        <div className="max-w-lg mx-auto grid grid-cols-4 gap-2">
          {STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }} className="text-center">
              <p className="text-hz-green font-black text-2xl">{s.value}</p>
              <p className="text-hz-green-deep/50 text-[10px] font-semibold leading-tight mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-5 py-10 max-w-lg mx-auto">
        <p className="text-hz-green text-xs font-bold tracking-[0.18em] uppercase mb-1">What's Demonstrated</p>
        <h2 className="text-hz-green-deep font-black text-2xl mb-6">Core MVP Capabilities</h2>
        <div className="grid grid-cols-1 gap-4">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.title} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.06 * i }}
                className="bg-white rounded-2xl p-4 hz-card-shadow flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${f.color}18` }}>
                  <Icon size={18} style={{ color: f.color }} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-hz-green-deep font-bold text-sm">{f.title}</p>
                  <p className="text-hz-green-deep/55 text-xs mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Role Entry */}
      <section className="px-5 pb-10 max-w-lg mx-auto">
        <p className="text-hz-green text-xs font-bold tracking-[0.18em] uppercase mb-1">Explore by Role</p>
        <h2 className="text-hz-green-deep font-black text-2xl mb-6">Multi-Role Architecture</h2>
        <div className="space-y-3">
          {ROLES.map((r, i) => (
            <motion.button key={r.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
              onClick={() => navigate(r.path)}
              className="w-full bg-white rounded-2xl p-4 hz-card-shadow flex items-center gap-4 active:scale-[0.98] transition-transform text-left">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${r.color}18` }}>
                <span className="font-black text-sm" style={{ color: r.color }}>{r.label[0]}</span>
              </div>
              <div className="flex-1">
                <p className="text-hz-green-deep font-black text-sm">{r.label} Portal</p>
                <p className="text-hz-green-deep/50 text-xs mt-0.5">{r.desc}</p>
              </div>
              <ArrowRight size={16} className="text-hz-green-deep/30 flex-shrink-0" />
            </motion.button>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="hz-green-surface px-5 py-10">
        <div className="max-w-lg mx-auto text-center">
          <Globe size={28} className="text-hz-green-deep mx-auto mb-3" strokeWidth={2} />
          <h3 className="text-hz-green-deep font-black text-xl mb-2 hz-text-emboss">Built for Resellers. Powered by FlipZone™.</h3>
          <p className="text-hz-green-deep/70 text-sm mb-6 leading-relaxed">
            The Hustle Zone is built to scale — from solo flippers to high-volume reseller operations with locker infrastructure, staff tiers, and operator oversight.
          </p>
          <div className="flex flex-col gap-2 items-center">
            {['Secure locker-mediated handoffs', 'Entrepreneur-grade transaction tools', 'Buy. Flip. Repeat. — at scale.'].map(t => (
              <div key={t} className="flex items-center gap-2">
                <CheckCircle size={13} className="text-hz-green-deep" strokeWidth={2.5} />
                <span className="text-hz-green-deep/80 text-xs font-semibold">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}