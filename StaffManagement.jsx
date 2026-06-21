import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Crown, Eye, Settings, Shield, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const staff = [
  { id: '1', name: 'Marcus T.', role: 'Manager', access: 'manage', active: true, since: 'Apr 2026' },
  { id: '2', name: 'Priya K.', role: 'Operator', access: 'operate', active: true, since: 'May 2026' },
  { id: '3', name: 'Leo B.', role: 'Viewer', access: 'view', active: false, since: 'May 2026' },
];

const accessConfig = {
  manage: { icon: Settings, label: 'Manager', color: 'text-hz-green', bg: 'bg-hz-green/10' },
  operate: { icon: Shield, label: 'Operator', color: 'text-hz-amber', bg: 'bg-amber-50' },
  view: { icon: Eye, label: 'View Only', color: 'text-hz-green-dark/60', bg: 'bg-gray-50' },
};

export default function StaffManagement() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-hz-cream pb-8">
      {/* Header */}
      <div className="hz-green-surface hz-curved-header px-5 pt-12 pb-8 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-hz-green-deep/15 flex items-center justify-center">
            <ArrowLeft size={18} className="text-hz-green-deep" strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-hz-green-deep font-black text-xl hz-text-emboss">Staff & Access</h1>
            <p className="text-hz-green-deep/60 text-xs font-semibold">Enterprise employee management</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 space-y-4">
        {/* Enterprise gate notice */}
        <div className="bg-amber-50 border border-hz-gold/30 rounded-2xl p-4 flex items-start gap-3">
          <Crown size={18} className="text-hz-gold flex-shrink-0 mt-0.5" strokeWidth={2} />
          <div>
            <p className="text-hz-green-deep font-bold text-sm">Enterprise Feature</p>
            <p className="text-hz-green-deep/60 text-xs mt-0.5">
              Staff expansion is available on the Enterprise plan. Upgrade to add unlimited employee accounts.
            </p>
          </div>
        </div>

        {/* Staff list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-hz-green-deep font-black text-sm tracking-wider uppercase">Active Staff</h2>
            <button className="flex items-center gap-1.5 text-hz-green font-bold text-xs">
              <Plus size={13} strokeWidth={2.5} /> Add Employee
            </button>
          </div>

          <div className="space-y-3">
            {staff.map((member, i) => {
              const cfg = accessConfig[member.access];
              const AccessIcon = cfg.icon;
              return (
                <motion.div key={member.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-2xl p-4 hz-card-shadow flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-2xl hz-green-surface flex items-center justify-center flex-shrink-0">
                    <span className="text-hz-green-deep font-black text-sm">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-hz-green-deep font-bold text-sm">{member.name}</p>
                    <p className="text-hz-green-deep/50 text-xs">Since {member.since}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${cfg.bg}`}>
                    <AccessIcon size={11} className={cfg.color} strokeWidth={2.5} />
                    <span className={`text-[10px] font-bold ${cfg.color}`}>{cfg.label}</span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${member.active ? 'bg-hz-green' : 'bg-gray-300'}`} />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Locked placeholder slots */}
        <div>
          <h2 className="text-hz-green-deep font-black text-sm tracking-wider uppercase mb-3">Additional Slots</h2>
          <div className="bg-white rounded-2xl p-4 hz-card-shadow flex items-center gap-3 opacity-40">
            <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Lock size={16} className="text-gray-400" strokeWidth={2} />
            </div>
            <div>
              <p className="text-hz-green-deep font-bold text-sm">Unlimited slots available</p>
              <p className="text-hz-green-deep/50 text-xs">Upgrade to Enterprise to unlock</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}