import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, ShoppingBag, ArrowRight, ShieldCheck, Users, RefreshCw } from 'lucide-react';
import FZMonogram from '../components/FZMonogram';
import { motion } from 'framer-motion';

export default function RoleSelect() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-hz-cream flex flex-col">
      {/* Header */}
      <div className="hz-green-surface hz-curved-header px-6 pt-12 pb-10 flex items-center gap-4">
        <FZMonogram size={44} showBackground />
        <div>
          <h1 className="text-hz-green-deep font-black text-xl hz-text-emboss">FlipZone™</h1>
          <p className="text-hz-green-deep/60 text-xs font-bold tracking-widest uppercase">Buy. Flip. Repeat.</p>
        </div>
      </div>

      <div className="flex-1 px-5 py-6 space-y-5 overflow-y-auto pb-10">

        {/* Role switcher explainer */}
        <div className="bg-hz-green/10 border border-hz-green/25 rounded-2xl px-4 py-3 flex items-start gap-3">
          <RefreshCw size={14} className="text-hz-green mt-0.5 flex-shrink-0" strokeWidth={2.5} />
          <div>
            <p className="text-hz-green-dark font-black text-sm">One account. Two roles.</p>
            <p className="text-hz-green-deep/55 text-xs mt-0.5 leading-relaxed">
              Your single FlipZone™ account supports both Buyer and Seller dashboards. Switch roles at any time from the hub.
            </p>
          </div>
        </div>

        {/* Buyer + Seller combined card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, type: 'spring', stiffness: 260, damping: 20 }}
          className="bg-white rounded-3xl p-5 hz-card-shadow-lg border border-hz-green/10"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-hz-green/15 border border-hz-green/30 flex items-center justify-center">
              <Users size={20} className="text-hz-green" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-hz-green-deep font-black text-lg leading-none">Regular User</h3>
              <span className="text-hz-green/70 text-xs font-bold tracking-wider uppercase">Buyer + Seller</span>
            </div>
          </div>

          <p className="text-hz-green-deep/60 text-sm leading-relaxed mb-4">
            Access both buyer and seller dashboards from one account. Switch roles at any time.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Buyer card */}
            <button
              onClick={() => navigate('/buyer')}
              className="bg-hz-cream rounded-2xl p-3.5 text-left border border-hz-green/15 active:scale-[0.97] transition-transform"
            >
              <div className="w-8 h-8 rounded-xl bg-hz-green-dark/10 flex items-center justify-center mb-2.5">
                <ShoppingBag size={16} style={{ color: '#3A9010' }} strokeWidth={2} />
              </div>
              <p className="text-hz-green-deep font-black text-sm leading-none mb-1">Buyer</p>
              <p className="text-hz-green-deep/45 text-[10px] leading-relaxed">Active pickups · Disputes · Flip Score</p>
            </button>

            {/* Seller card */}
            <button
              onClick={() => navigate('/seller')}
              className="bg-hz-cream rounded-2xl p-3.5 text-left border border-hz-green/15 active:scale-[0.97] transition-transform"
            >
              <div className="w-8 h-8 rounded-xl bg-hz-green/10 flex items-center justify-center mb-2.5">
                <Store size={16} className="text-hz-green" strokeWidth={2} />
              </div>
              <p className="text-hz-green-deep font-black text-sm leading-none mb-1">Seller</p>
              <p className="text-hz-green-deep/45 text-[10px] leading-relaxed">Drop-offs · Release queue · Flip Score</p>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {['Secure locker handoffs', 'Flip Score tracking', 'Dispute protection', 'CCTV-backed audit'].map(f => (
              <span key={f} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-hz-green/10 text-hz-green-deep tracking-wide">{f}</span>
            ))}
          </div>
        </motion.div>

        {/* Operator — restricted notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, type: 'spring', stiffness: 260, damping: 20 }}
          className="bg-white rounded-3xl p-5 hz-card-shadow border border-hz-green/8 opacity-80"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-hz-green-dark/10 border border-hz-green-dark/20 flex items-center justify-center">
                <ShieldCheck size={20} className="text-hz-green-dark" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-hz-green-deep font-black text-lg leading-none">Facility Operator</h3>
                <span className="text-hz-green-deep/50 text-xs font-bold tracking-wider uppercase">Restricted Access</span>
              </div>
            </div>
            <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-hz-green-deep/10 text-hz-green-deep tracking-widest uppercase">
              Authorized Only
            </span>
          </div>

          <p className="text-hz-green-deep/55 text-sm leading-relaxed mb-3">
            Locker inventory, CCTV review, incident management, dispute resolution, revenue reporting, and override controls.
          </p>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {['Locker inventory', 'CCTV review', 'Incident reports', 'Loitering flags', 'Override controls'].map(f => (
              <span key={f} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-hz-green-deep/8 text-hz-green-deep/60 tracking-wide">{f}</span>
            ))}
          </div>

          <button
            onClick={() => navigate('/operator')}
            className="w-full bg-hz-green-deep text-white font-black text-sm py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.97] transition-all"
          >
            <ArrowRight size={15} strokeWidth={2.5} />Operator Portal
          </button>
        </motion.div>

        {/* Identity & privacy note */}
        <div className="bg-white rounded-2xl px-4 py-3.5 hz-card-shadow border border-hz-green/8">
          <p className="text-[10px] font-black text-hz-green-deep/40 uppercase tracking-widest mb-2">Identity & Privacy</p>
          <p className="text-hz-green-deep/55 text-xs leading-relaxed">
            Buyers and sellers are <strong className="text-hz-green-deep">not required</strong> to know each other's identity. Accountability is maintained through facility CCTV, access code logs, audit trails, and Flip Score.
          </p>
        </div>

      </div>
    </div>
  );
}