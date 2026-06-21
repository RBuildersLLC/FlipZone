import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Filter } from 'lucide-react';
import LockerCell from '../components/LockerCell';
import { motion, AnimatePresence } from 'framer-motion';

const mockLockers = [
  { id: '1', locker_number: 'A-01', status: 'available', size: 'medium' },
  { id: '2', locker_number: 'A-02', status: 'assigned', size: 'large' },
  { id: '3', locker_number: 'A-03', status: 'active', size: 'medium' },
  { id: '4', locker_number: 'A-04', status: 'available', size: 'small' },
  { id: '5', locker_number: 'A-05', status: 'available', size: 'medium' },
  { id: '6', locker_number: 'A-06', status: 'flagged', size: 'large' },
  { id: '7', locker_number: 'B-01', status: 'assigned', size: 'medium' },
  { id: '8', locker_number: 'B-02', status: 'available', size: 'xl' },
  { id: '9', locker_number: 'B-03', status: 'active', size: 'medium' },
  { id: '10', locker_number: 'B-04', status: 'available', size: 'small' },
  { id: '11', locker_number: 'B-05', status: 'maintenance', size: 'medium' },
  { id: '12', locker_number: 'B-06', status: 'available', size: 'medium' },
];

const filters = ['all', 'available', 'assigned', 'active', 'flagged'];

export default function LockerBankView() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const filtered = filter === 'all' ? mockLockers : mockLockers.filter(l => l.status === filter);

  return (
    <div className="min-h-screen bg-hz-cream pb-8">
      {/* Header */}
      <div className="hz-green-surface hz-curved-header px-5 pt-12 pb-8 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-hz-green-deep/15 flex items-center justify-center">
            <ArrowLeft size={18} className="text-hz-green-deep" strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-hz-green-deep font-black text-xl hz-text-emboss">My Lockers</h1>
            <p className="text-hz-green-deep/60 text-xs font-semibold">Eastside Plaza · 12 units</p>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${
                filter === f
                  ? 'bg-hz-green-deep text-white'
                  : 'bg-white/25 text-hz-green-deep'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-5">
        <div className="grid grid-cols-4 gap-2.5">
          {filtered.map((locker, i) => (
            <motion.div key={locker.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 300 }}>
              <LockerCell locker={locker} onPress={() => {
                setSelected(locker);
                if (locker.status === 'available') navigate('/seller/transactions');
              }} />
            </motion.div>
          ))}

          {/* Add locker slot */}
          <button className="aspect-square rounded-xl border-2 border-dashed border-hz-green/30 flex flex-col items-center justify-center gap-1 text-hz-green/50 active:scale-95 transition-transform">
            <Plus size={18} strokeWidth={2} />
            <span className="text-[9px] font-bold">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}