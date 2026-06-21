import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FZMonogram from '../components/FZMonogram';
import BrandFooter from '../components/BrandFooter';

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate('/pin'), 2800);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #5CC820 0%, #4CAF1A 35%, #2D7A0D 80%, #1A5008 100%)' }}>

      {/* Deep glow beneath monogram — no rings, pure light diffusion */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.10) 0%, rgba(76,175,26,0.18) 40%, transparent 70%)' }} />
      </div>
      {/* Bottom light wash */}
      <div className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(13,42,13,0.35) 0%, transparent 100%)' }} />

      {/* Main monogram */}
      <div className="hz-pulse-glow relative z-10">
        <FZMonogram size={160} showBackground />
      </div>

      {/* Wordmark */}
      <div className="mt-8 text-center hz-fade-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
        <h1 className="text-hz-green-deep font-black text-3xl tracking-tight hz-text-emboss">
          FlipZone™
        </h1>
        <p className="text-hz-green-deep font-black text-lg tracking-tight mt-1 hz-text-emboss">
          The Hustle Zone.
        </p>
        <p className="text-hz-green-deep/55 text-xs font-bold tracking-widest uppercase mt-1">
          Buy. Flip. Repeat.
        </p>
      </div>

      {/* Loading dots + brand attribution pinned to bottom */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-4 pb-6 px-6">
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-hz-green-deep/40 animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
        <BrandFooter />
      </div>
    </div>
  );
}