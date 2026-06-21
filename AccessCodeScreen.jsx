/**
 * AccessCodeScreen — shows a single FlipZone-generated access code.
 *
 * ARCHITECTURE:
 *   One credential per transaction. The QR (in QRAccessBlock) is always
 *   derived from this same code string — never an independent credential.
 *   Manual Codes (operator-issued) are separate and NOT shown here.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Share2, Clock, MapPin, CheckCircle, RefreshCw } from 'lucide-react';
import FZMonogram from '../components/FZMonogram';
import { motion } from 'framer-motion';

function generateCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const parts = [
    Array.from({ length: 2 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''),
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''),
    Array.from({ length: 2 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''),
  ];
  return `FZ-${parts[0]}-${parts[1]}-${parts[2]}`;
}

export default function AccessCodeScreen() {
  const navigate = useNavigate();
  const [code] = useState(generateCode);
  const [copied, setCopied] = useState(false);
  const [seconds, setSeconds] = useState(8340); // ~2h 19m

  useEffect(() => {
    const t = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}h ${m.toString().padStart(2, '0')}m ${sec.toString().padStart(2, '0')}s`;
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen hz-forest-surface flex flex-col relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none">
        <div className="w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, #4CAF1A 0%, transparent 70%)' }} />
      </div>

      {/* Top nav */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-12 pb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-white/8 flex items-center justify-center">
          <ArrowLeft size={18} className="text-white" strokeWidth={2.5} />
        </button>
        <span className="text-white/50 text-sm font-bold">Access Code</span>
        <button className="w-9 h-9 rounded-xl bg-white/8 flex items-center justify-center">
          <Share2 size={16} className="text-white/60" />
        </button>
      </div>

      {/* Locker info */}
      <div className="relative z-10 px-5 mb-6">
        <div className="bg-white/8 rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-hz-green/20 flex items-center justify-center">
            <MapPin size={18} className="text-hz-green" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-white font-bold text-sm">Locker B-07</p>
            <p className="text-white/50 text-xs">Eastside Plaza · Unit 2, Row B</p>
          </div>
        </div>
      </div>

      {/* Main code display */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="w-full"
        >
          <div className="bg-hz-green/12 border border-hz-green/25 rounded-3xl p-8 text-center mb-4">
            <p className="text-hz-green/60 text-xs font-bold tracking-widest uppercase mb-4">Your Secure Code</p>
            <p className="text-white font-black text-4xl tracking-wider leading-none mb-2"
              style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '0.15em' }}>
              {code}
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-4">
              <Clock size={12} className="text-hz-green/60" />
              <span className="text-hz-green/70 text-xs font-bold">{fmt(seconds)} remaining</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 rounded-full bg-white/10 mb-6 overflow-hidden">
            <div className="h-full rounded-full bg-hz-green transition-all duration-1000"
              style={{ width: `${(seconds / 9000) * 100}%` }} />
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleCopy}
              className="bg-hz-green rounded-2xl py-4 flex items-center justify-center gap-2 font-black text-hz-green-deep active:scale-95 transition-transform">
              {copied ? <CheckCircle size={18} strokeWidth={2.5} /> : <Copy size={18} strokeWidth={2.5} />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
            <button className="bg-white/10 border border-white/15 rounded-2xl py-4 flex items-center justify-center gap-2 font-bold text-white/70 active:scale-95 transition-transform">
              <RefreshCw size={18} strokeWidth={2} />
              Refresh
            </button>
          </div>
        </motion.div>
      </div>

      {/* Bottom FZ anchor */}
      <div className="relative z-10 flex justify-center pb-12">
        <FZMonogram size={36} showBackground />
      </div>
    </div>
  );
}