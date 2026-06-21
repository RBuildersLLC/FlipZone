import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Delete, Fingerprint } from 'lucide-react';
import FZMonogram from '../components/FZMonogram';
import BrandFooter from '../components/BrandFooter';

const PIN_LENGTH = 6;

export default function PINEntry() {
  const navigate = useNavigate();
  const [pin, setPin] = useState([]);
  const [shake, setShake] = useState(false);

  const handleKey = (val) => {
    if (pin.length >= PIN_LENGTH) return;
    const next = [...pin, val];
    setPin(next);
    if (next.length === PIN_LENGTH) {
      setTimeout(() => navigate('/role-select'), 300);
    }
  };

  const handleDelete = () => setPin(p => p.slice(0, -1));

  const keys = ['1','2','3','4','5','6','7','8','9','','0','del'];

  return (
    <div className="hz-forest-surface min-h-screen flex flex-col items-center justify-between px-6 py-10 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <div className="w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, #4CAF1A 0%, transparent 70%)' }} />
      </div>

      {/* Logo */}
      <div className="relative z-10 mb-10">
        <FZMonogram size={64} showBackground />
      </div>

      <div className={`relative z-10 text-center mb-10 ${shake ? 'animate-shake' : ''}`}>
        <h2 className="text-white font-black text-xl tracking-tight mb-1">Enter Access PIN</h2>
        <p className="text-white/40 text-sm font-medium">Secure entry to FlipZone™</p>

        {/* PIN dots */}
        <div className="flex gap-4 justify-center mt-8">
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <div key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-150
                ${i < pin.length
                  ? 'bg-hz-green border-hz-green scale-110 shadow-[0_0_8px_rgba(76,175,26,0.6)]'
                  : 'bg-transparent border-white/30'
                }`}
            />
          ))}
        </div>
      </div>

      {/* Keypad */}
      <div className="relative z-10 grid grid-cols-3 gap-4 w-full max-w-xs">
        {keys.map((key, i) => {
          if (key === '') return <div key={i} />;
          if (key === 'del') return (
            <button key={i} onClick={handleDelete}
              className="h-16 rounded-2xl bg-white/8 flex items-center justify-center active:scale-95 transition-transform">
              <Delete size={22} className="text-white/60" />
            </button>
          );
          return (
            <button key={i} onClick={() => handleKey(key)}
              className="h-16 rounded-2xl bg-white/10 border border-white/8 flex items-center justify-center
                font-bold text-2xl text-white active:scale-95 active:bg-hz-green/20 transition-all">
              {key}
            </button>
          );
        })}
      </div>

      {/* Biometric */}
      <button className="relative z-10 mt-8 flex items-center gap-2 text-hz-green/70 text-sm font-semibold">
        <Fingerprint size={20} />
        Use Biometric
      </button>

      {/* Skip for dev */}
      <button onClick={() => navigate('/role-select')}
        className="relative z-10 mt-4 text-white/20 text-xs">
        Skip (Dev)
      </button>

      {/* Brand attribution — flows naturally below skip button, never overlaps */}
      <div className="relative z-10 mt-10 pb-2">
        <BrandFooter />
      </div>
    </div>
  );
}