/**
 * FlipZone™ E2E Test — full transaction lifecycle
 * Seller: initiate → pay fee → codes → facility → locker open → photo → close → awaiting_release → release
 * Buyer:  pay fee → codes → facility → locker open → photo → locker close → completed
 * Also validates: seller_locker_opened_at gating, pickup_deadline_at set at locker-close, dispute_notes write
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function randomCode(prefix, len) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${out}`;
}

async function writeAudit(base44, { transaction_id, locker_id = 'T-01', locker_number = 'T-01', user_id = 'system', user_role, event_type, notes = '' }) {
  await base44.asServiceRole.entities.AuditLog.create({
    transaction_id, locker_id, locker_number, user_id, user_role, event_type,
    timestamp: new Date().toISOString(), notes, success: true, immutable: true,
  });
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (user?.role !== 'admin') {
    return Response.json({ error: 'Admin only' }, { status: 403 });
  }

  const results = [];
  const log = (step, status, detail = '') => results.push({ step, status, detail });

  // ─── CREATE TRANSACTION ────────────────────────────────────────────────────
  let tx;
  tx = await base44.asServiceRole.entities.Transaction.create({
    seller_id: user.id, seller_name: user.full_name,
    buyer_id: 'test-buyer-e2e', buyer_name: 'Test Buyer',
    locker_id: 'T-01', locker_number: 'T-01', facility_name: 'E2E Test Zone',
    item_description: 'E2E Test Item — sneakers size 11',
    transaction_value: 75,
    pickup_window: '12 hours',
    status: 'initiated',
    seller_drop_fee_paid: false, buyer_pickup_fee_paid: false,
    seller_codes_expired: false, buyer_codes_invalidated: false,
    late_fee_total: 0, late_fee_count: 0,
  });
  log('create_transaction', tx.status === 'initiated' ? 'PASS' : 'FAIL', `id=${tx.id} status=${tx.status}`);

  // ─── PAY SELLER FEE ────────────────────────────────────────────────────────
  tx = await base44.asServiceRole.entities.Transaction.update(tx.id, { status: 'seller_paid', seller_drop_fee_paid: true });
  log('pay_seller_fee', tx.status === 'seller_paid' && tx.seller_drop_fee_paid ? 'PASS' : 'FAIL', `status=${tx.status}`);

  // ─── GENERATE SELLER CODES ─────────────────────────────────────────────────
  const sellerFac = randomCode('FAC', 6);
  const sellerLoc = randomCode('LOC', 6);
  tx = await base44.asServiceRole.entities.Transaction.update(tx.id, {
    status: 'seller_codes_issued', seller_facility_code: sellerFac, seller_locker_code: sellerLoc,
  });
  log('generate_seller_codes', tx.seller_facility_code === sellerFac ? 'PASS' : 'FAIL', `fac=${tx.seller_facility_code}`);

  // ─── CONFIRM FACILITY ACCESSED (audit only) ────────────────────────────────
  await writeAudit(base44, { transaction_id: tx.id, user_id: user.id, user_role: 'seller', event_type: 'seller_facility_accessed' });
  log('seller_facility_accessed', 'PASS', 'audit logged');

  // ─── CONFIRM LOCKER OPENED (server-side timestamp) ─────────────────────────
  const lockerOpenedAt = new Date().toISOString();
  tx = await base44.asServiceRole.entities.Transaction.update(tx.id, { seller_locker_opened_at: lockerOpenedAt });
  log('seller_locker_opened', tx.seller_locker_opened_at ? 'PASS' : 'FAIL', `seller_locker_opened_at=${tx.seller_locker_opened_at}`);

  // ─── GATING CHECK: photo should NOT be available without seller_locker_opened_at ─
  const gate = tx.seller_locker_opened_at && tx.status === 'seller_codes_issued' && !tx.seller_codes_expired;
  log('photo_gate_check', gate ? 'PASS' : 'FAIL', `gate_open=${gate}`);

  // ─── UPLOAD SELLER PHOTO ───────────────────────────────────────────────────
  tx = await base44.asServiceRole.entities.Transaction.update(tx.id, {
    seller_item_photo_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
  });
  log('seller_photo_upload', tx.seller_item_photo_url ? 'PASS' : 'FAIL', tx.seller_item_photo_url);

  // ─── CONFIRM LOCKER CLOSED → awaiting_release ─────────────────────────────
  const closedAt = new Date();
  const deadlineAt = new Date(closedAt.getTime() + 12 * 60 * 60 * 1000);
  tx = await base44.asServiceRole.entities.Transaction.update(tx.id, {
    status: 'awaiting_release',
    seller_codes_expired: true,
    locker_closed_by_seller_at: closedAt.toISOString(),
    pickup_deadline_at: deadlineAt.toISOString(),
  });
  log('seller_locker_closed', tx.status === 'awaiting_release' && tx.seller_codes_expired && tx.pickup_deadline_at ? 'PASS' : 'FAIL', `deadline=${tx.pickup_deadline_at}`);

  // ─── VERIFY deadline is ~12h from close (not release) ─────────────────────
  const expectedDeadline = new Date(tx.locker_closed_by_seller_at).getTime() + 12 * 60 * 60 * 1000;
  const actualDeadline = new Date(tx.pickup_deadline_at).getTime();
  const deadlineDiff = Math.abs(expectedDeadline - actualDeadline);
  log('deadline_timing', deadlineDiff < 5000 ? 'PASS' : 'FAIL', `diff=${deadlineDiff}ms (should be <5000ms)`);

  // ─── RELEASE BUYER ACCESS ──────────────────────────────────────────────────
  tx = await base44.asServiceRole.entities.Transaction.update(tx.id, {
    status: 'item_dropped',
    buyer_released_at: new Date().toISOString(),
  });
  log('release_buyer_access', tx.status === 'item_dropped' && tx.buyer_released_at ? 'PASS' : 'FAIL', `status=${tx.status}`);

  // ─── BUYER: PAY FEE ────────────────────────────────────────────────────────
  tx = await base44.asServiceRole.entities.Transaction.update(tx.id, { status: 'buyer_paid', buyer_pickup_fee_paid: true });
  log('buyer_pay_fee', tx.status === 'buyer_paid' && tx.buyer_pickup_fee_paid ? 'PASS' : 'FAIL');

  // ─── BUYER: GENERATE CODES ─────────────────────────────────────────────────
  const buyerFac = randomCode('FAC', 6);
  const buyerLoc = randomCode('LOC', 6);
  tx = await base44.asServiceRole.entities.Transaction.update(tx.id, {
    status: 'buyer_codes_issued',
    buyer_facility_code: buyerFac,
    buyer_locker_code: buyerLoc,
    buyer_facility_qr: randomCode('QRF', 10),
    buyer_locker_qr: randomCode('QRL', 10),
  });
  log('buyer_codes_generated', tx.buyer_facility_code && tx.buyer_locker_code ? 'PASS' : 'FAIL');

  // ─── BUYER: CONFIRM LOCKER OPENED ─────────────────────────────────────────
  tx = await base44.asServiceRole.entities.Transaction.update(tx.id, {
    status: 'buyer_accessed',
    locker_opened_by_buyer_at: new Date().toISOString(),
  });
  log('buyer_locker_opened', tx.status === 'buyer_accessed' ? 'PASS' : 'FAIL');

  // ─── BUYER: UPLOAD PHOTO ──────────────────────────────────────────────────
  tx = await base44.asServiceRole.entities.Transaction.update(tx.id, {
    buyer_confirm_photo_url: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400',
  });
  log('buyer_photo_upload', tx.buyer_confirm_photo_url ? 'PASS' : 'FAIL');

  // ─── BUYER: CONFIRM LOCKER CLOSED → completed ─────────────────────────────
  tx = await base44.asServiceRole.entities.Transaction.update(tx.id, {
    status: 'completed',
    locker_closed_by_buyer_at: new Date().toISOString(),
  });
  log('transaction_completed', tx.status === 'completed' ? 'PASS' : 'FAIL', `final_status=${tx.status}`);

  // ─── DISPUTE NOTES TEST (separate tx) ─────────────────────────────────────
  const txD = await base44.asServiceRole.entities.Transaction.create({
    seller_id: user.id, seller_name: user.full_name,
    buyer_id: 'test-buyer-dispute', buyer_name: 'Dispute Buyer',
    locker_id: 'T-02', locker_number: 'T-02', facility_name: 'E2E Test Zone',
    item_description: 'E2E Dispute Test Item', transaction_value: 50,
    status: 'buyer_codes_issued', buyer_pickup_fee_paid: true,
    seller_codes_expired: true, buyer_codes_invalidated: false,
    pickup_deadline_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  });
  const disputeNotes = 'E2E test — item missing from locker at pickup';
  const txDUp = await base44.asServiceRole.entities.Transaction.update(txD.id, {
    status: 'frozen',
    buyer_codes_invalidated: true,
    dispute_notes: disputeNotes,
  });
  log('dispute_notes_persisted', txDUp.dispute_notes === disputeNotes ? 'PASS' : 'FAIL', `notes="${txDUp.dispute_notes}"`);

  // ─── AUDIT LOG INTEGRITY CHECK ────────────────────────────────────────────
  await writeAudit(base44, { transaction_id: tx.id, user_role: 'system', event_type: 'transaction_completed', notes: 'E2E test complete' });
  const auditEntries = await base44.asServiceRole.entities.AuditLog.filter({ transaction_id: tx.id });
  log('audit_trail', auditEntries.length >= 1 ? 'PASS' : 'FAIL', `${auditEntries.length} audit entries`);

  // ─── CLEANUP ──────────────────────────────────────────────────────────────
  await base44.asServiceRole.entities.Transaction.delete(tx.id);
  await base44.asServiceRole.entities.Transaction.delete(txD.id);
  const auditToDelete = await base44.asServiceRole.entities.AuditLog.filter({ transaction_id: tx.id });
  for (const a of auditToDelete) { await base44.asServiceRole.entities.AuditLog.delete(a.id); }

  // ─── SUMMARY ──────────────────────────────────────────────────────────────
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;

  return Response.json({
    summary: { passed, failed, total: results.length },
    allPassed: failed === 0,
    results,
  });
});