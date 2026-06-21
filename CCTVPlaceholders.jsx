/**
 * CCTVPlaceholders — MVP placeholder grid for future live CCTV feeds
 * Used in OperatorDashboard for facility monitoring panel
 * Structure preserved for future integration: entrance, exit, parking, locker area
 */
import React, { useState } from 'react';
import { Camera, Wifi, WifiOff, Maximize2 } from 'lucide-react';

const FEEDS = [
  {
    id: 'entrance',
    label: 'Facility Entrance',
    zone: 'ENTRANCE',
    description: 'Main entry point — foot traffic & access verification',
    color: '#22C55E',
  },
  {
    id: 'exit',
    label: 'Facility Exit',
    zone: 'EXIT',
    description: 'Exit lane — loitering detection & departure logging',
    color: '#4CAF1A',
  },
  {
    id: 'parking',
    label: 'Parking Area',
    zone: 'PARKING',
    description: 'Vehicle monitoring & extended stay flags',
    color: '#C97A1A',
  },
  {
    id: 'lockers',
    label: 'Locker Area',
    zone: 'LOCKERS',
    description: 'Locker bay — access events & dispute evidence',
    color: '#39FF14',
  },
];

function FeedCard({ feed }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #0d2410 0%, #081508 100%)',
        border: `1px solid rgba(34,197,94,0.18)`,
      }}
    >
      {/* Camera viewport placeholder */}
      <div
        className="relative flex items-center justify-center"
        style={{
          height: expanded ? 160 : 90,
          background: 'linear-gradient(160deg, #050e05 0%, #030803 100%)',
          transition: 'height 0.25s ease',
        }}
      >
        {/* Scanline overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.18) 3px, rgba(0,0,0,0.18) 4px)',
          }}
        />
        {/* Corner markers */}
        {[['top-2 left-2', 'border-t-2 border-l-2'],
          ['top-2 right-2', 'border-t-2 border-r-2'],
          ['bottom-2 left-2', 'border-b-2 border-l-2'],
          ['bottom-2 right-2', 'border-b-2 border-r-2']].map(([pos, border]) => (
          <div key={pos} className={`absolute ${pos} w-4 h-4 ${border}`} style={{ borderColor: feed.color, opacity: 0.6 }} />
        ))}
        {/* Center icon */}
        <div className="flex flex-col items-center gap-1.5">
          <Camera size={expanded ? 28 : 20} style={{ color: 'rgba(34,197,94,0.25)' }} strokeWidth={1.5} />
          <span className="text-[9px] font-black tracking-widest" style={{ color: 'rgba(134,239,172,0.25)' }}>
            FEED NOT LIVE
          </span>
        </div>
        {/* Zone label top-left */}
        <div className="absolute top-2.5 left-3 flex items-center gap-1">
          <WifiOff size={8} style={{ color: 'rgba(134,239,172,0.35)' }} strokeWidth={2} />
          <span className="text-[8px] font-black tracking-widest" style={{ color: 'rgba(134,239,172,0.35)' }}>
            {feed.zone}
          </span>
        </div>
        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="absolute bottom-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)' }}
        >
          <Maximize2 size={10} style={{ color: 'rgba(134,239,172,0.6)' }} strokeWidth={2} />
        </button>
      </div>

      {/* Info row */}
      <div className="px-3 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'rgba(201,120,26,0.7)' }} />
          <div className="min-w-0">
            <p className="font-black text-[11px] truncate" style={{ color: '#f0fff0' }}>{feed.label}</p>
            <p className="text-[9px] truncate" style={{ color: 'rgba(134,239,172,0.4)' }}>{feed.description}</p>
          </div>
        </div>
        <span className="flex-shrink-0 text-[9px] font-black px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(201,120,26,0.15)', color: '#C97A1A', border: '1px solid rgba(201,120,26,0.2)' }}>
          OFFLINE
        </span>
      </div>
    </div>
  );
}

export default function CCTVPlaceholders() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <Camera size={13} style={{ color: '#22C55E' }} strokeWidth={2.5} />
        </div>
        <div>
          <p className="font-black text-sm" style={{ color: '#f0fff0' }}>Facility CCTV</p>
          <p className="text-[10px]" style={{ color: 'rgba(134,239,172,0.4)' }}>
            Live feeds offline — integration pending
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1 px-2 py-1 rounded-full"
          style={{ background: 'rgba(201,120,26,0.12)', border: '1px solid rgba(201,120,26,0.2)' }}>
          <WifiOff size={9} style={{ color: '#C97A1A' }} strokeWidth={2} />
          <span className="text-[9px] font-black" style={{ color: '#C97A1A' }}>MVP</span>
        </div>
      </div>

      {/* 2×2 grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {FEEDS.map(feed => <FeedCard key={feed.id} feed={feed} />)}
      </div>

      <p className="text-[9px] text-center mt-2" style={{ color: 'rgba(134,239,172,0.25)' }}>
        CCTV node IDs are logged to each locker record for future correlation
      </p>
    </div>
  );
}