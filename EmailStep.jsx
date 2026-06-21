import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import StepShell from './StepShell';

export default function EmailStep({ onNext }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const sendLink = () => {
    if (!isValidEmail) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1400);
  };

  const confirmed = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onNext(); }, 800);
  };

  return (
    <StepShell
      icon={<Mail size={20} className="text-hz-green" strokeWidth={2} />}
      title="Verify your email"
      subtitle="Level 1 — Required. We'll send a verification link to activate your account."
      badge={<span className="text-[9px] font-black bg-hz-green/15 text-hz-green-deep px-2 py-0.5 rounded-full tracking-widest uppercase">Required</span>}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={sent}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-gray-800 outline-none focus:border-hz-green focus:ring-2 focus:ring-hz-green/10 transition-all disabled:opacity-50 shadow-sm"
          />
        </div>

        {!sent ? (
          <button onClick={sendLink} disabled={!isValidEmail || loading}
            className="w-full bg-hz-green text-hz-green-deep font-black text-sm py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-40 shadow-lg shadow-hz-green/25">
            {loading
              ? <div className="w-4 h-4 border-2 border-hz-green-deep/30 border-t-hz-green-deep rounded-full animate-spin" />
              : <><span>Send Verification Link</span><ArrowRight size={15} strokeWidth={3} /></>}
          </button>
        ) : (
          <>
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3.5 flex items-start gap-3">
              <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" strokeWidth={2} />
              <div>
                <p className="text-green-800 text-sm font-bold">Verification link sent!</p>
                <p className="text-green-600 text-xs mt-0.5">Check <span className="font-semibold">{email}</span> and click the link to verify.</p>
                <button onClick={() => setSent(false)} className="text-green-600 text-[10px] font-bold underline mt-1">Use a different email</button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl px-4 py-4">
              <p className="text-gray-500 text-xs font-semibold mb-3">✓ Already clicked the link in your email?</p>
              <button onClick={confirmed} disabled={loading}
                className="w-full bg-hz-green-deep text-white font-black text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-50">
                {loading
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><span>I've verified my email</span><ArrowRight size={15} strokeWidth={3} /></>}
              </button>
            </div>

            <p className="text-center text-[10px] text-gray-300 font-medium">Demo mode — tap "I've verified" to continue</p>
          </>
        )}
      </div>
    </StepShell>
  );
}