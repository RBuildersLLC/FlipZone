/**
 * LiveCameraCapture — Forces live camera-only photo capture.
 * Uses capture="environment" (rear camera) on mobile to prevent gallery access.
 * Requests camera permission via getUserMedia before opening the file picker.
 * Shows a branded "Camera Access Required" denial UI if permission is blocked.
 * Calls onCapture({ photo_url, capture_timestamp, upload_timestamp }) on success.
 */
import React, { useRef, useState } from 'react';
import { Camera, CameraOff, AlertTriangle, ShieldAlert } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Permission states: 'idle' | 'granted' | 'denied' | 'checking'
export default function LiveCameraCapture({ label, sublabel, onCapture, loading: externalLoading, disabled }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [permState, setPermState] = useState('idle'); // idle | checking | granted | denied

  const requestCameraAndCapture = async () => {
    setError(null);

    // If already granted, go straight to capture
    if (permState === 'granted') {
      inputRef.current?.click();
      return;
    }

    setPermState('checking');

    // Check permission via Permissions API first (non-blocking)
    if (navigator.permissions) {
      try {
        const result = await navigator.permissions.query({ name: 'camera' });
        if (result.state === 'denied') {
          setPermState('denied');
          return;
        }
      } catch {
        // Permissions API not supported — fall through to getUserMedia
      }
    }

    // Request camera access via getUserMedia to trigger the browser prompt
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Immediately release the stream — we only needed the permission grant
      stream.getTracks().forEach(t => t.stop());
      setPermState('granted');
      // Open the file/camera picker
      inputRef.current?.click();
    } catch (err) {
      // NotAllowedError = user denied; other errors treated as denied too
      setPermState('denied');
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    const captureTimestamp = file.lastModified
      ? new Date(file.lastModified).toISOString()
      : new Date().toISOString();
    const uploadTimestamp = new Date().toISOString();

    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onCapture({ photo_url: file_url, capture_timestamp: captureTimestamp, upload_timestamp: uploadTimestamp });

    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const isLoading = uploading || externalLoading || permState === 'checking';

  // ── Camera denied UI ───────────────────────────────────────────────────────
  if (permState === 'denied') {
    return (
      <div className="rounded-2xl overflow-hidden border border-red-200 bg-red-50">
        <div className="px-4 py-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <CameraOff size={18} className="text-red-500" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <p className="text-red-700 font-black text-sm">Camera Access Required</p>
            <p className="text-red-500 text-xs mt-1 leading-relaxed">
              FlipZone needs camera access to complete photo verification.
            </p>
          </div>
        </div>
        <div className="bg-red-100/60 px-4 py-3 border-t border-red-200 space-y-2">
          <div className="flex items-start gap-2">
            <ShieldAlert size={11} className="text-red-400 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
            <p className="text-red-400 text-[10px] leading-relaxed">
              To enable: go to your browser or device <strong>Settings → Site Permissions → Camera</strong> and allow access for FlipZone.
            </p>
          </div>
          <button
            onClick={() => { setPermState('idle'); setError(null); }}
            className="w-full py-2.5 rounded-xl bg-red-500 text-white font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Camera size={12} strokeWidth={2.5} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── Normal capture UI ──────────────────────────────────────────────────────
  return (
    <div className="space-y-2">
      {/* Hidden file input — camera only, no gallery */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
        disabled={isLoading || disabled}
      />

      <button
        onClick={requestCameraAndCapture}
        disabled={isLoading || disabled}
        className="w-full bg-white border border-hz-green/25 rounded-2xl py-4 flex items-center justify-center gap-2 font-bold text-hz-green-deep text-sm active:scale-[0.97] transition-all disabled:opacity-50 hz-card-shadow"
      >
        {isLoading
          ? <div className="w-4 h-4 border-2 border-hz-green/20 border-t-hz-green rounded-full animate-spin" />
          : <Camera size={16} className="text-hz-green" strokeWidth={2.5} />}
        <span>{isLoading ? (permState === 'checking' ? 'Requesting camera…' : 'Uploading…') : label}</span>
      </button>

      {sublabel && !error && (
        <p className="text-[10px] text-hz-green-deep/35 text-center px-2 leading-relaxed">{sublabel}</p>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          <AlertTriangle size={12} className="text-red-500 flex-shrink-0" strokeWidth={2.5} />
          <span className="text-red-600 text-xs font-semibold">{error}</span>
        </div>
      )}
    </div>
  );
}