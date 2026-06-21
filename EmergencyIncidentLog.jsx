/**
 * EmergencyIncidentLog — Operator dashboard panel showing logged 911 incidents.
 */
import React, { useEffect, useState } from 'react';
import { Phone, Camera, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const STATUS_COLORS = {
  emergency_logged: { bg: 'bg-red-100', text: 'text-red-700', label: 'LOGGED' },
  under_review:     { bg: 'bg-hz-amber/15', text: 'text-hz-amber', label: 'REVIEWING' },
  resolved:         { bg: 'bg-hz-green/10', text: 'text-hz-green', label: 'RESOLVED' },
};

export default function EmergencyIncidentLog() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.EmergencyIncident.list('-created_date', 50)
      .then(setIncidents)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-4 border-red-200 border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center">
          <Phone size={14} className="text-red-500" strokeWidth={2.5} />
        </div>
        <h2 className="text-hz-green-deep font-black text-sm tracking-wider uppercase">Emergency Incident Log</h2>
        {incidents.length > 0 && (
          <span className="ml-auto bg-red-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full">
            {incidents.length}
          </span>
        )}
      </div>

      {incidents.length === 0 ? (
        <div className="bg-white rounded-2xl px-4 py-6 hz-card-shadow text-center">
          <p className="text-hz-green-deep/35 text-sm font-semibold">No emergency incidents logged</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {incidents.map(inc => {
            const s = STATUS_COLORS[inc.status] || STATUS_COLORS.emergency_logged;
            return (
              <div key={inc.id} className="bg-white rounded-2xl p-4 hz-card-shadow border border-red-100">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🚨</span>
                    <div>
                      <p className="text-hz-green-deep font-black text-sm">{inc.facility_name || 'Unknown Facility'}</p>
                      <p className="text-hz-green-deep/45 text-xs">Locker {inc.locker_number || '—'} · <span className="capitalize">{inc.user_role}</span></p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-full ${s.bg} ${s.text}`}>{s.label}</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-hz-green-deep/40 mt-1">
                  <div className="flex items-center gap-1">
                    <Clock size={10} strokeWidth={2.5} />
                    <span>{inc.timestamp ? new Date(inc.timestamp).toLocaleString() : '—'}</span>
                  </div>
                  <div className="flex items-center gap-1 ml-auto">
                    <Camera size={10} strokeWidth={2.5} />
                    <span className="font-semibold">CCTV: {inc.cctv_zone || 'PENDING_REVIEW'}</span>
                  </div>
                </div>

                <p className="text-hz-green-deep/25 text-[10px] mt-1.5 font-mono">
                  TX #{inc.transaction_id?.slice(-8).toUpperCase()}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}