import React from 'react';
import { useNavigate } from 'react-router-dom';
import BrandFooter from '../components/BrandFooter';
import { ArrowLeft, Check, Lock, Zap, Briefcase, Crown, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import HZMonogram from '../components/HZMonogram';

const tiers = [
  {
    id: 'starter',
    label: 'Starter',
    icon: Zap,
    price: 'Free',
    period: '',
    tagline: 'Launch your locker zone',
    color: '#4CAF1A',
    bg: 'bg-white',
    border: 'border-hz-green/30',
    features: [
      '5 locker slots',
      'Basic access code generation',
      'Transaction history (30 days)',
      'Buyer account matching',
      'HustleZone™ trust badge',
    ],
    locked: [],
    current: false,
  },
  {
    id: 'business',
    label: 'Business',
    icon: Briefcase,
    price: '$29',
    period: '/mo',
    tagline: 'Scale your commerce infrastructure',
    color: '#2D7A0D',
    bg: 'bg-hz-green/5',
    border: 'border-hz-green',
    features: [
      '50 locker slots',
      'Advanced access code controls',
      'Full audit history',
      'Analytics dashboard',
      'Priority buyer matching',
      'Reputation profile + badges',
    ],
    locked: [],
    current: true,
    recommended: true,
  },
  {
    id: 'enterprise',
    label: 'Enterprise',
    icon: Crown,
    price: '$99',
    period: '/mo',
    tagline: 'Unlimited operational scale',
    color: '#C9A84C',
    bg: 'bg-amber-50/50',
    border: 'border-hz-gold',
    features: [
      'Unlimited locker slots',
      'Employee/staff expansion',
      'CCTV correlation timestamps',
      'Multi-location management',
      'Exportable audit reports',
      'Escalation management',
      'Priority support & SLA',
    ],
    locked: [],
    current: false,
    gold: true,
  },
];

export default function SubscriptionTiers() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-hz-cream pb-8">
      {/* Header */}
      <div className="hz-green-surface hz-curved-header px-5 pt-12 pb-10 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-hz-green-deep/15 flex items-center justify-center">
            <ArrowLeft size={18} className="text-hz-green-deep" strokeWidth={2.5} />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <HZMonogram size={44} showBackground />
          <div>
            <h1 className="text-hz-green-deep font-black text-xl hz-text-emboss">Zone Plans</h1>
            <p className="text-hz-green-deep/60 text-xs font-semibold">Choose your operating scale</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 space-y-4">
        {tiers.map((tier, i) => {
          const Icon = tier.icon;
          return (
            <motion.div key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-3xl border-2 p-5 hz-card-shadow ${tier.bg} ${tier.border}`}
            >
              {tier.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-hz-green text-hz-green-deep
                  text-[10px] font-black tracking-wider uppercase px-4 py-1 rounded-full hz-card-shadow">
                  ★ Most Popular
                </div>
              )}
              {tier.current && (
                <div className="absolute top-4 right-4 bg-hz-green/15 text-hz-green-dark
                  text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full border border-hz-green/30">
                  Current Plan
                </div>
              )}

              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: `${tier.color}20`, border: `1.5px solid ${tier.color}40` }}>
                  <Icon size={22} style={{ color: tier.color }} strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-hz-green-deep font-black text-lg leading-none">{tier.label}</h3>
                  <p className="text-hz-green-deep/50 text-xs font-semibold">{tier.tagline}</p>
                </div>
                <div className="ml-auto text-right">
                  <span className="text-hz-green-deep font-black text-2xl">{tier.price}</span>
                  <span className="text-hz-green-deep/50 text-sm font-semibold">{tier.period}</span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {tier.features.map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <Check size={13} style={{ color: tier.color }} strokeWidth={3} className="flex-shrink-0" />
                    <span className="text-hz-green-deep/80 text-sm font-medium">{f}</span>
                  </div>
                ))}
              </div>

              {!tier.current && (
                <button className="w-full py-3 rounded-2xl font-black text-sm tracking-wide transition-all active:scale-[0.98]"
                  style={{
                    background: tier.gold ? 'linear-gradient(135deg, #C9A84C, #E8C86A)' : `linear-gradient(135deg, #4CAF1A, #3A9010)`,
                    color: tier.gold ? '#1A1A00' : '#0D2A0D',
                  }}>
                  {tier.id === 'starter' ? 'Downgrade to Starter' : `Upgrade to ${tier.label}`}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Brand attribution */}
      <div className="px-6 pb-6 pt-2">
        <BrandFooter variant="legal" theme="light" />
      </div>
    </div>
  );
}