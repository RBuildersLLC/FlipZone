import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Key, Lock, Unlock, Flag, Download, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

const events = [
  { id: '1', type: 'access_granted', locker: 'B-07', user: 'Alex K.', time: '2:14 PM', date: 'Today', code: 'FZ-7K4M', success: true, cctv: 'CAM-02-14:14' },
  { id: '2', type: 'code_issued', locker: 'B-07', user: 'Jordan M.', time: '1:55 PM', date: 'Today', code: 'FZ-7K4M', success: true, cctv: null },
  { id: '3', type: 'access_denied', locker: 'A-05', user: 'Unknown', time: '11:32 AM', date: 'Today', code: 'XX-FAIL', success: false, cctv: 'CAM-01-11:32' },
  { id: '4', type: 'locker_assigned', locker: 'A-12', user: 'Jordan M.', time: '9:10 AM', date: 'Today', code: null, success: true, cctv: null },
  { id: '5', type: 'access_granted', locker: 'A-12', user: 'Sam T.', time: '8:52 PM', date: 'Yesterday', code: 'FZ-9R2X', success: true, cctv: 'CAM-03-20:52' },
  { id: '6', type: 'locker_released', locker: 'C-03', user: 'Jordan M.', time: '3:30 PM', date: 'Yesterday', code: null, success: true, cctv: null },
];

const eventConfig = {
  access_granted: { icon: CheckCircle, color: 'text-hz-green', bg: 'bg-hz-green/10', label: 'Access Granted' },
  access_denied: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Access Denied' },
  code_issued: { icon: Key, color: 'text-hz-amber', bg: 'bg-amber-50', label: 'Code Issued' },
  locker_assigned: { icon: Lock, color: 'text-hz-green-dark', bg: 'bg-hz-green/8', label: 'Locker Assigned' },
  locker_released: { icon: Unlock, color: 'text-hz-green', bg: 'bg-hz-green/10', label: 'Locker Released' },
  flagged: { icon: Flag, color: 'text-red-500', bg: 'bg-red-50', label: 'Flagged' },
};

export default function AuditHistory() {
  const navigate = useNavigate();
  const [cctvMode, setCctvMode] = useState(false);

  const grouped = events.reduce((acc, e) => {
    const key = e.date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-hz-cream pb-8">
      {/* Header */}
      <div className="hz-green-surface hz-curved-header px-5 pt-12 pb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full border border-white/10 -translate-y-1/3 translate-x-1/3" />
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-hz-green-deep/15 flex items-center justify-center">
              <ArrowLeft size={18} className="text-hz-green-deep" strokeWidth={2.5} />
            </button>
            <div>
              <h1 className="text-hz-green-deep font-black text-xl hz-text-emboss">Audit Log</h1>
              <p className="text-hz-green-deep/60 text-xs font-semibold">All locker access events</p>
            </div>
          </div>
          <button className="w-9 h-9 rounded-xl bg-hz-green-deep/15 flex items-center justify-center">
            <Download size={16} className="text-hz-green-deep" strokeWidth={2.5} />
          </button>
        </div>

        {/* CCTV toggle */}
        <div className="flex items-center gap-2">
          <button onClick={() => setCctvMode(!cctvMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              cctvMode ? 'bg-hz-gold text-hz-green-deep' : 'bg-white/20 text-hz-green-deep/60'
            }`}>
            <Camera size={11} strokeWidth={2.5} />
            CCTV Correlation
          </button>
          {!cctvMode && <span className="text-hz-green-deep/40 text-[10px] font-semibold">Enterprise feature</span>}
        </div>
      </div>

      <div className="px-5 py-5 space-y-5">
        {Object.entries(grouped).map(([date, entries]) => (
          <div key={date}>
            <h2 className="text-hz-green-deep/50 font-bold text-xs tracking-wider uppercase mb-2">{date}</h2>
            <div className="space-y-2">
              {entries.map((event, i) => {
                const cfg = eventConfig[event.type] || eventConfig.access_granted;
                const Icon = cfg.icon;
                return (
                  <motion.div key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl p-3.5 hz-card-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={15} className={cfg.color} strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-hz-green-deep font-bold text-sm">{cfg.label}</p>
                          <span className="text-hz-green-deep/40 text-xs font-semibold">{event.time}</span>
                        </div>
                        <p className="text-hz-green-deep/60 text-xs mt-0.5">
                          <span className="font-bold">Locker {event.locker}</span>
                          {event.user && ` · ${event.user}`}
                        </p>
                        {event.code && (
                          <span className="text-[10px] font-mono font-bold text-hz-green-dark bg-hz-green/10 px-1.5 py-0.5 rounded mt-1 inline-block">
                            {event.code}
                          </span>
                        )}
                        {cctvMode && event.cctv && (
                          <div className="flex items-center gap-1 mt-1">
                            <Camera size={9} className="text-hz-gold" />
                            <span className="text-[10px] font-bold text-hz-gold">{event.cctv}</span>
                          </div>
                        )}
                      </div>
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${event.success ? 'bg-hz-green' : 'bg-red-400'}`} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}