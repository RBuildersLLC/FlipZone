import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, Users, Camera, ChevronRight, FileWarning, BarChart3, Wrench, ShieldAlert, KeyRound } from 'lucide-react';
import FZMonogram from '../components/FZMonogram';
import BottomNav from '../components/BottomNav';
import SwitchRoleButton from '../components/SwitchRoleButton';
import LockerCell from '../components/LockerCell';
import CCTVPlaceholders from '../components/CCTVPlaceholders';
import EmergencyIncidentLog from '../components/EmergencyIncidentLog';
import ManualCodeIssuer from '../components/ManualCodeIssuer';

const mockLockers = [
  { id: '1', locker_number: 'A-01', status: 'available' },
  { id: '2', locker_number: 'A-02', status: 'assigned' },
  { id: '3', locker_number: 'A-03', status: 'active' },
  { id: '4', locker_number: 'A-04', status: 'available' },
  { id: '5', locker_number: 'A-05', status: 'flagged' },
  { id: '6', locker_number: 'A-06', status: 'available' },
  { id: '7', locker_number: 'B-01', status: 'assigned' },
  { id: '8', locker_number: 'B-02', status: 'available' },
  { id: '9', locker_number: 'B-03', status: 'active' },
  { id: '10', locker_number: 'B-04', status: 'maintenance' },
  { id: '11', locker_number: 'B-05', status: 'available' },
  { id: '12', locker_number: 'B-06', status: 'assigned' },
];

const statusCounts = {
  available: mockLockers.filter(l => l.status === 'available').length,
  assigned: mockLockers.filter(l => l.status === 'assigned').length,
  active: mockLockers.filter(l => l.status === 'active').length,
  flagged: mockLockers.filter(l => l.status === 'flagged').length,
};

export default function OperatorDashboard() {
  const navigate = useNavigate();
  const [selectedLocker, setSelectedLocker] = useState(null);

  return (
    <div className="min-h-screen bg-hz-cream pb-20">
      {/* Header */}
      <div className="hz-curved-header px-5 pt-12 pb-8 relative overflow-hidden" style={{ background: 'linear-gradient(150deg, #1A3A1A 0%, #0D2A0D 55%, #071207 100%)' }}>
        {/* Accent stripe */}
        <div className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent 0%, #4CAF1A 40%, #39FF14 60%, transparent 100%)', opacity: 0.6 }} />

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <FZMonogram size={44} showBackground />
            <div>
              <h1 className="text-hz-green font-black text-xl">Operations Center</h1>
              <p className="text-hz-green/50 text-xs font-semibold">Facility Management</p>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-hz-green/15 flex items-center justify-center border border-hz-green/20">
            <Shield size={16} className="text-hz-green" strokeWidth={2.5} />
          </div>
        </div>
        {/* Restricted access notice */}
        <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 mb-4">
          <ShieldAlert size={11} className="text-hz-amber flex-shrink-0" strokeWidth={2.5} />
          <p className="text-hz-amber/80 text-[10px] font-bold tracking-wide">RESTRICTED — Authorized facility personnel only</p>
        </div>

        {/* Status summary */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Open', count: statusCounts.available, color: 'text-hz-green' },
            { label: 'Active', count: statusCounts.active, color: 'text-hz-neon' },
            { label: 'Assigned', count: statusCounts.assigned, color: 'text-hz-amber' },
            { label: 'Flagged', count: statusCounts.flagged, color: 'text-red-400' },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-xl px-2 py-2 text-center">
              <p className={`font-black text-xl leading-none ${s.color}`}>{s.count}</p>
              <p className="text-white/50 text-[10px] font-bold mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* Locker Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-hz-green-deep font-black text-sm tracking-wider uppercase">Locker Bank — Zone A/B</h2>
            <span className="text-hz-green-deep/40 text-xs font-semibold">Eastside Plaza</span>
          </div>
          <div className="bg-white rounded-3xl p-4 hz-card-shadow-lg">
            <div className="grid grid-cols-4 gap-2">
              {mockLockers.map(locker => (
                <LockerCell key={locker.id} locker={locker} onPress={setSelectedLocker} />
              ))}
            </div>
          </div>
        </div>

        {/* Alert Cards */}
        <div>
          <h2 className="text-hz-green-deep font-black text-sm tracking-wider uppercase mb-3">Escalations</h2>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={16} className="text-red-500" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <p className="text-red-800 font-bold text-sm">Locker A-05 Flagged</p>
              <p className="text-red-600/70 text-xs mt-0.5">Suspicious access attempt · 3 failed codes</p>
            </div>
            <ChevronRight size={15} className="text-red-400 mt-0.5" />
          </div>
        </div>

        {/* CCTV Placeholders */}
        <div className="rounded-3xl p-4" style={{ background: 'linear-gradient(160deg, #0d2410 0%, #081508 100%)', border: '1px solid rgba(34,197,94,0.15)' }}>
          <CCTVPlaceholders />
        </div>

        {/* Operator function grid */}
        <div>
          <h2 className="text-hz-green-deep font-black text-sm tracking-wider uppercase mb-3">Management</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Staff Management', sub: 'Employees & managers', icon: Users, path: '/operator/staff', color: 'text-hz-green' },
              { label: 'Incident Review', sub: 'Flags & escalations', icon: FileWarning, path: '/operator/audit', color: 'text-hz-amber' },
              { label: 'Loitering Reports', sub: 'Anti-loitering log', icon: ShieldAlert, path: '/operator/audit', color: 'text-red-500' },
              { label: 'Revenue Reporting', sub: 'Facility revenue', icon: BarChart3, path: '/operator/oversight', color: 'text-hz-green' },
              { label: 'Maintenance', sub: 'Lockers & hardware', icon: Wrench, path: '/operator/oversight', color: 'text-hz-gold' },
              { label: 'Override Controls', sub: 'Emergency access', icon: Shield, path: '/operator/oversight', color: 'text-hz-green-dark' },
            ].map(item => {
              const Icon = item.icon;
              return (
                <button key={item.label} onClick={() => navigate(item.path)}
                  className="bg-white rounded-2xl p-3.5 hz-card-shadow flex flex-col gap-2 text-left active:scale-[0.97] transition-transform">
                  <div className="w-9 h-9 rounded-xl bg-hz-green/10 flex items-center justify-center">
                    <Icon size={16} className={item.color} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-hz-green-deep font-bold text-xs leading-tight">{item.label}</p>
                    <p className="text-hz-green-deep/45 text-[10px] mt-0.5">{item.sub}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Manual Lock Code Mode */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <KeyRound size={14} className="text-hz-green" strokeWidth={2.5} />
            <h2 className="text-hz-green-deep font-black text-sm tracking-wider uppercase">Manual Lock Code Mode</h2>
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-hz-amber/15 text-hz-amber tracking-wider">PILOT FACILITY</span>
          </div>
          <ManualCodeIssuer operatorHasPermission={true} />
        </div>

        {/* Emergency Incident Log */}
        <EmergencyIncidentLog />

        {/* Dispute review */}
        <button onClick={() => navigate('/operator/audit')}
          className="w-full bg-white rounded-2xl p-4 hz-card-shadow flex items-center justify-between active:scale-[0.98] transition-transform border border-hz-amber/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-hz-amber/10 flex items-center justify-center">
              <AlertTriangle size={18} className="text-hz-amber" strokeWidth={2} />
            </div>
            <div className="text-left">
              <p className="text-hz-green-deep font-bold text-sm">Dispute Review Queue</p>
              <p className="text-hz-green-deep/50 text-xs">Active disputes requiring resolution</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-hz-amber/60" />
        </button>
      </div>

      <BottomNav role="operator" />
    </div>
  );
}