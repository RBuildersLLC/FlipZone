import React, { useState } from 'react';
import { Phone, ArrowRight, CheckCircle2 } from 'lucide-react';
import StepShell from './StepShell';

export default function PhoneStep({ onNext, onBack }) {
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidPhone = phone.replace(/\D/g, '').length >= 10;

  const sendCode = () => {
    if (!isValidPhone) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1400);
  };

  const verify = () => {
    if (otp.length < 4) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onNext(); }, 900);
  };

  return (
    <StepShell
      onBack={onBack}
      icon={<Phone size={20} className="text-hz-green" strokeWidth={2} />}
      title="Verify your phone"
      subtitle="Level 2 — Required. We'll send a one-time SMS code."
      badge={<span className="text-[9px] font-black bg-hz-green/15 text-hz-green-deep px-2 py-0.5 rounded-full tracking-widest uppercase">Required</span>}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Mobile Number</label>
          <div className="flex gap-2">
            <div className="bg-white border border-gray-200 rounded-xl px-3 flex items-center text-sm font-bold text-gray-500 shrink-0 shadow-sm">+1</div>
            <input
              type="tel"
              maxLength={14}
              placeholder="(555) 000-0000"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              disabled={sent}
              className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-gray-800 outline-none focus:border-hz-green focus:ring-2 focus:ring-hz-green/10 transition-all disabled:opacity-50 shadow-sm"
            />
          </div>
        </div>

        {!sent ? (
          <button onClick={sendCode} disabled={!isValidPhone || loading}
            className="w-full bg-hz-green text-hz-green-deep font-black text-sm py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-40 shadow-lg shadow-hz-green/25">
            {loading
              ? <div className="w-4 h-4 border-2 border-hz-green-deep/30 border-t-hz-green-deep rounded-full animate-spin" />
              : <><span>Send SMS Code</span><ArrowRight size={15} strokeWidth={3} /></>}
          </button>
        ) : (
          <>
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2.5">
              <CheckCircle2 size={15} className="text-green-500 shrink-0" strokeWidth={2} />
              <p className="text-green-700 text-xs font-semibold flex-1">Code sent to {phone}</p>
              <button onClick={() => setSent(false)} className="text-[10px] text-green-600 font-bold underline">Edit</button>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Enter 6-digit Code</label>
              <input
                type="tel"
                maxLength={6}
                placeholder="· · · · · ·"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-center text-2xl font-black tracking-[0.5em] text-hz-green-deep outline-none focus:border-hz-green focus:ring-2 focus:ring-hz-green/10 transition-all shadow-sm"
              />
              <p className="text-center text-[10px] text-gray-300 mt-1.5 font-medium">Demo — any 4+ digit code works</p>
            </div>

            <button onClick={verify} disabled={otp.length < 4 || loading}
              className="w-full bg-hz-green text-hz-green-deep font-black text-sm py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-40 shadow-lg shadow-hz-green/25">
              {loading
                ? <div className="w-4 h-4 border-2 border-hz-green-deep/30 border-t-hz-green-deep rounded-full animate-spin" />
                : <><span>Verify Phone</span><ArrowRight size={15} strokeWidth={3} /></>}
            </button>
          </>
        )}
      </div>
    </StepShell>
  );
}