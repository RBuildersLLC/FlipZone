/**
 * ManualCodeReceiver — Seller-side view of operator-issued manual codes.
 * Read-only. Seller can view, copy, and share the code. Cannot create/edit/delete.
 */
import React, { useState } from 'react';
import { KeyRound, Copy, Share2, Clock, CheckCircle, Lock } from 'lucide-react';

export default function ManualCodeReceiver({ manualCodePackage = null }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!manualCodePackage?.code) return;
    navigator.clipboard.writeText(manualCodePackage.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (!manualCodePackage) return;
    const text = `FlipZone Manual Access\nLocker: ${manualCodePackage.locker}\nCode: ${manualCodePackage.code}\nExpires: ${manualCodePackage.expiry}\n${manualCodePackage.instructions ? '\nInstructions: ' + manualCodePackage.instructions : ''}`;
    if (navigator.share) {
      navigator.share({ title: 'FlipZone Manual Code', text });
    } else {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  };

  return (
    <div className="bg-white rounded-2xl hz-card-shadow overflow-hidden border border-hz-green/10">
      {/* Section header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-hz-green/8">
        <div className="w-7 h-7 rounded-lg bg-hz-green/10 flex items-center justify-center">
          <KeyRound size={13} className="text-hz-green" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <p className="text-hz-green-deep font-black text-sm">Manual Locker Access</p>
          <p className="text-hz-green-deep/40 text-[10px]">Issued by facility operator · Read-only</p>
        </div>
        <span className="text-[9px] font-black px-2 py-1 rounded-full tracking-wider"
          style={{ background: 'rgba(13,42,13,0.07)', color: 'rgba(13,42,13,0.4)' }}>
          OPERATOR ISSUED
        </span>
      </div>

      {!manualCodePackage ? (
        /* Empty state */
        <div className="px-4 py-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl border-2 border-dashed border-hz-green/20 flex items-center justify-center flex-shrink-0">
            <Lock size={16} className="text-hz-green/25" strokeWidth={2} />
          </div>
          <div>
            <p className="text-hz-green-deep/35 font-bold text-sm">Manual Code: — Empty —</p>
            <p className="text-hz-green-deep/25 text-xs mt-0.5">No manual code has been issued for this transaction.</p>
          </div>
        </div>
      ) : (
        /* Code package */
        <div className="px-4 py-4 space-y-3">
          {/* Code display */}
          <div className="rounded-2xl px-4 py-4 text-center"
            style={{ background: 'linear-gradient(145deg, #0d2410, #071407)', border: '1px solid rgba(76,175,26,0.2)' }}>
            <p className="text-hz-green/50 text-[10px] font-black uppercase tracking-widest mb-1">Manual Code</p>
            <p className="text-white font-black text-3xl tracking-widest leading-none">{manualCodePackage.code}</p>
          </div>

          {/* Details */}
          <div className="bg-hz-cream rounded-xl px-3 py-3 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-hz-green-deep/45 text-xs font-semibold">Locker</span>
              <span className="text-hz-green-deep font-black text-xs">{manualCodePackage.locker}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-hz-green-deep/45 text-xs font-semibold">Expires</span>
              <div className="flex items-center gap-1">
                <Clock size={10} className="text-hz-amber" strokeWidth={2.5} />
                <span className="text-hz-amber font-black text-xs">{manualCodePackage.expiry}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-hz-green-deep/45 text-xs font-semibold">Type</span>
              <span className="text-hz-green-deep font-bold text-xs">{manualCodePackage.type || 'One-Time'}</span>
            </div>
            {manualCodePackage.instructions && (
              <div className="pt-1 border-t border-hz-green/8">
                <p className="text-hz-green-deep/45 text-[10px] font-semibold mb-0.5">Instructions</p>
                <p className="text-hz-green-deep/70 text-xs leading-relaxed">{manualCodePackage.instructions}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs active:scale-95 transition-all"
              style={{ background: copied ? 'rgba(76,175,26,0.15)' : 'rgba(13,42,13,0.06)', color: copied ? '#2D7A0D' : '#0D2A0D' }}
            >
              {copied ? <CheckCircle size={13} strokeWidth={2.5} /> : <Copy size={13} strokeWidth={2.5} />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs bg-hz-green/10 text-hz-green-dark active:scale-95 transition-all"
            >
              <Share2 size={13} strokeWidth={2.5} />
              Share with Buyer
            </button>
          </div>

          <p className="text-hz-green-deep/25 text-[10px] text-center leading-relaxed">
            This code was issued by a facility operator. You cannot modify, generate, or delete manual codes.
          </p>
        </div>
      )}
    </div>
  );
}