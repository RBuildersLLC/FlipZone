/**
 * NotificationSoundSettings — Buyer & Seller only.
 * Lets users customize notification sounds per event category.
 * Supports: Default FlipZone sound, Built-in library, Custom upload, Voice recording.
 * Preferences are saved to NotificationPreferences entity and follow the user across devices.
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Bell, Volume2, Upload, Mic, MicOff,
  Play, Square, CheckCircle, ChevronDown, ChevronUp,
  Music, RotateCcw, Save
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import FZMonogram from '../components/FZMonogram';

// ── Notification categories ──────────────────────────────────────────────────
const BUYER_CATEGORIES = [
  { key: 'package_delivered',       label: 'Package Delivered',            emoji: '📦' },
  { key: 'package_ready',           label: 'Package Ready for Pickup',     emoji: '🔔' },
  { key: 'pickup_reminder',         label: 'Pickup Reminder',              emoji: '⏰' },
  { key: 'deadline_approaching',    label: 'Pickup Deadline Approaching',  emoji: '⚠️' },
  { key: 'package_retrieved',       label: 'Package Retrieved Successfully',emoji: '✅' },
  { key: 'access_code_generated',   label: 'Access Code Generated',        emoji: '🔑' },
];

const SELLER_CATEGORIES = [
  { key: 'seller_shipment_received',label: 'Shipment Received',            emoji: '🚚' },
  { key: 'seller_dropoff_confirmed',label: 'Drop-Off Confirmed',           emoji: '🔒' },
  { key: 'buyer_retrieved_package', label: 'Buyer Retrieved Package',      emoji: '✅' },
  { key: 'deadline_approaching',    label: 'Pickup Deadline Approaching',  emoji: '⚠️' },
  { key: 'account_notifications',   label: 'Account Notifications',        emoji: '👤' },
];

// ── Built-in sound library ────────────────────────────────────────────────────
const SOUND_LIBRARY = [
  { id: 'fz_chime',    label: 'FlipZone Chime',    emoji: '🎵' },
  { id: 'fz_ping',     label: 'FZ Ping',           emoji: '🔔' },
  { id: 'fz_alert',    label: 'FZ Alert',          emoji: '⚡' },
  { id: 'fz_success',  label: 'FZ Success',        emoji: '✨' },
  { id: 'fz_soft',     label: 'Soft Tone',         emoji: '🌿' },
  { id: 'fz_pulse',    label: 'Pulse',             emoji: '💚' },
];

const DEFAULT_PREF = { mode: 'default', sound_url: null, label: null };

// ── Voice recorder hook ───────────────────────────────────────────────────────
function useVoiceRecorder() {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const start = async () => {
    setAudioURL(null);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    mediaRecorderRef.current = mr;
    chunksRef.current = [];
    mr.ondataavailable = e => chunksRef.current.push(e.data);
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      setAudioURL(URL.createObjectURL(blob));
      stream.getTracks().forEach(t => t.stop());
    };
    mr.start();
    setRecording(true);
  };

  const stop = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const getBlob = () => {
    if (!chunksRef.current.length) return null;
    return new Blob(chunksRef.current, { type: 'audio/webm' });
  };

  return { recording, audioURL, start, stop, getBlob, setAudioURL };
}

// ── SoundModeSelector — per-category picker ──────────────────────────────────
function SoundModeSelector({ categoryKey, label, emoji, pref, onChange }) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(pref?.mode || 'default');
  const [selectedLib, setSelectedLib] = useState(pref?.mode === 'library' ? pref.label : null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef(null);
  const voice = useVoiceRecorder();

  const currentMode = pref?.mode || 'default';
  const modeLabel = {
    default: 'FlipZone Default',
    library: pref?.label || 'Library Sound',
    upload: 'Custom Upload',
    voice: 'Voice Recording',
  }[currentMode];

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onChange({ mode: 'upload', sound_url: file_url, label: file.name });
    setUploading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setOpen(false);
  };

  const handleLibrarySelect = (item) => {
    setSelectedLib(item.id);
    onChange({ mode: 'library', sound_url: null, label: item.label });
  };

  const handleVoiceSave = async () => {
    const blob = voice.getBlob();
    if (!blob) return;
    setSaving(true);
    const file = new File([blob], `voice_${categoryKey}.webm`, { type: 'audio/webm' });
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onChange({ mode: 'voice', sound_url: file_url, label: 'Voice Recording' });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setOpen(false);
    voice.setAudioURL(null);
  };

  const handleReset = () => {
    onChange(DEFAULT_PREF);
    setActiveTab('default');
    setOpen(false);
  };

  const playPreview = (url) => {
    if (!url) return;
    const audio = new Audio(url);
    audio.play().catch(() => {});
  };

  const TABS = [
    { id: 'default', label: 'Default', icon: Volume2 },
    { id: 'library', label: 'Library', icon: Music },
    { id: 'upload',  label: 'Upload',  icon: Upload },
    { id: 'voice',   label: 'Voice',   icon: Mic },
  ];

  return (
    <div className="bg-white rounded-2xl hz-card-shadow overflow-hidden">
      {/* Header row */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 transition-colors"
      >
        <span className="text-lg leading-none">{emoji}</span>
        <div className="flex-1 text-left">
          <p className="text-hz-green-deep font-black text-sm">{label}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className={`w-1.5 h-1.5 rounded-full ${currentMode === 'default' ? 'bg-hz-green/40' : 'bg-hz-green'}`} />
            <span className="text-hz-green-deep/45 text-[10px] font-semibold">{modeLabel}</span>
            {saved && <span className="text-hz-green text-[10px] font-bold ml-1">Saved ✓</span>}
          </div>
        </div>
        {open ? <ChevronUp size={15} className="text-hz-green-deep/40" /> : <ChevronDown size={15} className="text-hz-green-deep/40" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-hz-green/8 px-4 pb-4 pt-3">
              {/* Tab switcher */}
              <div className="flex gap-1 bg-hz-cream rounded-xl p-1 mb-4">
                {TABS.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg text-[10px] font-bold transition-all ${
                        activeTab === tab.id
                          ? 'bg-hz-green-deep text-white'
                          : 'text-hz-green-deep/50'
                      }`}
                    >
                      <Icon size={13} strokeWidth={2.5} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* DEFAULT tab */}
              {activeTab === 'default' && (
                <div className="space-y-3">
                  <div className="bg-hz-green/8 rounded-2xl px-4 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-hz-green/15 flex items-center justify-center flex-shrink-0">
                      <Volume2 size={16} className="text-hz-green" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <p className="text-hz-green-deep font-black text-sm">FlipZone Default Sound</p>
                      <p className="text-hz-green-deep/45 text-xs">Standard system notification tone</p>
                    </div>
                    {currentMode === 'default' && <CheckCircle size={16} className="text-hz-green flex-shrink-0" strokeWidth={2.5} />}
                  </div>
                  <button
                    onClick={() => { onChange(DEFAULT_PREF); setOpen(false); }}
                    className="w-full py-3 rounded-xl bg-hz-green-deep text-white font-black text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-all"
                  >
                    <CheckCircle size={14} strokeWidth={2.5} /> Use Default
                  </button>
                </div>
              )}

              {/* LIBRARY tab */}
              {activeTab === 'library' && (
                <div className="space-y-2">
                  <p className="text-hz-green-deep/40 text-[10px] font-bold uppercase tracking-wider mb-2">FlipZone Sound Library</p>
                  {SOUND_LIBRARY.map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleLibrarySelect(item)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all active:scale-[0.97] ${
                        selectedLib === item.id ? 'bg-hz-green/15 border border-hz-green/30' : 'bg-hz-cream'
                      }`}
                    >
                      <span className="text-base">{item.emoji}</span>
                      <span className="flex-1 text-left text-hz-green-deep font-bold text-sm">{item.label}</span>
                      {selectedLib === item.id && <CheckCircle size={14} className="text-hz-green" strokeWidth={2.5} />}
                    </button>
                  ))}
                  {selectedLib && (
                    <button
                      onClick={() => { setOpen(false); setSaved(true); setTimeout(() => setSaved(false), 2000); }}
                      className="w-full mt-2 py-3 rounded-xl bg-hz-green-deep text-white font-black text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-all"
                    >
                      <Save size={14} strokeWidth={2.5} /> Save Selection
                    </button>
                  )}
                </div>
              )}

              {/* UPLOAD tab */}
              {activeTab === 'upload' && (
                <div className="space-y-3">
                  <p className="text-hz-green-deep/40 text-[10px] font-bold uppercase tracking-wider">Upload Custom Sound</p>
                  <div className="border-2 border-dashed border-hz-green/25 rounded-2xl px-4 py-5 flex flex-col items-center gap-2">
                    <Upload size={22} className="text-hz-green/40" strokeWidth={1.5} />
                    <p className="text-hz-green-deep/50 text-xs font-semibold text-center">MP3, WAV, M4A, OGG supported</p>
                    <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
                    <button
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="mt-1 bg-hz-green-deep text-white font-black text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {uploading
                        ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <Upload size={13} strokeWidth={2.5} />}
                      {uploading ? 'Uploading…' : 'Choose File'}
                    </button>
                  </div>
                  {pref?.mode === 'upload' && pref?.sound_url && (
                    <div className="bg-hz-green/8 rounded-xl px-3 py-2.5 flex items-center gap-2">
                      <CheckCircle size={13} className="text-hz-green" strokeWidth={2.5} />
                      <span className="text-hz-green-dark font-bold text-xs flex-1 truncate">{pref.label || 'Custom audio'}</span>
                      <button onClick={() => playPreview(pref.sound_url)} className="text-hz-green/60">
                        <Play size={13} strokeWidth={2.5} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* VOICE tab */}
              {activeTab === 'voice' && (
                <div className="space-y-3">
                  <p className="text-hz-green-deep/40 text-[10px] font-bold uppercase tracking-wider">Record Voice Alert</p>
                  <p className="text-hz-green-deep/40 text-xs leading-relaxed">
                    Record a personal voice message for this notification (e.g. "Your package is ready for pickup.").
                  </p>

                  {/* Recorder UI */}
                  <div className="flex flex-col items-center gap-3 py-2">
                    <button
                      onClick={voice.recording ? voice.stop : voice.start}
                      className={`w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                        voice.recording
                          ? 'bg-red-500 shadow-lg shadow-red-500/40'
                          : 'bg-hz-green-deep'
                      }`}
                    >
                      {voice.recording
                        ? <Square size={22} className="text-white" strokeWidth={2.5} />
                        : <Mic size={22} className="text-white" strokeWidth={2.5} />}
                    </button>
                    <p className="text-xs font-bold text-hz-green-deep/50">
                      {voice.recording ? '🔴 Recording… Tap to stop' : 'Tap to record'}
                    </p>
                  </div>

                  {/* Playback + save */}
                  {voice.audioURL && !voice.recording && (
                    <div className="space-y-2">
                      <div className="bg-hz-cream rounded-xl px-3 py-2.5 flex items-center gap-3">
                        <button onClick={() => { const a = new Audio(voice.audioURL); a.play(); }}
                          className="w-8 h-8 rounded-full bg-hz-green/15 flex items-center justify-center">
                          <Play size={13} className="text-hz-green" strokeWidth={2.5} />
                        </button>
                        <span className="text-hz-green-deep/60 text-xs font-semibold flex-1">Preview recording</span>
                        <button onClick={() => voice.setAudioURL(null)}>
                          <RotateCcw size={13} className="text-hz-green-deep/35" strokeWidth={2.5} />
                        </button>
                      </div>
                      <button
                        onClick={handleVoiceSave}
                        disabled={saving}
                        className="w-full py-3 rounded-xl bg-hz-green-deep text-white font-black text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-50"
                      >
                        {saving
                          ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <Save size={14} strokeWidth={2.5} />}
                        {saving ? 'Saving…' : 'Save Voice Alert'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Reset to default */}
              {currentMode !== 'default' && (
                <button onClick={handleReset} className="w-full mt-3 py-2.5 rounded-xl border border-gray-200 text-gray-500 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all">
                  <RotateCcw size={11} strokeWidth={2.5} /> Reset to Default
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function NotificationSoundSettings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [prefs, setPrefs] = useState({});
  const [prefRecord, setPrefRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const me = await base44.auth.me();
      setUser(me);
      if (me) {
        const results = await base44.entities.NotificationPreferences.filter({ user_id: me.id });
        if (results[0]) {
          setPrefRecord(results[0]);
          const { user_id, user_role, id, created_date, updated_date, created_by_id, ...soundPrefs } = results[0];
          setPrefs(soundPrefs);
        }
      }
      setLoading(false);
    })();
  }, []);

  const handleChange = (key, value) => {
    setPrefs(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveAll = async () => {
    if (!user) return;
    setSaving(true);
    const data = {
      user_id: user.id,
      user_role: user.role || 'buyer',
      ...prefs,
    };
    if (prefRecord) {
      await base44.entities.NotificationPreferences.update(prefRecord.id, data);
    } else {
      const rec = await base44.entities.NotificationPreferences.create(data);
      setPrefRecord(rec);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // Determine which category set to show based on the URL referrer or default to showing both.
  // Since this page is accessed from both buyer and seller dashboards, we detect via sessionStorage
  // hint set by the navigation, falling back to showing all categories grouped.
  const urlParams = new URLSearchParams(window.location.search);
  const roleHint = urlParams.get('role');
  const isSeller = roleHint === 'seller';
  const isBuyer = roleHint === 'buyer' || !roleHint;

  // Build grouped categories: buyer section + seller section
  const buyerCats = BUYER_CATEGORIES;
  const sellerCats = SELLER_CATEGORIES;

  if (loading) {
    return (
      <div className="min-h-screen bg-hz-cream flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-hz-green/20 border-t-hz-green rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hz-cream pb-10">
      {/* Header */}
      <div className="hz-curved-header hz-green-surface px-5 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-hz-green-deep/15 flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-hz-green-deep" strokeWidth={2.5} />
          </button>
          <div className="flex-1">
            <h1 className="text-hz-green-deep font-black text-xl hz-text-emboss">Notification Sounds</h1>
            <p className="text-hz-green-deep/60 text-xs font-semibold">Personalize your alert experience</p>
          </div>
          <FZMonogram size={36} />
        </div>

        {/* Info banner */}
        <div className="bg-hz-green-deep/20 rounded-2xl px-4 py-3 flex items-start gap-2.5 mt-1">
          <Bell size={13} className="text-hz-green-deep mt-0.5 flex-shrink-0" strokeWidth={2.5} />
          <p className="text-hz-green-deep/80 text-xs leading-relaxed">
            Custom sounds are available for <strong>Buyer</strong> and <strong>Seller</strong> accounts only.
            Preferences sync across devices when you're signed in.
          </p>
        </div>
      </div>

      <div className="px-5 py-5 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <p className="text-hz-green-deep/40 text-[10px] font-black uppercase tracking-widest">
            Notification Categories
          </p>
          {saved && (
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-1.5">
              <CheckCircle size={13} className="text-hz-green" strokeWidth={2.5} />
              <span className="text-hz-green font-black text-xs">All saved</span>
            </motion.div>
          )}
        </div>

        {/* Buyer Notifications */}
        <p className="text-hz-green-deep/40 text-[10px] font-black uppercase tracking-widest pt-1">📦 Buyer Notifications</p>
        {buyerCats.map(cat => (
          <SoundModeSelector
            key={cat.key}
            categoryKey={cat.key}
            label={cat.label}
            emoji={cat.emoji}
            pref={prefs[cat.key] || DEFAULT_PREF}
            onChange={(val) => handleChange(cat.key, val)}
          />
        ))}

        {/* Seller Notifications */}
        <p className="text-hz-green-deep/40 text-[10px] font-black uppercase tracking-widest pt-3">🏪 Seller Notifications</p>
        {sellerCats.map(cat => (
          <SoundModeSelector
            key={cat.key}
            categoryKey={cat.key}
            label={cat.label}
            emoji={cat.emoji}
            pref={prefs[cat.key] || DEFAULT_PREF}
            onChange={(val) => handleChange(cat.key, val)}
          />
        ))}

        {/* Save All */}
        <div className="pt-3">
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="w-full bg-hz-green-deep text-white font-black text-sm py-4 rounded-2xl flex items-center justify-center gap-2.5 active:scale-[0.97] transition-all disabled:opacity-50 shadow-lg shadow-hz-green-deep/20"
          >
            {saving
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Save size={16} strokeWidth={2.5} />}
            {saving ? 'Saving Preferences…' : 'Save All Preferences'}
          </button>
          <p className="text-hz-green-deep/30 text-[10px] text-center mt-2 leading-relaxed">
            Settings sync to your FlipZone™ account across all devices.
          </p>
        </div>

        {/* Operator note */}
        <div className="bg-white rounded-2xl px-4 py-3.5 hz-card-shadow border border-hz-green/10 flex items-start gap-2.5">
          <MicOff size={13} className="text-hz-green-deep/30 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
          <p className="text-hz-green-deep/40 text-[10px] leading-relaxed">
            <strong className="text-hz-green-deep/55">Facility Operator accounts</strong> use standardized FlipZone™ system alerts
            and do not support custom notification sounds.
          </p>
        </div>
      </div>
    </div>
  );
}