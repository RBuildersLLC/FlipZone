import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import FZMonogram from '../components/FZMonogram';

const SLIDES = [
  {
    id: 'intro',
    bg: 'hz-forest',
    content: (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 180, damping: 18, delay: 0.1 }}>
          <FZMonogram size={120} showBackground />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <p className="text-hz-green text-xs font-bold tracking-[0.25em] uppercase mt-8 mb-2">Introducing</p>
          <h1 className="text-white font-black text-5xl leading-none" style={{ textShadow: '0 0 40px rgba(76,175,26,0.5)' }}>
            FlipZone™
          </h1>
          <p className="text-white/50 text-sm font-semibold mt-3 tracking-wide">Secure Marketplace Infrastructure</p>
        </motion.div>
      </div>
    ),
  },
  {
    id: 'problem',
    bg: 'dark',
    content: (
      <div className="flex flex-col justify-center h-full px-8">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-hz-green text-xs font-bold tracking-[0.2em] uppercase mb-4">The Problem</motion.p>
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-white font-black text-3xl leading-tight mb-6">
          Peer-to-peer commerce<br /><span className="text-hz-green">lacks a secure layer.</span>
        </motion.h2>
        {['No neutral handoff mechanism', 'No verified access control', 'No accountability trail', 'No trust infrastructure'].map((t, i) => (
          <motion.div key={t} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
            className="flex items-center gap-3 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-hz-green flex-shrink-0" />
            <span className="text-white/70 text-sm font-medium">{t}</span>
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    id: 'solution',
    bg: 'green',
    content: (
      <div className="flex flex-col justify-center h-full px-8">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-hz-green-deep text-xs font-bold tracking-[0.2em] uppercase mb-4">The Solution</motion.p>
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-hz-green-deep font-black text-3xl leading-tight mb-2 hz-text-emboss">
          FlipZone™ is the<br />infrastructure layer.
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="text-hz-green-deep/70 text-sm mb-6 leading-relaxed">
          Secure lockers. Identity-linked codes. Audit trails. Trust scoring. All orchestrated through a single platform.
        </motion.p>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
          className="bg-hz-green-deep/15 rounded-2xl px-5 py-4 border border-hz-green-deep/20">
          <p className="text-hz-green-deep font-black text-lg">Seller → Locker → Code → Buyer</p>
          <p className="text-hz-green-deep/60 text-xs mt-1">End-to-end orchestrated commerce</p>
        </motion.div>
      </div>
    ),
  },
  {
    id: 'architecture',
    bg: 'hz-forest',
    content: (
      <div className="flex flex-col justify-center h-full px-8">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-hz-green text-xs font-bold tracking-[0.2em] uppercase mb-4">Platform Architecture</motion.p>
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-white font-black text-3xl leading-tight mb-6">
          Three roles.<br /><span className="text-hz-green">One ecosystem.</span>
        </motion.h2>
        {[
          { role: 'Seller', color: '#4CAF1A', desc: 'Manages lockers, orchestrates transactions, builds reputation' },
          { role: 'Buyer', color: '#56C41A', desc: 'Activates credentials, collects items, rates transactions' },
          { role: 'Operator', color: '#C9A84C', desc: 'Oversees facilities, audits access, manages staff tiers' },
        ].map((r, i) => (
          <motion.div key={r.role} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.12 }}
            className="flex items-center gap-4 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${r.color}20`, border: `1.5px solid ${r.color}40` }}>
              <span className="font-black text-sm" style={{ color: r.color }}>{r.role[0]}</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm">{r.role}</p>
              <p className="text-white/45 text-xs">{r.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    id: 'security',
    bg: 'dark',
    content: (
      <div className="flex flex-col justify-center h-full px-8">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-hz-green text-xs font-bold tracking-[0.2em] uppercase mb-4">Security Layer</motion.p>
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-white font-black text-3xl leading-tight mb-6">
          Zero-trust<br /><span className="text-hz-green">access control.</span>
        </motion.h2>
        <div className="space-y-3">
          {[
            { label: 'Randomized Codes', sub: '6-8 char alphanumeric, expiry-gated' },
            { label: 'Identity-Linked', sub: 'Every credential tied to verified account' },
            { label: 'Audit Trail', sub: 'Immutable event log with CCTV correlation' },
            { label: 'Revocation Engine', sub: 'Instant code invalidation and escalation' },
          ].map((item, i) => (
            <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
              className="bg-white/6 border border-white/8 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-hz-green flex-shrink-0" />
              <div>
                <p className="text-white font-bold text-sm">{item.label}</p>
                <p className="text-white/45 text-xs">{item.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'subscriptions',
    bg: 'green',
    content: (
      <div className="flex flex-col justify-center h-full px-8">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-hz-green-deep text-xs font-bold tracking-[0.2em] uppercase mb-4">Business Model</motion.p>
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-hz-green-deep font-black text-3xl leading-tight mb-6 hz-text-emboss">
          Subscription-tiered<br />feature gating.
        </motion.h2>
        {[
          { tier: 'Starter', color: '#4CAF1A', features: 'Up to 5 lockers · Basic audit' },
          { tier: 'Business', color: '#2D7A0D', features: 'Unlimited lockers · Staff slots' },
          { tier: 'Enterprise', color: '#C9A84C', features: 'CCTV integration · SLA + API access' },
        ].map((t, i) => (
          <motion.div key={t.tier} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.12 }}
            className="flex items-center justify-between bg-hz-green-deep/12 rounded-xl px-4 py-3 mb-2 border border-hz-green-deep/15">
            <div>
              <p className="text-hz-green-deep font-black text-sm">{t.tier}</p>
              <p className="text-hz-green-deep/60 text-xs">{t.features}</p>
            </div>
            <div className="w-3 h-3 rounded-full" style={{ background: t.color }} />
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    id: 'vision',
    bg: 'hz-forest',
    content: (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 160, damping: 20 }}>
          <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'rgba(76,175,26,0.15)', border: '1.5px solid rgba(76,175,26,0.3)', boxShadow: '0 0 40px rgba(76,175,26,0.2)' }}>
            <span className="text-hz-green font-black text-3xl">∞</span>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <p className="text-hz-green text-xs font-bold tracking-[0.2em] uppercase mb-3">The Vision</p>
          <h2 className="text-white font-black text-3xl leading-tight mb-4">
            The operating system<br /><span className="text-hz-green">for physical commerce.</span>
          </h2>
          <p className="text-white/55 text-sm leading-relaxed">
            From single-facility pilots to enterprise multi-location deployments — FlipZone™ scales with every transaction.
          </p>
        </motion.div>
      </div>
    ),
  },
  {
    id: 'cta',
    bg: 'hz-forest',
    cta: true,
    content: null,
  },
];

const BG_STYLES = {
  'hz-forest': 'hz-forest-surface',
  dark: 'bg-[#080F08]',
  green: 'hz-green-surface',
};

export default function BrandSlideshow() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const DURATION = 5000;

  const next = useCallback(() => setCurrent(c => (c + 1) % SLIDES.length), []);
  const prev = useCallback(() => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(next, DURATION);
    return () => clearTimeout(t);
  }, [current, playing, next]);

  const slide = SLIDES[current];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none" style={{ background: '#071A07' }}>

      {/* Slide */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.55, ease: 'easeInOut' }}
          className={`absolute inset-0 ${BG_STYLES[slide.bg] || 'hz-forest-surface'}`}
        >
          {/* Ambient glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-72 h-56 pointer-events-none opacity-30" style={{ background: 'radial-gradient(ellipse at center, #4CAF1A 0%, transparent 70%)' }} />

          {slide.cta ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 180, damping: 18 }}>
                <FZMonogram size={100} showBackground />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <p className="text-hz-green text-xs font-bold tracking-[0.22em] uppercase mt-8 mb-2">Ready to Explore</p>
                <h2 className="text-white font-black text-4xl leading-none mb-6" style={{ textShadow: '0 0 40px rgba(76,175,26,0.4)' }}>FlipZone™</h2>
                <div className="flex flex-col gap-3 items-center">
                  <button onClick={() => navigate('/role-select')}
                    className="w-56 bg-hz-green text-hz-green-deep font-black text-sm py-4 rounded-2xl hz-glow active:scale-95 transition-transform">
                    Launch Demo
                  </button>
                  <button onClick={() => navigate('/demo')}
                    className="w-56 bg-white/10 border border-white/15 text-white font-bold text-sm py-4 rounded-2xl active:scale-95 transition-transform">
                    Back to Overview
                  </button>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="h-full">{slide.content}</div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 flex gap-1 px-4 pt-12 z-20">
        {SLIDES.map((s, i) => (
          <button key={s.id} onClick={() => setCurrent(i)} className="flex-1 h-[3px] rounded-full overflow-hidden bg-white/20">
            {i === current && playing ? (
              <motion.div className="h-full bg-hz-green rounded-full" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: DURATION / 1000, ease: 'linear' }} />
            ) : (
              <div className={`h-full rounded-full ${i < current ? 'bg-hz-green' : 'bg-transparent'}`} />
            )}
          </button>
        ))}
      </div>

      {/* Controls overlay */}
      <div className="absolute top-0 left-0 right-0 flex items-start justify-between px-4 pt-6 z-30">
        <button onClick={() => navigate('/demo')} className="w-9 h-9 rounded-xl bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <X size={16} className="text-white/80" strokeWidth={2.5} />
        </button>
        <button onClick={() => setPlaying(p => !p)} className="w-9 h-9 rounded-xl bg-black/30 backdrop-blur-sm flex items-center justify-center">
          {playing ? <Pause size={14} className="text-white/80" strokeWidth={2.5} /> : <Play size={14} className="text-white/80" strokeWidth={2.5} />}
        </button>
      </div>

      {/* Side tap zones */}
      <button onClick={prev} className="absolute left-0 top-0 bottom-0 w-1/3 z-10" style={{ WebkitTapHighlightColor: 'transparent' }} />
      <button onClick={next} className="absolute right-0 top-0 bottom-0 w-1/3 z-10" style={{ WebkitTapHighlightColor: 'transparent' }} />

      {/* Slide counter */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center z-20 gap-3 items-center">
        <button onClick={prev} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
          <ChevronLeft size={14} className="text-white/60" />
        </button>
        <span className="text-white/40 text-xs font-bold tabular-nums">{current + 1} / {SLIDES.length}</span>
        <button onClick={next} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
          <ChevronRight size={14} className="text-white/60" />
        </button>
      </div>
    </div>
  );
}