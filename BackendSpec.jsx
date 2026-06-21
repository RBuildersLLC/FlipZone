import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Shield, Database, Users, Lock, Zap, Star, CreditCard, Bell, Server, Code, FileText, AlertTriangle, Archive } from 'lucide-react';

const SECTIONS = [
  { id: 'overview', label: 'Overview & Scope', icon: FileText },
  { id: 'roles', label: 'User Roles', icon: Users },
  { id: 'entities', label: 'Database Entities', icon: Database },
  { id: 'auth', label: 'Authentication & Credentials', icon: Lock },
  { id: 'transaction', label: 'Transaction Lifecycle', icon: Zap },
  { id: 'seller', label: 'Seller Workflows', icon: Code },
  { id: 'buyer', label: 'Buyer Workflows', icon: Code },
  { id: 'operator', label: 'Operator Workflows', icon: Code },
  { id: 'locker', label: 'Locker Assignment Logic', icon: Archive },
  { id: 'accesscode', label: 'Access Credential Logic', icon: Shield },
  { id: 'credtransfer', label: 'Credential Ownership & Transfer', icon: Lock },
  { id: 'audit', label: 'Audit Logging', icon: FileText },
  { id: 'reputation', label: 'Reputation System', icon: Star },
  { id: 'subscriptions', label: 'Subscription Tiers', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'api', label: 'API Endpoints', icon: Server },
  { id: 'infrastructure', label: 'Infrastructure Recommendations', icon: Server },
  { id: 'security', label: 'Security Requirements', icon: Shield },
  { id: 'backup', label: 'Backup & Disaster Recovery', icon: Database },
  { id: 'ip', label: 'IP Ownership Requirements', icon: AlertTriangle },
  { id: 'deliverables', label: 'Deliverable Requirements', icon: FileText },
];

function Badge({ children, color = 'green' }) {
  const colors = {
    green: 'bg-green-100 text-green-800 border-green-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${colors[color]}`}>
      {children}
    </span>
  );
}

function PhaseTag({ phase }) {
  return phase === 1
    ? <Badge color="green">Phase 1 — MVP</Badge>
    : <Badge color="purple">Phase 2 — Enhancement</Badge>;
}

function SectionBlock({ title, children, id }) {
  const [open, setOpen] = useState(true);
  return (
    <div id={id} className="mb-6 rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <span className="font-bold text-gray-900 text-base">{title}</span>
        {open ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
      </button>
      {open && <div className="px-6 pb-6 pt-2 bg-white border-t border-gray-100">{children}</div>}
    </div>
  );
}

function Table({ headers, rows }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 mt-3">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {headers.map(h => (
              <th key={h} className="px-4 py-2.5 text-left font-semibold text-gray-700 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 text-gray-700 align-top">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CodeBlock({ children }) {
  return (
    <pre className="bg-gray-900 text-green-400 rounded-xl p-4 text-xs overflow-x-auto mt-3 font-mono leading-relaxed">
      {children}
    </pre>
  );
}

function H3({ children }) {
  return <h3 className="font-bold text-gray-800 mt-5 mb-2 text-sm uppercase tracking-wide">{children}</h3>;
}

function P({ children }) {
  return <p className="text-gray-600 text-sm leading-relaxed mb-2">{children}</p>;
}

function UL({ items }) {
  return (
    <ul className="list-disc list-inside space-y-1 mt-1 mb-3">
      {items.map((item, i) => (
        <li key={i} className="text-gray-600 text-sm leading-relaxed">{item}</li>
      ))}
    </ul>
  );
}

function CalloutBox({ children, color = 'amber' }) {
  const styles = {
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
  };
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm mt-3 leading-relaxed ${styles[color]}`}>
      {children}
    </div>
  );
}

export default function BackendSpec() {
  const [activeSection, setActiveSection] = useState('overview');

  const scrollTo = (id) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4CAF1A, #2D7A0D)' }}>
              <span className="text-white text-xs font-black">FZ</span>
            </div>
            <div>
              <div className="font-black text-gray-900 text-sm leading-none">FlipZone™</div>
              <div className="text-xs text-gray-500 leading-none mt-0.5">Backend Architecture Spec v1.1</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge color="green">Phase 1 MVP</Badge>
            <Badge color="purple">Phase 2</Badge>
            <span className="text-xs text-gray-400 hidden sm:block">Confidential — © 2026 R-Builders LLC</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar TOC */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-20">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Contents</div>
            <nav className="space-y-0.5">
              {SECTIONS.map(s => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs font-medium transition-colors ${
                      activeSection === s.id
                        ? 'bg-green-100 text-green-800'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={12} className="flex-shrink-0" />
                    <span className="truncate">{s.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">

          {/* Cover */}
          <div className="rounded-2xl mb-6 p-8 text-white relative overflow-hidden" style={{ background: 'linear-gradient(150deg, #4CAF1A 0%, #2D7A0D 55%, #0D2A0D 100%)' }}>
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
            <div className="relative z-10">
              <div className="text-xs font-bold tracking-widest uppercase text-white/60 mb-2">Third-Party Development Specification</div>
              <h1 className="text-3xl font-black tracking-tight mb-1">FlipZone™ Production Backend</h1>
              <div className="text-white/70 text-sm font-medium mb-4">Architecture Specification v1.1 — Confidential | For Distribution Under Executed NDA Only</div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-white/15 rounded-full px-3 py-1 font-semibold">Issued: May 2026</span>
                <span className="bg-white/15 rounded-full px-3 py-1 font-semibold">Status: Developer-Ready Draft</span>
                <span className="bg-white/15 rounded-full px-3 py-1 font-semibold">Classification: Confidential</span>
              </div>
            </div>
          </div>

          {/* ── 1. OVERVIEW ── */}
          <SectionBlock title="1. Overview & Scope" id="overview">
            <P>FlipZone™ is a peer-to-peer physical commerce infrastructure platform enabling sellers, buyers, and facility operators to execute secure, trackable, locker-mediated transactions through verified accounts. This specification defines all backend systems required for a production-grade deployment.</P>
            <P>This document is organized into two development phases:</P>
            <Table
              headers={['Phase', 'Focus', 'Target Timeline']}
              rows={[
                [<PhaseTag phase={1} />, 'Core transaction infrastructure, locker management, secure randomized access credentials, seller-controlled release, buyer activation workflow, audit logging, basic reputation, subscriptions', 'Months 1–3'],
                [<PhaseTag phase={2} />, 'CCTV integration, advanced reputation engine, enterprise analytics, white-label API, automated payment integrations, multi-facility management', 'Months 4–8'],
              ]}
            />
            <H3>Core Platform Pillars</H3>
            <UL items={[
              'Secure locker assignment and lifecycle management',
              'Seller-controlled release of secure randomized access credentials',
              'Buyer-activated access windows inside verified FlipZone™ accounts',
              'Role-based access control (Seller / Buyer / Operator / Admin)',
              'Immutable audit trail for every locker interaction',
              'Subscription-gated feature tiers (Starter / Business / Enterprise)',
              'Reputation scoring and trust verification',
            ]} />
          </SectionBlock>

          {/* ── 2. USER ROLES ── */}
          <SectionBlock title="2. User Roles" id="roles">
            <Table
              headers={['Role', 'Description', 'Key Privileges', 'Phase']}
              rows={[
                ['Seller', 'Individual or business depositing items into lockers for buyer pickup', 'Create transactions, assign lockers, confirm deposit with photo, manually release credential to buyer', <PhaseTag phase={1} />],
                ['Buyer', 'Verified account holder retrieving items from assigned lockers', 'Activate received credentials, view assigned lockers, confirm pickup with photo, rate sellers', <PhaseTag phase={1} />],
                ['Operator', 'Facility manager owning/managing a set of physical lockers', 'Manage locker inventory, view all facility logs, manage staff, flag/release lockers', <PhaseTag phase={1} />],
                ['Staff', 'Operator-delegated employee with limited oversight access', 'View locker statuses, acknowledge alerts, no financial access', <PhaseTag phase={1} />],
                ['Platform Admin', 'FlipZone™ system administrator', 'Full system access, subscription management, dispute resolution, configuration changes', <PhaseTag phase={1} />],
                ['Enterprise API User', 'Third-party system integration consumer', 'Programmatic access to scoped endpoints via API key', <PhaseTag phase={2} />],
              ]}
            />
            <H3>Role Hierarchy</H3>
            <CodeBlock>{`Platform Admin
  └── Operator
        └── Staff
  └── Seller
  └── Buyer
  └── Enterprise API User (Phase 2)`}</CodeBlock>
            <H3>Role Assignment Rules</H3>
            <UL items={[
              'A single user account may hold multiple roles simultaneously (e.g., Seller + Buyer)',
              'Operator role requires identity verification before activation',
              'Staff accounts are created and scoped exclusively by their parent Operator',
              'Platform Admin accounts are provisioned only by the FlipZone™ system team',
              'All parties in any transaction — both Seller and Buyer — must hold verified FlipZone™ accounts. Access credentials do not leave the platform.',
            ]} />
          </SectionBlock>

          {/* ── 3. DATABASE ENTITIES ── */}
          <SectionBlock title="3. Database Entities" id="entities">
            <H3>Core Entity Map</H3>
            <Table
              headers={['Entity', 'Primary Key', 'Key Fields', 'Phase']}
              rows={[
                ['users', 'uuid', 'email, full_name, role[], verified, subscription_id, reputation_score', <PhaseTag phase={1} />],
                ['lockers', 'uuid', 'locker_number, facility_id, status, size, assigned_seller_id, assigned_buyer_id', <PhaseTag phase={1} />],
                ['transactions', 'uuid', 'locker_id, seller_id, buyer_id, status, item_description, value, credential_id', <PhaseTag phase={1} />],
                ['access_credentials', 'uuid', 'transaction_id, code_hash, salt, expires_at, used_at, activated_at, status, use_count, max_uses', <PhaseTag phase={1} />],
                ['audit_logs', 'uuid', 'locker_id, user_id, event_type, timestamp, success, ip_address', <PhaseTag phase={1} />],
                ['facilities', 'uuid', 'operator_id, name, address, locker_count, tier', <PhaseTag phase={1} />],
                ['subscriptions', 'uuid', 'user_id, tier, status, started_at, expires_at, locker_limit, employee_slots', <PhaseTag phase={1} />],
                ['reputation_events', 'uuid', 'from_user_id, to_user_id, transaction_id, score, category, notes', <PhaseTag phase={1} />],
                ['notifications', 'uuid', 'user_id, type, payload, read_at, channel', <PhaseTag phase={1} />],
                ['staff_assignments', 'uuid', 'operator_id, staff_user_id, facility_id, permissions[], active', <PhaseTag phase={1} />],
                ['disputes', 'uuid', 'transaction_id, raised_by, reason, status, resolution, resolved_by', <PhaseTag phase={1} />],
                ['deposit_confirmations', 'uuid', 'transaction_id, seller_id, photo_url, timestamp, locker_status_confirmed', <PhaseTag phase={1} />],
                ['pickup_confirmations', 'uuid', 'transaction_id, buyer_id, photo_url, timestamp, locker_release_confirmed', <PhaseTag phase={1} />],
                ['cctv_nodes', 'uuid', 'facility_id, node_identifier, stream_url_encrypted, locker_ids[]', <PhaseTag phase={2} />],
                ['api_keys', 'uuid', 'user_id, key_hash, scopes[], last_used_at, revoked_at', <PhaseTag phase={2} />],
              ]}
            />
            <H3>Indexing Requirements</H3>
            <UL items={[
              'transactions: INDEX on (seller_id, status), (locker_id, status)',
              'audit_logs: INDEX on (locker_id, timestamp DESC), (user_id, timestamp DESC)',
              'access_credentials: UNIQUE INDEX on (code_hash), INDEX on (transaction_id)',
              'lockers: INDEX on (facility_id, status)',
              'reputation_events: INDEX on (to_user_id, created_at DESC)',
            ]} />
          </SectionBlock>

          {/* ── 4. AUTHENTICATION ── */}
          <SectionBlock title="4. Authentication & Credential Architecture" id="auth">
            <H3>Phase 1 — Authentication Stack</H3>
            <Table
              headers={['Method', 'Use Case', 'Implementation']}
              rows={[
                ['Email + Password', 'Standard user login', 'Bcrypt hash (cost ≥ 12), stored in users table'],
                ['PIN (6-digit)', 'In-app quick access after initial login', 'Hashed with PBKDF2 + per-user salt, stored separately'],
                ['JWT Access Token', 'Session bearer token', 'RS256 signed, 15-min TTL'],
                ['Refresh Token', 'Session persistence', 'Opaque token, 30-day TTL, rotation on every use, stored in HttpOnly cookie'],
                ['Email Verification', 'Account activation', 'HMAC-SHA256 signed 24hr link'],
                ['Password Reset', 'Recovery flow', 'HMAC-SHA256 signed 1hr link, single-use'],
              ]}
            />
            <H3>Phase 2 — Enhanced Auth</H3>
            <Table
              headers={['Method', 'Use Case']}
              rows={[
                ['TOTP / Authenticator App (RFC 6238)', 'MFA for Operators and Enterprise users'],
                ['Biometric delegation', 'Mobile-native FaceID/TouchID unlock for PIN replacement'],
                ['API Key (hashed)', 'Machine-to-machine Enterprise API access'],
                ['OAuth 2.0 (scoped)', 'Third-party platform integrations'],
              ]}
            />
            <H3>Session & Token Rules</H3>
            <UL items={[
              'Access tokens must never be stored in localStorage — use memory only',
              'Refresh tokens stored as HttpOnly, Secure, SameSite=Strict cookies',
              'All token issuance events must be recorded in audit_logs',
              'Concurrent session limit: 3 devices (Starter), 10 devices (Business/Enterprise)',
              'Force-logout all sessions on password change or account flag',
            ]} />
            <H3>PIN Architecture — FlipZone™ Specific</H3>
            <P>FlipZone™ uses a 6-digit PIN as the secondary in-app credential. The 6-digit length reflects the commercial accountability nature of the platform — locker access, credential management, and transaction authorization require a higher security baseline. The PIN is only valid after an active JWT session exists. PINs are rate-limited to 5 attempts before triggering a 30-minute lockout and full session re-authentication.</P>
          </SectionBlock>

          {/* ── 5. TRANSACTION LIFECYCLE ── */}
          <SectionBlock title="5. Transaction Lifecycle" id="transaction">
            <H3>Status State Machine</H3>
            <CodeBlock>{`INITIATED
   │
   ▼
LOCKER_ASSIGNED ──────── [Seller selects and reserves locker]
   │
   ▼
DEPOSIT_CONFIRMED ─────── [Seller deposits item + photo confirmation]
                           [Locker confirms secured/stored status]
   │
   ▼
CREDENTIAL_PENDING ────── [Seller manually reviews and releases credential to buyer]
   │
   ▼
CREDENTIAL_DELIVERED ──── [Credential staged in buyer's verified FlipZone™ account]
                           [Buyer notified via push + email that credential is waiting]
                           [No raw code included in external notification]
   │
   ▼
CREDENTIAL_ACTIVE ─────── [Buyer presses "Activate Access Code" inside app]
                           [Access window begins ONLY after buyer activation]
   │
   ▼
PICKUP_CONFIRMED ──────── [Buyer retrieves item + photo confirmation]
                           [Locker confirms pickup/release]
   │
   ▼
COMPLETED ────────────────[Transaction closed — audit trail finalized]
                           [Reputation event created]

   ├──► DISPUTED ──────── [Dispute raised by either party at any active stage]
   │         └──► RESOLVED → COMPLETED or CANCELLED
   │
   └──► CANCELLED ─────── [Expired, seller cancelled, or admin override]`}</CodeBlock>

            <H3>Lifecycle Rules</H3>
            <Table
              headers={['Transition', 'Trigger', 'Side Effects']}
              rows={[
                ['INITIATED → LOCKER_ASSIGNED', 'Seller selects available locker', 'Locker status → assigned; audit log entry'],
                ['LOCKER_ASSIGNED → DEPOSIT_CONFIRMED', 'Seller submits photo + confirms deposit in-app', 'Timestamp recorded; locker status → active; photo stored'],
                ['DEPOSIT_CONFIRMED → CREDENTIAL_PENDING', 'System generates secure randomized credential, holds pending seller release', 'Credential generated and stored (hashed); awaiting seller manual release'],
                ['CREDENTIAL_PENDING → CREDENTIAL_DELIVERED', 'Seller manually releases credential to buyer from within app', 'Credential staged in buyer\'s FlipZone™ account; buyer notified (push + email alert only — no raw code in notification)'],
                ['CREDENTIAL_DELIVERED → CREDENTIAL_ACTIVE', 'Buyer presses "Activate Access Code" inside verified FlipZone™ account', 'Access window begins; expiry countdown starts from activation moment'],
                ['CREDENTIAL_ACTIVE → PICKUP_CONFIRMED', 'Buyer uses credential at locker; submits pickup photo', 'Locker confirmed released; audit log entry'],
                ['PICKUP_CONFIRMED → COMPLETED', 'System closes transaction', 'Locker → available; reputation event created; seller notified'],
                ['ANY → DISPUTED', 'Either party raises dispute', 'Locker frozen; admin notified'],
                ['ANY → CANCELLED', 'Expiry, seller cancel, or admin override', 'Locker released; credential revoked; audit log'],
              ]}
            />
          </SectionBlock>

          {/* ── 6. SELLER WORKFLOWS ── */}
          <SectionBlock title="6. Seller Workflows" id="seller">
            <H3>Core Seller Operations — Phase 1</H3>
            <Table
              headers={['Workflow', 'Steps', 'Backend Operations']}
              rows={[
                ['Create Transaction', '1. Select verified buyer (by FlipZone™ account) 2. Describe item 3. Declare value (optional) 4. Confirm', 'POST /transactions → status: INITIATED'],
                ['Assign Locker', '1. Browse available lockers 2. Filter by size/location 3. Reserve', 'POST /transactions/:id/assign-locker → locker status: assigned'],
                ['Confirm Deposit', '1. Place item in locker 2. Submit photo in app 3. Confirm secured', 'PATCH /transactions/:id/deposit → photo stored; credential generated (not yet released)'],
                ['Release Credential to Buyer', '1. Review transaction summary 2. Tap "Release Access to Buyer" 3. Confirm', 'PATCH /transactions/:id/release-credential → credential staged in buyer\'s account'],
                ['View Active Transactions', 'Dashboard list with status filters', 'GET /transactions?seller_id=me&status=active'],
                ['Cancel Transaction', 'Cancel before credential is activated; provide reason', 'PATCH /transactions/:id/cancel → locker released; credential revoked if issued'],
                ['View Audit Log', 'Per-transaction event history', 'GET /audit-logs?transaction_id=:id'],
              ]}
            />
            <H3>Subscription-Gated Limits</H3>
            <UL items={[
              'Starter: Max 2 concurrent active transactions, 1 locker slot',
              'Business: Max 20 concurrent transactions, 10 locker slots, bulk transaction CSV import',
              'Enterprise: Unlimited transactions, unlimited locker slots, API access',
            ]} />
            <H3>Phase 2 — Seller Enhancements</H3>
            <UL items={[
              'Bulk locker assignment via CSV upload',
              'Recurring transaction templates',
              'Staff delegation — assign employees to manage specific transactions',
              'Analytics dashboard: conversion rates, average handoff time, dispute rate',
            ]} />
          </SectionBlock>

          {/* ── 7. BUYER WORKFLOWS ── */}
          <SectionBlock title="7. Buyer Workflows" id="buyer">
            <H3>Core Buyer Operations — Phase 1</H3>
            <Table
              headers={['Workflow', 'Steps', 'Backend Operations']}
              rows={[
                ['Receive Credential Notification', 'Push notification / email alert — informs buyer a credential is staged. No raw code included.', 'System-triggered on CREDENTIAL_DELIVERED; delivery logged'],
                ['View Staged Credential', 'Buyer opens FlipZone™ app → Access Queue → sees credential details (locker, location, seller, item)', 'GET /transactions/:id → includes staged credential status'],
                ['Activate Access Code', 'Buyer presses "Activate Access Code" inside verified FlipZone™ account', 'PATCH /access-credentials/:id/activate → access window begins; expiry countdown starts'],
                ['Use Credential at Locker', 'Buyer views live access code inside app at locker', 'GET /access-credentials/:id (requires active session + activated status)'],
                ['Confirm Pickup', 'Buyer retrieves item + submits photo confirmation in app', 'POST /pickup-confirmations → photo stored; locker release confirmed'],
                ['Rate Transaction', 'Rate seller (1–5 stars) + optional comment', 'POST /reputation-events'],
                ['Raise Dispute', 'Select transaction → describe issue → submit', 'POST /disputes'],
                ['View History', 'All past transactions and statuses', 'GET /transactions?buyer_id=me'],
              ]}
            />
            <H3>Credential Access Rules</H3>
            <UL items={[
              'Credentials are ONLY viewable inside a verified, authenticated FlipZone™ account',
              'Raw access codes are NEVER transmitted via SMS, email, or any external channel',
              'Notifications (push + email) inform the buyer a credential is waiting — they do not contain the code',
              'Access window begins ONLY after the buyer presses "Activate Access Code" — not on delivery',
              'Credential display requires an active JWT session at the moment of viewing',
              'Failed unlock attempts: max 5 before credential is temporarily suspended (15 min)',
            ]} />
            <H3>Phase 2 — Buyer Enhancements</H3>
            <UL items={[
              'QR code display at locker kiosk (in-app only)',
              'NFC tap-to-unlock (locker hardware integration)',
              'Buyer reputation score visible to sellers',
              'Trusted seller whitelist',
            ]} />
          </SectionBlock>

          {/* ── 8. OPERATOR WORKFLOWS ── */}
          <SectionBlock title="8. Operator Workflows" id="operator">
            <H3>Core Operator Operations — Phase 1</H3>
            <Table
              headers={['Workflow', 'Description', 'Endpoint']}
              rows={[
                ['Locker Inventory Management', 'Add, configure, deactivate lockers in facility', 'POST/PATCH/DELETE /lockers'],
                ['Facility Dashboard', 'Real-time view of all locker statuses', 'GET /facilities/:id/lockers'],
                ['View All Facility Audit Logs', 'Full event history scoped to their facility', 'GET /audit-logs?facility_id=:id'],
                ['Flag Locker', 'Mark locker for maintenance or investigation', 'PATCH /lockers/:id/flag'],
                ['Release Flagged Locker', 'Clear flag and return to service', 'PATCH /lockers/:id/release'],
                ['Manage Staff', 'Invite staff, assign permissions, revoke access', 'POST/DELETE /staff-assignments'],
                ['View Subscription', 'Manage facility tier and locker limits', 'GET/PATCH /subscriptions'],
                ['Escalate Dispute', 'Escalate unresolved dispute to Platform Admin', 'PATCH /disputes/:id/escalate'],
              ]}
            />
            <H3>Staff Permission Scopes</H3>
            <Table
              headers={['Permission', 'Description']}
              rows={[
                ['view_lockers', 'Read-only access to locker grid and statuses'],
                ['flag_lockers', 'Ability to flag/unflag lockers for maintenance'],
                ['view_audit_logs', 'Read-only access to facility audit logs'],
                ['acknowledge_alerts', 'Dismiss security alerts'],
              ]}
            />
            <H3>Phase 2 — Operator Enhancements</H3>
            <UL items={[
              'CCTV correlation dashboard — link audit events to camera footage timestamps',
              'Predictive maintenance alerts via locker sensor data',
              'Multi-facility management under single operator account',
              'White-label kiosk UI configuration',
            ]} />
          </SectionBlock>

          {/* ── 9. LOCKER ASSIGNMENT ── */}
          <SectionBlock title="9. Locker Assignment Logic" id="locker">
            <H3>Assignment Algorithm — Phase 1</H3>
            <CodeBlock>{`FUNCTION assignLocker(transaction_id, locker_id, seller_id):
  locker = DB.lockers.findById(locker_id)

  ASSERT locker.status == "available"                      → 409 if not
  ASSERT locker.facility.subscription.active              → 402 if not
  ASSERT seller.subscription.locker_count < limit         → 403 if exceeded

  BEGIN TRANSACTION
    locker.status = "assigned"
    locker.assigned_seller_id = seller_id
    transaction.locker_id = locker_id
    transaction.status = "LOCKER_ASSIGNED"
    auditLog.create({ event: "locker_assigned", ... })
  COMMIT

  RETURN { locker, transaction }`}</CodeBlock>
            <H3>Concurrency Control</H3>
            <UL items={[
              'Optimistic locking on locker rows — version field incremented on every write',
              'Any assignment update must include current version; mismatch → 409 Conflict',
              'Locker assignment endpoint is idempotent — double-submitting same transaction_id + locker_id is safe',
              'Distributed lock (500ms TTL) on locker_id during assignment write',
            ]} />
            <H3>Auto-Release Rules</H3>
            <Table
              headers={['Condition', 'Action', 'Notify']}
              rows={[
                ['Credential TTL exceeded (buyer never activated)', 'Locker → available; transaction → CANCELLED', 'Seller + Buyer'],
                ['Seller cancels before credential activated', 'Locker → available immediately', 'Buyer (alert only — no code exposed)'],
                ['Admin force-releases locker', 'Locker → available; audit log entry', 'Seller + Operator'],
                ['Dispute resolved as CANCELLED', 'Locker → available after confirmation window', 'Both parties'],
              ]}
            />
          </SectionBlock>

          {/* ── 10. ACCESS CREDENTIAL LOGIC ── */}
          <SectionBlock title="10. Access Credential Logic" id="accesscode">
            <H3>Credential Generation — Phase 1</H3>
            <CodeBlock>{`FUNCTION generateAccessCredential(transaction_id):
  raw_code  = secureRandom(8 characters, alphanumeric uppercase)
              // e.g. "K7XM2Q4R"
  salt      = secureRandom(16 bytes, hex)
  code_hash = HMAC-SHA256(raw_code + salt, APP_SECRET_KEY)

  // Expiry clock does NOT start at generation.
  // Expiry clock starts only when buyer activates credential.
  // expires_at is set at activation time, not generation time.

  DB.access_credentials.create({
    transaction_id,
    code_hash,
    salt,
    expires_at: null,           // set on buyer activation
    activated_at: null,          // set on buyer activation
    status: "pending_release",
    use_count: 0,
    max_uses: 1
  })

  RETURN raw_code  // Stored for in-app display only — never transmitted externally`}</CodeBlock>

            <H3>Seller Release Flow</H3>
            <CodeBlock>{`FUNCTION releaseCredentialToBuyer(transaction_id, seller_id):
  ASSERT transaction.seller_id == seller_id
  ASSERT transaction.status == "DEPOSIT_CONFIRMED"
  ASSERT credential.status == "pending_release"

  BEGIN TRANSACTION
    credential.status = "staged"
    transaction.status = "CREDENTIAL_DELIVERED"
    notification.create({ user_id: buyer_id, type: "credential_staged",
                          message: "A locker access credential is waiting in your FlipZone™ account." })
    auditLog.create({ event: "credential_released", seller_id, buyer_id })
  COMMIT`}</CodeBlock>

            <H3>Buyer Activation Flow</H3>
            <CodeBlock>{`FUNCTION activateCredential(credential_id, buyer_id):
  credential = DB.access_credentials.findById(credential_id)

  ASSERT credential.status == "staged"
  ASSERT transaction.buyer_id == buyer_id
  ASSERT buyer.verified == true                → 403 if not verified

  ttl = getCredentialTTL(buyer.subscription_tier)

  BEGIN TRANSACTION
    credential.activated_at = NOW()
    credential.expires_at   = NOW() + ttl
    credential.status       = "active"
    transaction.status      = "CREDENTIAL_ACTIVE"
    auditLog.create({ event: "credential_activated", buyer_id, expires_at })
  COMMIT

  RETURN { activated: true, expires_at: credential.expires_at }`}</CodeBlock>

            <H3>Redemption Validation Flow</H3>
            <CodeBlock>{`FUNCTION redeemCredential(raw_code, transaction_id, buyer_id):
  record = DB.access_credentials.findByTransaction(transaction_id)

  ASSERT record.status == "active"                    → 410 Gone
  ASSERT NOW() < record.expires_at                   → 410 Expired
  ASSERT record.use_count < record.max_uses           → 409 Already Used
  ASSERT transaction.buyer_id == buyer_id             → 403 Forbidden

  computed_hash = HMAC-SHA256(raw_code + record.salt, APP_SECRET_KEY)
  ASSERT computed_hash == record.code_hash            → 401 Invalid (timing-safe compare)

  BEGIN TRANSACTION
    record.use_count += 1
    record.used_at    = NOW()
    record.status     = "used"
    transaction.status = "PICKUP_PENDING"
    auditLog.create({ event: "access_granted", success: true })
  COMMIT`}</CodeBlock>

            <H3>Credential TTL by Subscription Tier</H3>
            <Table
              headers={['Subscription', 'TTL (from buyer activation)', 'Max TTL (configurable)']}
              rows={[
                ['Starter', '24 hours', '48 hours'],
                ['Business', '48 hours', '7 days'],
                ['Enterprise', '7 days', '30 days'],
              ]}
            />
            <H3>Credential Revocation</H3>
            <UL items={[
              'Admin or Operator can revoke any active credential via PATCH /access-credentials/:id/revoke',
              'Revocation immediately invalidates the credential — no grace period',
              'Revocation logs a "credential_revoked" audit event',
              'Buyer is notified in-app of revocation with reason — no code content exposed',
            ]} />
          </SectionBlock>

          {/* ── 11. CREDENTIAL OWNERSHIP & TRANSFER RESTRICTIONS ── */}
          <SectionBlock title="11. Credential Ownership & Transfer Restrictions" id="credtransfer">
            <CalloutBox color="amber">
              <strong>Architectural Trust Requirement:</strong> This section defines the platform's non-negotiable credential ownership model. All access credentials are bound to a specific transaction and a specific verified FlipZone™ buyer account. These rules preserve the platform's trust model, maintain transaction accountability, strengthen auditability, reduce unauthorized credential sharing, and ensure locker access remains tied to verified FlipZone™ identities.
            </CalloutBox>
            <H3>Core Requirements</H3>
            <UL items={[
              'Access credentials may only be delivered to the designated verified buyer account associated with the transaction.',
              'Access credentials may not be reassigned, forwarded, transferred, shared, or delegated to another user after issuance.',
              'If a seller wishes to change the intended recipient, the original credential must be revoked and a new transaction workflow initiated.',
              'All credential issuance, activation, revocation, and redemption events must be recorded in the immutable Audit Log.',
              'Credential visibility is restricted to authenticated users within the FlipZone™ platform.',
              'Raw access credentials must never be transmitted through external channels such as SMS, email, or third-party messaging platforms.',
              'Push notifications and emails may notify a buyer that a credential is waiting, but the credential itself may only be viewed and activated within the verified FlipZone™ application.',
            ]} />
            <H3>Enforcement Points</H3>
            <Table
              headers={['Layer', 'Enforcement Mechanism']}
              rows={[
                ['Backend — Credential delivery', 'credential.buyer_id must match transaction.buyer_id at every stage; mismatch → 403 Forbidden'],
                ['Backend — Activation', 'Activation endpoint verifies authenticated user === transaction.buyer_id before proceeding'],
                ['Backend — Redemption', 'Redemption validates buyer identity against transaction record using timing-safe comparison'],
                ['Backend — Revocation path', 'Any recipient change triggers mandatory revocation + new transaction creation'],
                ['Audit Log', 'All credential lifecycle events (issue, stage, activate, redeem, revoke) written as immutable records'],
                ['Notifications', 'Notification payloads are stripped of raw credential data server-side before dispatch'],
                ['Frontend / API', 'Credential display endpoint requires active JWT session; no credential data returned to unauthenticated requests'],
              ]}
            />
            <H3>Recipient Change Workflow</H3>
            <P>If a seller needs to redirect a credential to a different buyer after issuance, the following steps are mandatory:</P>
            <UL items={[
              '1. Seller requests credential revocation via app',
              '2. System revokes the existing credential (status → "revoked"); audit log entry written',
              '3. Locker returns to DEPOSIT_CONFIRMED status',
              '4. Seller initiates a new transaction with the correct verified buyer account',
              '5. New credential generated and released through the standard workflow',
              '6. Both the revocation and new issuance events are independently logged in the audit chain',
            ]} />
          </SectionBlock>

          {/* ── 12. AUDIT LOGGING ── */}
          <SectionBlock title="12. Audit Logging" id="audit">
            <H3>Immutability Requirements</H3>
            <P>All audit log records must be write-once. No UPDATE or DELETE operations are permitted on audit_logs by any application role. Records may only be soft-archived by Platform Admin with a separate archived_at timestamp.</P>
            <H3>Logged Event Types</H3>
            <Table
              headers={['Event Type', 'Trigger', 'Critical Fields']}
              rows={[
                ['locker_assigned', 'Locker assigned to transaction', 'locker_id, seller_id, transaction_id'],
                ['locker_released', 'Locker returned to available', 'locker_id, release_reason'],
                ['deposit_confirmed', 'Seller confirms item deposited with photo', 'locker_id, seller_id, photo_ref, timestamp'],
                ['credential_generated', 'Secure credential generated post-deposit', 'transaction_id, status: pending_release'],
                ['credential_released', 'Seller manually releases credential to buyer', 'transaction_id, seller_id, buyer_id'],
                ['credential_staged', 'Credential delivered to buyer\'s FlipZone™ account', 'transaction_id, buyer_id'],
                ['credential_activated', 'Buyer activates credential inside app', 'transaction_id, buyer_id, expires_at'],
                ['access_granted', 'Successful credential redemption at locker', 'locker_id, buyer_id, ip_address'],
                ['access_denied', 'Failed credential attempt', 'locker_id, ip_address, failure_reason, attempt_count'],
                ['credential_revoked', 'Credential revoked by seller/admin/operator', 'credential_id, revoked_by, reason'],
                ['pickup_confirmed', 'Buyer confirms item pickup with photo', 'transaction_id, buyer_id, photo_ref'],
                ['locker_flagged', 'Locker flagged by operator/admin', 'locker_id, flagged_by, reason'],
                ['dispute_raised', 'Dispute created', 'transaction_id, raised_by, reason'],
                ['dispute_resolved', 'Dispute closed', 'transaction_id, resolved_by, outcome'],
                ['login', 'User authentication event', 'user_id, ip_address, user_agent, success'],
                ['token_issued', 'JWT issued', 'user_id, session_id'],
              ]}
            />
            <H3>Retention Policy</H3>
            <UL items={[
              'Phase 1: 12-month hot storage in primary database',
              'Phase 2: Auto-archive to cold storage after 12 months, queryable for 7 years',
              'Legal hold: Any flagged/disputed transactions exempt from archival until resolved + 24 months',
            ]} />
          </SectionBlock>

          {/* ── 13. REPUTATION SYSTEM ── */}
          <SectionBlock title="13. Reputation System" id="reputation">
            <H3>Score Architecture — Phase 1</H3>
            <CodeBlock>{`trust_score = (
  (avg_rating × 40) +
  (completion_rate × 30) +
  (dispute_rate_inverse × 20) +
  (tenure_bonus × 10)
) / 100

Where:
  avg_rating           = mean of reputation_events.score (1–5, normalized ×20)
  completion_rate      = completed_transactions / total_transactions (×100)
  dispute_rate_inverse = (1 - disputes_raised / total_transactions) × 100
  tenure_bonus         = MIN(account_age_months / 24, 1) × 100`}</CodeBlock>
            <H3>Reputation Event Categories</H3>
            <Table
              headers={['Category', 'Weight', 'Description']}
              rows={[
                ['transaction_rating', '1.0×', 'Standard post-transaction buyer-rates-seller'],
                ['dispute_against', '−2.0×', 'Dispute raised against this user'],
                ['dispute_won', '+1.5×', 'Dispute resolved in user\'s favour'],
                ['no_show', '−1.5×', 'Transaction cancelled due to seller non-deposit'],
                ['fast_handoff', '+0.5×', 'Transaction completed within 6 hours of credential activation'],
              ]}
            />
            <H3>Phase 2 — Reputation Enhancements</H3>
            <UL items={[
              'Identity verification badge (government ID or business registration)',
              'Automated fraud pattern detection — flag accounts with sudden rating drops',
              'Advanced analytics: dispute rate trends, response time scoring',
            ]} />
          </SectionBlock>

          {/* ── 14. SUBSCRIPTION TIERS ── */}
          <SectionBlock title="14. Subscription Tiers" id="subscriptions">
            <Table
              headers={['Feature', 'Starter', 'Business', 'Enterprise']}
              rows={[
                ['Price', '$9.99/mo', '$49.99/mo', 'Custom'],
                ['Active Locker Slots', '1', '10', 'Unlimited'],
                ['Concurrent Transactions', '2', '20', 'Unlimited'],
                ['Credential TTL (from activation)', '48 hours', '7 days', '30 days'],
                ['Staff Accounts', '0', '5', 'Unlimited'],
                ['Audit Log Retention', '90 days', '12 months', '7 years'],
                ['Bulk Transaction Import', '✗', '✓', '✓'],
                ['API Access', '✗', '✗', '✓'],
                ['CCTV Integration (Phase 2)', '✗', 'Read-only', 'Full'],
                ['White-label Kiosk (Phase 2)', '✗', '✗', '✓'],
                ['SLA', 'Best effort', '99.5% uptime', '99.9% uptime + dedicated support'],
                ['Analytics Dashboard', 'Basic', 'Advanced', 'Custom BI exports'],
              ]}
            />
            <H3>Subscription Enforcement</H3>
            <UL items={[
              'Limits enforced server-side on every write operation — client UI gates are advisory only',
              'Downgrade path: excess lockers/transactions flagged but not force-cancelled — seller has 30-day grace period',
              'Upgrade path: immediate; new limits apply on next request after payment confirmation',
              'Free trial: 14 days on Business tier for new operator accounts',
            ]} />
          </SectionBlock>

          {/* ── 15. NOTIFICATIONS ── */}
          <SectionBlock title="15. Notifications" id="notifications">
            <H3>Notification Channels — Phase 1</H3>
            <Table
              headers={['Channel', 'Use Case']}
              rows={[
                ['Push Notification (FCM/APNs)', 'Real-time transaction events, credential staging alerts'],
                ['Email', 'Account events, credential staging alerts, dispute updates'],
                ['In-App (Notification Centre)', 'All event types — persistent, stored in notifications table'],
              ]}
            />
            <CalloutBox color="green">
              <strong>Credential Security Rule:</strong> Raw access credentials are NEVER included in push notifications or emails. External notifications inform the user that action is required inside the FlipZone™ app. All credential viewing and activation occurs exclusively within the authenticated app.
            </CalloutBox>
            <H3>Critical Notification Events</H3>
            <Table
              headers={['Event', 'Recipients', 'Channels', 'Content']}
              rows={[
                ['Credential staged (seller released)', 'Buyer', 'Push + Email', '"A locker access credential is waiting in your FlipZone™ account."'],
                ['Item deposited', 'Buyer', 'Push', 'Locker location details only'],
                ['Credential activated', 'Seller', 'Push + In-App', 'Buyer has activated access'],
                ['Pickup confirmed', 'Seller', 'Push + Email', 'Item retrieved; transaction closing'],
                ['Dispute raised', 'Counterparty + Operator + Admin', 'Push + Email', 'Dispute details'],
                ['Locker flagged', 'Operator + affected Seller', 'Push + Email', 'Locker number + reason'],
                ['Credential expiring in 2 hours', 'Buyer', 'Push + In-App', 'Reminder only — no code included'],
                ['Subscription expiring in 7 days', 'Seller/Operator', 'Email', 'Renewal reminder'],
                ['Login from new device', 'Account holder', 'Email (always)', 'Security alert'],
              ]}
            />
            <H3>Phase 2 — Notification Enhancements</H3>
            <UL items={[
              'WhatsApp Business API for international markets (alert/status only — no credentials)',
              'Configurable notification preferences per user',
              'Operator webhook callbacks for enterprise system integration',
            ]} />
          </SectionBlock>

          {/* ── 16. API ENDPOINTS ── */}
          <SectionBlock title="16. API Endpoints" id="api">
            <H3>Auth</H3>
            <CodeBlock>{`POST   /auth/register                      Create new user account
POST   /auth/login                         Issue JWT + refresh token
POST   /auth/refresh                       Rotate refresh token
POST   /auth/logout                        Revoke refresh token
POST   /auth/forgot-password               Send reset link
POST   /auth/reset-password                Consume reset token, set new password
POST   /auth/verify-email                  Consume email verification token
POST   /auth/pin/set                       Set/update 6-digit user PIN
POST   /auth/pin/verify                    Validate 6-digit PIN (requires active session)`}</CodeBlock>
            <H3>Users</H3>
            <CodeBlock>{`GET    /users/me                            Current user profile
PATCH  /users/me                            Update profile
GET    /users/:id/reputation                Public reputation summary`}</CodeBlock>
            <H3>Transactions</H3>
            <CodeBlock>{`POST   /transactions                        Create transaction
GET    /transactions                        List (filtered by role, status)
GET    /transactions/:id                    Get transaction detail
PATCH  /transactions/:id/assign-locker      Assign locker
PATCH  /transactions/:id/deposit            Confirm deposit (with photo)
PATCH  /transactions/:id/release-credential Seller releases credential to buyer
PATCH  /transactions/:id/cancel             Cancel transaction`}</CodeBlock>
            <H3>Lockers</H3>
            <CodeBlock>{`GET    /lockers                             List (filter: facility_id, status, size)
GET    /lockers/:id                        Locker detail
POST   /lockers                            Create locker [Operator]
PATCH  /lockers/:id                        Update locker [Operator]
PATCH  /lockers/:id/flag                   Flag locker [Operator/Admin]
PATCH  /lockers/:id/release                Release locker [Operator/Admin]`}</CodeBlock>
            <H3>Access Credentials</H3>
            <CodeBlock>{`PATCH  /access-credentials/:id/activate    Buyer activates staged credential
GET    /access-credentials/:id             View live credential (active session required)
PATCH  /access-credentials/:id/revoke      Revoke credential [Admin/Operator/Seller]
POST   /access-credentials/redeem          Redeem credential at locker`}</CodeBlock>
            <H3>Confirmations</H3>
            <CodeBlock>{`POST   /deposit-confirmations              Submit deposit photo confirmation [Seller]
POST   /pickup-confirmations               Submit pickup photo confirmation [Buyer]`}</CodeBlock>
            <H3>Audit Logs</H3>
            <CodeBlock>{`GET    /audit-logs                         List logs (filter: locker_id, user_id, event_type, date range)
GET    /audit-logs/:id                     Single event detail`}</CodeBlock>
            <H3>Subscriptions & Disputes</H3>
            <CodeBlock>{`GET    /subscriptions/me                   Current subscription
POST   /subscriptions/upgrade              Upgrade tier
POST   /disputes                           Raise dispute
GET    /disputes/:id                       Get dispute detail
PATCH  /disputes/:id/resolve               Resolve dispute [Admin]
PATCH  /disputes/:id/escalate              Escalate [Operator]`}</CodeBlock>
            <H3>Phase 2 — Enterprise API</H3>
            <CodeBlock>{`GET    /v2/facilities                      List all facilities [Enterprise]
POST   /v2/transactions/bulk               Bulk transaction import [Enterprise]
GET    /v2/analytics/summary               Aggregated platform analytics [Admin]
POST   /v2/webhooks                        Register webhook endpoint [Enterprise]`}</CodeBlock>
          </SectionBlock>

          {/* ── 17. INFRASTRUCTURE ── */}
          <SectionBlock title="17. Infrastructure Recommendations" id="infrastructure">
            <H3>Phase 1 — MVP Stack</H3>
            <Table
              headers={['Layer', 'Recommendation', 'Rationale']}
              rows={[
                ['Runtime', 'Node.js 22 LTS / TypeScript', 'Ecosystem maturity, async I/O performance'],
                ['Framework', 'Fastify or Hono', 'Low overhead, schema validation, TypeScript-first'],
                ['Primary Database', 'PostgreSQL 16 (managed — AWS RDS or Supabase)', 'ACID compliance, row-level security, JSONB support'],
                ['Cache / Locks', 'Redis 7', 'Distributed locks, session cache, rate limit counters'],
                ['Object Storage', 'AWS S3 / Cloudflare R2', 'Deposit and pickup photo storage, encrypted'],
                ['Email', 'SendGrid / AWS SES', 'Deliverability, template management'],
                ['Push Notifications', 'Firebase Cloud Messaging', 'Cross-platform iOS/Android'],
                ['Hosting', 'Railway / AWS ECS Fargate / Render', 'Container-based, auto-scaling'],
                ['CDN', 'Cloudflare', 'DDoS protection, edge caching'],
                ['Secrets Management', 'AWS Secrets Manager / Doppler', 'Encrypted secret rotation'],
                ['CI/CD', 'GitHub Actions', 'Automated test + deploy pipeline'],
              ]}
            />
            <P>SMS provider (e.g. Twilio) may be included for account-level alerts and notifications — not for credential delivery.</P>
            <H3>Phase 2 — Scaling Stack</H3>
            <UL items={[
              'Message queue: AWS SQS or BullMQ for async notification dispatch and audit log processing',
              'Read replicas for analytics and audit log queries',
              'Full-text search for locker and transaction search',
              'CCTV stream integration: Separate microservice with encrypted stream proxy',
              'Kubernetes for horizontal scaling of API and worker pods',
            ]} />
            <H3>Environment Strategy</H3>
            <Table
              headers={['Environment', 'Purpose', 'Data Policy']}
              rows={[
                ['Development', 'Feature development', 'Synthetic data only — no real PII'],
                ['Staging', 'Integration testing, UAT', 'Anonymised production clone, refreshed weekly'],
                ['Production', 'Live traffic', 'Full encryption at rest and in transit'],
              ]}
            />
          </SectionBlock>

          {/* ── 18. SECURITY ── */}
          <SectionBlock title="18. Security Requirements" id="security">
            <H3>Mandatory Security Controls — Phase 1</H3>
            <Table
              headers={['Control', 'Requirement']}
              rows={[
                ['Transport', 'TLS 1.3 minimum on all endpoints. HSTS enforced. No HTTP in production.'],
                ['Encryption at Rest', 'AES-256 for all database fields classified as sensitive (credentials, PII, auth data)'],
                ['Input Validation', 'All inputs validated with strict JSON schema (Zod/Joi) before processing'],
                ['SQL Injection', 'Parameterised queries only'],
                ['Rate Limiting', 'Auth endpoints: 10 req/min per IP. Credential redemption: 5 attempts per credential. API: per-key quotas.'],
                ['CORS', 'Allowlist-only origins. No wildcard in production.'],
                ['Secrets', 'Zero secrets in code or logs. Secrets Manager only. Rotate every 90 days.'],
                ['Dependency Scanning', 'Automated CVE scanning on every CI/CD run (Dependabot / Snyk)'],
                ['Credential Storage', 'Raw access codes never persisted. Stored as HMAC-SHA256 hash + salt only.'],
                ['Audit Log Integrity', 'Write-once enforced at database level via trigger. No application-layer delete.'],
                ['Credential Isolation', 'Credentials only viewable inside authenticated FlipZone™ session. Never in external communications.'],
              ]}
            />
            <H3>Penetration Testing</H3>
            <UL items={[
              'Full OWASP Top 10 penetration test required before production launch',
              'Annual third-party pentest thereafter',
            ]} />
            <H3>Compliance Considerations</H3>
            <UL items={[
              'GDPR / CCPA: User data export and deletion endpoints required',
              'PCI-DSS: Subscription billing to be handled via Stripe or equivalent — no raw card data stored on FlipZone™ infrastructure',
              'SOC 2 Type II: Recommended for Enterprise tier credibility (Phase 2)',
            ]} />
          </SectionBlock>

          {/* ── 19. BACKUP / DR ── */}
          <SectionBlock title="19. Backup & Disaster Recovery" id="backup">
            <H3>Phase 1 — Backup Requirements</H3>
            <Table
              headers={['Asset', 'Backup Frequency', 'Retention', 'Method']}
              rows={[
                ['Primary PostgreSQL DB', 'Continuous WAL streaming + daily snapshot', '30 days', 'RDS automated backups / pg_dump to S3'],
                ['Redis cache', 'Ephemeral by design', 'N/A', 'AOF persistence for session recovery only'],
                ['Object Storage (S3)', 'Versioning enabled', 'Indefinite', 'S3 versioning + cross-region replication'],
                ['Application secrets', 'On-change snapshot', '12 months', 'Secrets Manager version history'],
                ['Audit logs', 'Real-time replication to secondary DB', '7 years', 'Streaming replica + annual archive'],
              ]}
            />
            <H3>RTO / RPO Targets</H3>
            <Table
              headers={['Tier', 'RTO (Recovery Time Objective)', 'RPO (Recovery Point Objective)']}
              rows={[
                ['Starter', '4 hours', '1 hour'],
                ['Business', '2 hours', '15 minutes'],
                ['Enterprise', '30 minutes', '5 minutes'],
              ]}
            />
            <H3>Disaster Recovery Runbook</H3>
            <UL items={[
              'Runbook maintained in version control and tested quarterly',
              'Failover to read replica automated via health-check trigger',
              'All critical operations must be idempotent to allow safe replay on recovery',
              'Post-incident review required for any outage exceeding 1 hour',
            ]} />
          </SectionBlock>

          {/* ── 20. IP OWNERSHIP ── */}
          <SectionBlock title="20. Intellectual Property Ownership Requirements" id="ip">
            <H3>Ownership Clause — Mandatory</H3>
            <P>All custom code, database schemas, API specifications, documentation, and system architecture produced under this engagement are the exclusive intellectual property of R-Builders LLC upon delivery and full payment. The following requirements must be included in any development contract or Statement of Work (SOW):</P>
            <Table
              headers={['Requirement', 'Detail']}
              rows={[
                ['Full IP Assignment', 'Developer assigns all rights, title, and interest in deliverables to R-Builders LLC upon final payment'],
                ['No License Retention', 'Developer retains no license to reuse, resell, or repurpose any code, schema, or design produced for this engagement'],
                ['Third-Party Components', 'All third-party libraries must be MIT, Apache 2.0, or BSD licensed. No GPL-licensed code in production without written approval.'],
                ['Open Source Disclosure', 'Developer must disclose all open-source dependencies and their licenses prior to delivery'],
                ['No Portfolio Usage', 'Developer may not use FlipZone™ code, designs, or brand assets in portfolio, marketing, or public demonstrations without written consent from R-Builders LLC'],
                ['Source Code Delivery', 'Source code must be delivered to a GitHub repository owned by R-Builders LLC — no code retained on third-party accounts at project close'],
                ['Confidentiality / NDA', 'NDA must be executed before this specification or any related documents are shared with any development team or contractor'],
                ['Non-Compete', 'Not included in this specification. If desired, a tailored non-compete clause should be drafted separately by qualified legal counsel prior to contract execution.'],
              ]}
            />
          </SectionBlock>

          {/* ── 21. DELIVERABLES ── */}
          <SectionBlock title="21. Deliverable Requirements" id="deliverables">
            <H3>Phase 1 — MVP Deliverables</H3>
            <Table
              headers={['#', 'Deliverable', 'Acceptance Criteria']}
              rows={[
                ['1', 'REST API (all Phase 1 endpoints)', 'All endpoints tested via Postman collection, documented in OpenAPI 3.1'],
                ['2', 'PostgreSQL schema with migrations', 'All entities created via migration tool; reversible up/down migrations'],
                ['3', 'Authentication system', 'JWT + refresh tokens, 6-digit PIN auth, email verification — all passing automated tests'],
                ['4', 'Seller credential release flow', 'Full seller deposit → photo confirm → manual credential release workflow implemented and tested'],
                ['5', 'Buyer credential activation flow', 'Staged credential → buyer activation → access window logic fully unit-tested'],
                ['6', 'Credential ownership & transfer restrictions', 'All transfer restriction rules enforced server-side; recipient-change workflow (revoke + new transaction) fully tested'],
                ['7', 'Credential generation & redemption', 'HMAC generation, hash validation, expiry from activation, revocation — fully tested'],
                ['8', 'Audit logging system', 'Write-once enforced, all event types implemented and tested'],
                ['9', 'Subscription tier enforcement', 'All three tiers gating correct limits server-side with passing integration tests'],
                ['10', 'Notification system (Push + Email + In-App)', 'All critical events trigger correct notifications — no raw credentials in external messages'],
                ['11', 'Deposit & pickup photo confirmation', 'Photo upload, storage, and transaction status linkage implemented'],
                ['12', 'Admin panel (basic)', 'User management, dispute resolution, locker override via authenticated admin routes'],
                ['13', 'CI/CD pipeline', 'GitHub Actions deploying to staging on PR merge, production on release tag'],
                ['14', 'Test suite', 'Minimum 80% code coverage. Unit + integration + E2E for critical paths.'],
                ['15', 'OpenAPI documentation', 'All endpoints documented with request/response schemas and error codes'],
                ['16', 'Security self-assessment', 'OWASP Top 10 checklist completed and signed off before launch'],
                ['17', 'Deployment documentation', 'Step-by-step production deployment runbook in repository README'],
                ['18', 'Source code (GitHub — R-Builders LLC owned org)', 'Clean commit history, no secrets in git history, .env.example provided'],
              ]}
            />
            <H3>Phase 2 — Enhancement Deliverables</H3>
            <Table
              headers={['#', 'Deliverable', 'Notes']}
              rows={[
                ['1', 'CCTV correlation microservice', 'Encrypted stream proxy, locker-event linking'],
                ['2', 'Enterprise API + API key management', 'Scoped keys, rate limiting, webhook callbacks'],
                ['3', 'Advanced reputation engine', 'Fraud detection, identity verification badge'],
                ['4', 'Analytics dashboard backend', 'Aggregation queries, BI export endpoints'],
                ['5', 'Multi-facility operator management', 'Hierarchy enforcement, cross-facility reporting'],
                ['6', 'SOC 2 Type II readiness documentation', 'Evidence collection for security audit'],
                ['7', 'Load testing report', 'Target: 1,000 concurrent users without degradation'],
              ]}
            />
            <H3>Handoff Standards</H3>
            <UL items={[
              'All code delivered to a GitHub repository under the R-Builders LLC organisation before final payment',
              'All environment variables documented in .env.example — never in committed code',
              'Database migrations must be reversible (up + down)',
              'No hardcoded secrets, IPs, or environment-specific values in any source file',
              'Deployment handoff call required — developer walks R-Builders LLC team through production deployment',
              'Two-week post-launch support period included in contract',
            ]} />

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap gap-3 items-center justify-between">
                <div className="text-xs text-gray-500">
                  <span className="font-bold text-gray-700">FlipZone™ Backend Architecture Specification v1.1</span><br />
                  © 2026 R-Builders LLC. FlipZone™ is a trademark of R-Builders LLC. Confidential. Unauthorized distribution prohibited.
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge color="green">Phase 1 MVP: 3 Months</Badge>
                  <Badge color="purple">Phase 2: Months 4–8</Badge>
                </div>
              </div>
            </div>
          </SectionBlock>

        </main>
      </div>
    </div>
  );
}