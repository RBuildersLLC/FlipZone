import React, { useState } from 'react';
import { Star, ArrowRight, Upload, Camera, Shield, ChevronRight } from 'lucide-react';
import StepShell from './StepShell';

export default function SellerBadgeStep({ onNext, onBack }) {
  const [chosen, setChosen] = useState(null); // 'id' | 'selfie' | null
  const [uploaded, setUploaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpload = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setUploaded(true); }, 1800);
  };

  const skip = () => onNext();

  const submit = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onNext(); }, 900);
  };

  return (
    <StepShell
      onBack={onBack}
      icon={<Star size={20} className="text-hz-gold" strokeWidth={2} />}
      title="Verified Seller Badge"
      subtitle="Level 3 — Optional. Unlock the badge to build trust and stand out on The Hustle Zone."
      badge={<span className="text-[9px] font-black bg-hz-gold/15 text-hz-gold px-2 py-0.5 rounded-full tracking-widest uppercase">Optional</span>}
    >
      <div className="space-y-4">

        {/* What you get */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <p className="text-xs font-black text-gray-700 mb-3 uppercase tracking-wider">What you unlock</p>
          <div className="space-y-2.5">
            {[
              { icon: '✓', text: 'Gold "Verified Seller" badge on your profile' },
              { icon: '✓', text: 'Higher trust score & buyer confidence' },
              { icon: '✓', text: 'Priority listing visibility' },
              { icon: '✓', text: 'Access to premium seller features' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-hz-green/15 text-hz-green text-[10px] font-black flex items-center justify-center shrink-0">{item.icon}</span>
                <span className="text-gray-600 text-xs font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Verification options */}
        {!chosen && (
          <div className="space-y-2.5">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Choose verification method</p>
            <button onClick={() => setChosen('id')}
              className="w-full bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-all hover:border-hz-green/30 text-left">
              <div className="w-10 h-10 rounded-xl bg-hz-green/10 flex items-center justify-center shrink-0">
                <Shield size={18} className="text-hz-green" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-gray-800">Government ID</p>
                <p className="text-xs text-gray-400 font-medium">Upload a photo of your ID</p>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </button>
            <button onClick={() => setChosen('selfie')}
              className="w-full bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-all hover:border-hz-green/30 text-left">
              <div className="w-10 h-10 rounded-xl bg-hz-green/10 flex items-center justify-center shrink-0">
                <Camera size={18} className="text-hz-green" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-gray-800">Selfie Verification</p>
                <p className="text-xs text-gray-400 font-medium">Take a quick selfie to confirm identity</p>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </button>
          </div>
        )}

        {/* Upload UI */}
        {chosen && !uploaded && (
          <div className="space-y-3">
            <button onClick={() => setChosen(null)}
              className="text-[10px] text-gray-400 font-bold underline">← Choose different method</button>
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-hz-green/10 flex items-center justify-center">
                {chosen === 'id' ? <Upload size={22} className="text-hz-green" /> : <Camera size={22} className="text-hz-green" />}
              </div>
              <div>
                <p className="text-sm font-black text-gray-700">
                  {chosen === 'id' ? 'Upload your ID photo' : 'Take a selfie'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {chosen === 'id' ? 'JPG or PNG · Max 10MB' : 'Front-facing camera · Good lighting'}
                </p>
              </div>
              <button onClick={handleUpload} disabled={loading}
                className="bg-hz-green text-hz-green-deep font-black text-sm px-6 py-3 rounded-xl flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50 shadow-md shadow-hz-green/20">
                {loading
                  ? <div className="w-4 h-4 border-2 border-hz-green-deep/30 border-t-hz-green-deep rounded-full animate-spin" />
                  : <><span>{chosen === 'id' ? 'Upload Photo' : 'Open Camera'}</span><ArrowRight size={14} strokeWidth={3} /></>}
              </button>
            </div>
            <p className="text-center text-[10px] text-gray-300 font-medium">Demo — tap to simulate upload</p>
          </div>
        )}

        {/* Uploaded success */}
        {uploaded && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3.5 flex items-start gap-3">
            <span className="text-green-500 text-lg leading-none mt-0.5">✓</span>
            <div>
              <p className="text-green-800 text-sm font-black">Document submitted!</p>
              <p className="text-green-600 text-xs mt-0.5">We'll review and activate your badge within 24 hours.</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2.5 pt-2">
          {(uploaded || chosen === null) && (
            <button onClick={uploaded ? submit : skip}
              disabled={loading}
              className="w-full bg-hz-green text-hz-green-deep font-black text-sm py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-50 shadow-lg shadow-hz-green/25">
              {loading
                ? <div className="w-4 h-4 border-2 border-hz-green-deep/30 border-t-hz-green-deep rounded-full animate-spin" />
                : uploaded
                  ? <><span>Complete Setup</span><ArrowRight size={15} strokeWidth={3} /></>
                  : <><span>Start Selling Now</span><ArrowRight size={15} strokeWidth={3} /></>}
            </button>
          )}
          {!uploaded && (
            <button onClick={skip}
              className="w-full text-gray-400 font-bold text-sm py-3 rounded-2xl border border-gray-200 bg-white active:scale-[0.97] transition-all">
              Skip for now — I'll do this later
            </button>
          )}
        </div>
      </div>
    </StepShell>
  );
}