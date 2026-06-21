import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, LayoutGrid, User, History, Shield, Home } from 'lucide-react';
import FZMonogram from './FZMonogram';

const NAV = {
  seller: {
    left:  [
      { icon: Package,    label: 'Lockers',   path: '/seller/lockers' },
      { icon: History,    label: 'Activity',  path: '/seller/audit'   },
    ],
    hub: '/seller',
    right: [
      { icon: LayoutGrid, label: 'Analytics', path: '/seller/analytics' },
      { icon: User,       label: 'Profile',   path: '/seller/profile'   },
    ],
  },
  buyer: {
    left:  [
      { icon: Home,       label: 'Home',      path: '/buyer'         },
      { icon: Package,    label: 'My Codes',  path: '/buyer/codes'   },
    ],
    hub: '/buyer',
    right: [
      { icon: History,    label: 'History',   path: '/buyer/history' },
      { icon: User,       label: 'Profile',   path: '/buyer/profile' },
    ],
  },
  operator: {
    left:  [
      { icon: LayoutGrid, label: 'Facility',  path: '/operator'          },
      { icon: Shield,     label: 'Oversight', path: '/operator/oversight' },
    ],
    hub: '/operator',
    right: [
      { icon: History,    label: 'Audit',     path: '/operator/audit'  },
      { icon: User,       label: 'Staff',     path: '/operator/staff'  },
    ],
  },
};

function Tab({ icon: Icon, label, path, isActive }) { // eslint-disable-line
  return (
    <Link
      to={path}
      className="flex flex-col items-center justify-center gap-[3px] w-full h-full transition-colors"
      style={{ color: isActive ? '#4CAF1A' : 'rgba(13,42,13,0.40)' }}
    >
      <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
      <span style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '0.03em', lineHeight: 1 }}>
        {label}
      </span>
    </Link>
  );
}

export default function BottomNav({ role = 'seller' }) {
  const location = useLocation();
  const { left, hub, right } = NAV[role] ?? NAV.seller;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-green-100"
      style={{ boxShadow: '0 -4px 20px rgba(13,42,13,0.08)' }}
    >
      {/*
        Layout: [flex-1 left group] [fixed-width centre] [flex-1 right group]
        Each side has exactly the same flex weight → HZ is always mathematically centred.
      */}
      <div
        className="flex items-stretch mx-auto"
        style={{ height: 64, maxWidth: 480 }}
      >
        {/* LEFT — 2 tabs, equal flex */}
        <div className="flex flex-1 items-stretch divide-x divide-transparent">
          {left.map(tab => (
            <div key={tab.path} className="flex flex-1">
              <Tab {...tab} isActive={location.pathname === tab.path} />
            </div>
          ))}
        </div>

        {/* CENTRE — fixed 68 px, floats above the bar */}
        <div
          className="flex-shrink-0 flex items-end justify-center pb-2"
          style={{ width: 68 }}
        >
          <Link
            to={hub}
            className="flex items-center justify-center active:scale-90 transition-transform"
            style={{
              width: 58,
              height: 58,
              marginBottom: 10,
              borderRadius: 16,
              boxShadow: '0 0 18px rgba(76,175,26,0.45), 0 0 36px rgba(76,175,26,0.15)',
            }}
          >
            <FZMonogram size={58} showBackground />
          </Link>
        </div>

        {/* RIGHT — 2 tabs, equal flex */}
        <div className="flex flex-1 items-stretch">
          {right.map(tab => (
            <div key={tab.path} className="flex flex-1">
              <Tab {...tab} isActive={location.pathname === tab.path} />
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}