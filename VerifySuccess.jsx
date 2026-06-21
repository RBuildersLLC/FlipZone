import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const CHECKLIST = [
  { label: 'Email verified', level: 'L1' },
  { label: 'Phone verified', level: 'L2' },
];

export default function VerifySuccess() {
  const navigate = useNavigate();
  const [showItems, setShowItems] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowItems(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-6 py-12 text-center">

      {/* Icon */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-hz-green/30"
        style={{ background: 'linear-gradient(135deg, #56C41A 0%, #2D7A0D 100%)' }}
      >
        <CheckCircle2 size={44} className="text-white" strokeWidth={2.5} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-black text-hz-green-deep mb-1">You're verified!</h2>
        <p className="text-hz-green font-bold text-sm mb-1">The Hustle Zone.</p>
        <p className="text-gray-400 text-xs font-semibold tracking-widest uppercase mb-8">Buy. Flip. Repeat.</p>
      </motion.div>

      {/* Checklist */}
      {showItems && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-100 rounded-2xl p-5 w-full max-w-xs mb-8 hz-card-shadow text-left space-y-3"
        >
          {CHECKLIST.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="w-7 h-7 rounded-full bg-hz-green flex items-center justify-center shrink-0">
                <CheckCircle2 size={14} className="text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <span className="text-sm font-bold text-gray-800">{item.label}</span>
              </div>
              <span className="text-[9px] font-black bg-hz-green/10 text-hz-green px-2 py-0.5 rounded-full tracking-widest">{item.level}</span>
            </motion.div>
          ))}
          <div className="border-t border-gray-100 pt-3 flex items-center gap-2 mt-1">
            <Zap size={13} className="text-hz-gold" strokeWidth={2.5} />
            <p className="text-xs text-gray-500 font-medium">Upgrade to <span className="font-black text-hz-green-deep">Verified Seller</span> anytime from your profile.</p>
          </div>
        </motion.div>
      )}

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        onClick={() => navigate('/role-select')}
        className="w-full max-w-xs bg-hz-green text-hz-green-deep font-black text-sm py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.97] transition-all shadow-lg shadow-hz-green/30"
      >
        <span>Enter FlipZone™</span>
        <ArrowRight size={16} strokeWidth={3} />
      </motion.button>

      <p className="text-[10px] text-gray-300 font-medium mt-4">Account active · No credit card required</p>
    </div>
  );
}