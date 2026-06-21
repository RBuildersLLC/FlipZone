import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ShieldCheck, TrendingUp, Award, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import FZMonogram from '../components/FZMonogram';
import TierBadge from '../components/TierBadge';

const reviews = [
  { id: '1', buyer: 'Alex K.', rating: 5, comment: 'Super smooth transaction. Code worked instantly. Highly recommend.', date: 'May 24' },
  { id: '2', buyer: 'Sam T.', rating: 5, comment: 'Professional and reliable. Locker was clean and accessible.', date: 'May 20' },
  { id: '3', buyer: 'Chris M.', rating: 4, comment: 'Good experience overall. A bit of a wait for the code delivery.', date: 'May 18' },
  { id: '4', buyer: 'Dana R.', rating: 5, comment: 'Perfect. Will use again. Fast code, easy access.', date: 'May 15' },
];

const badges = [
  { id: 'verified', label: 'Verified Seller', icon: ShieldCheck, color: '#C9A84C', earned: false, optional: true },
  { id: 'top_trader', label: 'Top Trader', icon: TrendingUp, color: '#2D7A0D', earned: true },
  { id: 'elite', label: 'Elite Zone', icon: Award, color: '#C9A84C', earned: false },
];

export default function ReputationProfile() {
  const navigate = useNavigate();
  const avgRating = (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div className="min-h-screen bg-hz-cream pb-8">
      {/* Header */}
      <div className="hz-green-surface hz-curved-header px-5 pt-12 pb-10 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-hz-green-deep/15 flex items-center justify-center">
            <ArrowLeft size={18} className="text-hz-green-deep" strokeWidth={2.5} />
          </button>
          <h1 className="text-hz-green-deep font-black text-xl hz-text-emboss">Reputation</h1>
        </div>

        {/* Score card */}
        <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-5 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl hz-green-surface-dark flex items-center justify-center border border-hz-green-deep/20">
            <span className="text-hz-green font-black text-lg">JD</span>
          </div>
          <div className="flex-1">
            <p className="text-hz-green-deep font-black text-base">Jordan M.</p>
            <TierBadge tier="business" size="sm" />
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={12} className={i < Math.round(parseFloat(avgRating)) ? 'text-hz-gold fill-hz-gold' : 'text-white/30 fill-white/10'} />
                ))}
              </div>
              <span className="text-hz-green-deep font-black text-base">{avgRating}</span>
              <span className="text-hz-green-deep/60 text-xs">({reviews.length} reviews)</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-hz-green-deep font-black text-3xl">94</p>
            <p className="text-hz-green-deep/60 text-xs font-bold">Trust Score</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Transactions', value: '47' },
            { label: 'Avg Rating', value: avgRating },
            { label: 'Completion', value: '98%' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-3.5 text-center hz-card-shadow">
              <p className="text-hz-green-deep font-black text-xl">{s.value}</p>
              <p className="text-hz-green-deep/50 text-[11px] font-semibold">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div>
          <h2 className="text-hz-green-deep font-black text-sm tracking-wider uppercase mb-3">Trust Badges</h2>
          <div className="grid grid-cols-3 gap-3">
            {badges.map(b => {
              const Icon = b.icon;
              return (
                <div key={b.id} className={`bg-white rounded-2xl p-3.5 text-center hz-card-shadow ${!b.earned ? 'opacity-40' : ''}`}>
                  <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center"
                    style={{ background: `${b.color}20` }}>
                    <Icon size={18} style={{ color: b.color }} strokeWidth={2} />
                  </div>
                  <p className="text-hz-green-deep font-bold text-[11px] leading-tight">{b.label}</p>
                  {!b.earned && !b.optional && <p className="text-hz-green-deep/40 text-[9px] mt-0.5">Locked</p>}
                  {b.optional && !b.earned && <p className="text-hz-gold text-[9px] mt-0.5 font-bold">Optional Upgrade</p>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews */}
        <div>
          <h2 className="text-hz-green-deep font-black text-sm tracking-wider uppercase mb-3">Buyer Reviews</h2>
          <div className="space-y-3">
            {reviews.map((r, i) => (
              <motion.div key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-4 hz-card-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-hz-green/15 flex items-center justify-center">
                      <MessageCircle size={12} className="text-hz-green" strokeWidth={2.5} />
                    </div>
                    <span className="text-hz-green-deep font-bold text-sm">{r.buyer}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={10} className={j < r.rating ? 'text-hz-gold fill-hz-gold' : 'text-gray-200 fill-gray-200'} />
                    ))}
                    <span className="text-hz-green-deep/40 text-[10px] ml-1">{r.date}</span>
                  </div>
                </div>
                <p className="text-hz-green-deep/70 text-sm leading-relaxed">"{r.comment}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}