import React, { useState, useRef, useEffect } from 'react';
import { useMotionValue, animate } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import FZMonogram from './FZMonogram';

const COUNT = 6;
const STEP  = 360 / COUNT;
const R     = 112;
const SIZE  = 320;
const CX    = SIZE / 2;
const NODE  = 52;
const BASE  = 90; // 6 o'clock = bottom

const SPRING = { type: 'spring', stiffness: 160, damping: 28, mass: 1.2 };

function toRad(d) { return (d * Math.PI) / 180; }

const ICONS = {
  package:    { d: 'M12 2l8.66 5v10L12 22l-8.66-5V7L12 2zm0 10l8.66-5M12 12L3.34 7M12 12v10', stroke: true },
  zap:        { d: 'M13 2 4.09 12.96H11L10 22l8.91-10.96H13L13 2z', stroke: false },
  lock:       { d: 'M18 11h-1V7A5 5 0 0 0 7 7v4H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zm-6 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm3-6H9V7a3 3 0 0 1 6 0v4z', stroke: false },
  star:       { d: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', stroke: false },
  barChart:   { d: 'M18 20V10M12 20V4M6 20v-6', stroke: true },
  creditCard: { d: 'M1 4h22v3H1zm0 5h22v11a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V9zm5 5h4m-4 3h2', stroke: true },
};

function SpokeIcon({ iconKey, size = 22, color, isActive }) {
  const cfg = ICONS[iconKey] || ICONS.lock;
  const c   = isActive ? 'white' : color;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d={cfg.d}
        fill={cfg.stroke ? 'none' : c}
        stroke={cfg.stroke ? c : 'none'}
        strokeWidth={cfg.stroke ? 2 : 0}
        strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

export default function RadialHub({ spokes, onPress }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const activeIdxRef = useRef(0);

  const wheelDeg  = useMotionValue(0);
  const targetDeg = useRef(0);
  const springCtl = useRef(null);
  const rafId     = useRef(null);

  // DOM refs
  const nodeWrapRef = useRef([]);
  const nodeBodyRef = useRef([]);
  // We DON'T render orbital labels for the active node — just show it below.
  // But we still need labels for all non-active nodes on the orbit.
  const labelRef    = useRef([]);

  // Ref to the bottom label element (shown below the dial for active node)
  const bottomLabelRef = useRef(null);

  useEffect(() => {
    const tick = () => {
      const w   = wheelDeg.get();

      // Determine which spoke is closest to BASE (bottom / 6 o'clock)
      let closestIdx = 0;
      let minDist = Infinity;
      spokes.forEach((_, i) => {
        const ang = ((BASE + i * STEP + w) % 360 + 360) % 360;
        const dist = Math.min(Math.abs(ang - BASE), 360 - Math.abs(ang - BASE));
        if (dist < minDist) { minDist = dist; closestIdx = i; }
      });
      if (closestIdx !== activeIdxRef.current) {
        activeIdxRef.current = closestIdx;
        setActiveIdx(closestIdx);
      }

      const act = activeIdxRef.current;

      spokes.forEach((spoke, i) => {
        const isActive = i === act;
        const ang = BASE + i * STEP + w;
        const rad = toRad(ang);
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        // 1. Move node wrapper
        const nw = nodeWrapRef.current[i];
        if (nw) {
          nw.style.left = `${CX + cos * R - NODE / 2}px`;
          nw.style.top  = `${CX + sin * R - NODE / 2}px`;
        }

        // 2. Style the card (no rotation on card itself — it stays axis-aligned)
        const nb = nodeBodyRef.current[i];
        if (nb) {
          nb.style.background = isActive ? spoke.color : 'white';
          nb.style.border     = isActive ? 'none' : `1.5px solid ${spoke.color}35`;
          nb.style.boxShadow  = isActive
            ? `0 6px 20px ${spoke.color}55, 0 0 0 3px ${spoke.color}22`
            : '0 2px 10px rgba(13,42,13,0.09)';
          // No rotation — wrapper is positioned via left/top so card stays upright always
          nb.style.transform  = 'none';
        }

        // 3. Orbital label — position based on which side of the dial the node is on
        const lb = labelRef.current[i];
        if (lb) {
          // Node centre in px
          const nx = CX + cos * R;
          const ny = CX + sin * R;
          const GAP = NODE / 2 + 8; // gap from node edge to label

          let lx, ly, tx, align;

          // Quadrant detection using sin/cos
          // sin < 0 = upper half, sin > 0 = lower half
          // cos > 0 = right half, cos < 0 = left half
          const isUpperHalf  = sin < -0.15;   // top arc (top-left + top-right)
          const isLowerHalf  = sin > 0.15;    // bottom arc (bottom-left + bottom-right)
          const isSideStrip  = !isUpperHalf && !isLowerHalf; // pure left / pure right

          if (isUpperHalf) {
            // Top-left & top-right — label above the icon, centred
            lx = nx;
            ly = ny - GAP;
            tx = 'translate(-50%, -100%)';
            align = 'center';
          } else if (isLowerHalf) {
            // Bottom-left & bottom-right — label below the icon, centred
            lx = nx;
            ly = ny + GAP;
            tx = 'translate(-50%, 0%)';
            align = 'center';
          } else if (cos >= 0) {
            // Pure right side — label to the right
            lx = nx + GAP;
            ly = ny;
            tx = 'translate(0%, -50%)';
            align = 'left';
          } else {
            // Pure left side — label to the left
            lx = nx - GAP;
            ly = ny;
            tx = 'translate(-100%, -50%)';
            align = 'right';
          }

          lb.style.left      = `${lx}px`;
          lb.style.top       = `${ly}px`;
          lb.style.transform = tx;
          lb.style.textAlign = align;
          lb.style.opacity   = isActive ? '0' : '0.65';
        }
      });

      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, [spokes, wheelDeg]);

  const go = (dir) => {
    targetDeg.current += dir * STEP;
    if (springCtl.current) springCtl.current.stop();
    springCtl.current = animate(wheelDeg, targetDeg.current, SPRING);
    // Active index is now derived from wheel position in the RAF tick
  };

  const activeSpoke = spokes[activeIdx];

  return (
    <div style={{ userSelect: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {/* Wheel */}
      <div style={{ position: 'relative', width: SIZE, height: SIZE, flexShrink: 0 }}>

        {/* Static SVG rings */}
        <svg width={SIZE} height={SIZE}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}>
          <defs>
            <radialGradient id="rhHubGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#4CAF1A" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#4CAF1A" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx={CX} cy={CX} r={R}
            fill="none" stroke="#0D2A0D" strokeWidth="1.2" strokeOpacity="0.09"
            strokeDasharray="4 13" />
          <circle cx={CX} cy={CX} r={R - 28}
            fill="none" stroke="#4CAF1A" strokeWidth="0.7" strokeOpacity="0.07" />
          <circle cx={CX} cy={CX} r={52} fill="url(#rhHubGlow)" />

        </svg>

        {/* Nodes */}
        {spokes.map((spoke, i) => (
          <div
            key={spoke.id}
            ref={el => nodeWrapRef.current[i] = el}
            onClick={() => onPress && setTimeout(() => onPress(spoke), 160)}
            style={{
              position: 'absolute', width: NODE, height: NODE,
              cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
            }}
          >
            <div
              ref={el => nodeBodyRef.current[i] = el}
              style={{
                width: '100%', height: '100%',
                borderRadius: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transformOrigin: 'center center',
                willChange: 'transform',
                background: i === activeIdx ? spoke.color : 'white',
                border: i === activeIdx ? 'none' : `1.5px solid ${spoke.color}35`,
                boxShadow: i === activeIdx
                  ? `0 6px 20px ${spoke.color}55, 0 0 0 3px ${spoke.color}22`
                  : '0 2px 10px rgba(13,42,13,0.09)',
              }}
            >
              <SpokeIcon iconKey={spoke.iconKey} size={22} color={spoke.color} isActive={i === activeIdx} />
            </div>
          </div>
        ))}

        {/* Orbital labels — hidden for active node */}
        {spokes.map((spoke, i) => (
          <div
            key={`lbl-${spoke.id}`}
            ref={el => labelRef.current[i] = el}
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              willChange: 'transform, left, top',
              fontSize: 10,
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '0.04em',
              lineHeight: 1.3,
              color: '#1A3A1A',
              opacity: i === activeIdx ? 0 : 0.65,
              fontWeight: 600,
              transition: 'opacity 0.25s ease, left 0.18s ease, top 0.18s ease, transform 0.18s ease',
            }}
          >
            {spoke.label}
          </div>
        ))}

        {/* HZ Hub — dead center */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10, pointerEvents: 'none',
        }}>
          <FZMonogram size={76} showBackground />
        </div>
      </div>

      {/* Below dial: active label + arrows */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: SIZE, padding: '0 16px', marginTop: -8,
      }}>
        <button onClick={() => go(-1)} style={arrowBtn}>
          <ChevronLeft size={17} color="#0D2A0D" strokeWidth={2.5} style={{ opacity: 0.6 }} />
        </button>

        {/* Active module label */}
        <div style={{ textAlign: 'center' }}>
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            fontFamily: 'Inter, sans-serif',
            color: activeSpoke?.color ?? '#4CAF1A',
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
          }}>
            {activeSpoke?.label}
          </span>
        </div>

        <button onClick={() => go(1)} style={arrowBtn}>
          <ChevronRight size={17} color="#0D2A0D" strokeWidth={2.5} style={{ opacity: 0.6 }} />
        </button>
      </div>
    </div>
  );
}

const arrowBtn = {
  width: 36, height: 36, borderRadius: '50%',
  border: '1px solid rgba(76,175,26,0.2)',
  background: 'white', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '0 2px 8px rgba(13,42,13,0.10)',
  WebkitTapHighlightColor: 'transparent',
  flexShrink: 0,
};