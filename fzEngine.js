/**
 * FlipZone™ Transaction Engine
 * Client-side SDK for the full chain-of-custody state machine.
 * All writes go to entities; audit log is written on every event.
 */

import { base44 } from '@/api/base44Client';

// ── Code generators ────────────────────────────────────────────────────────

function randomCode(prefix = 'FZ', len = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${out}`;
}

export function genFacilityCode() { return randomCode('FAC', 6); }
export function genLockerCode()   { return randomCode('LOC', 6); }

// NOTE: QR codes are NOT separate tokens. They are always derived visually
// from the access code string itself in the UI. No separate QR token is stored.

// ── Audit writer ───────────────────────────────────────────────────────────

export async function writeAudit({ transaction_id, locker_id, locker_number, user_id, user_role, event_type, amount, code_reference, photo_url, notes, success = true }) {
  await base44.entities.AuditLog.create({
    transaction_id,
    locker_id,
    locker_number,
    user_id,
    user_role,
    event_type,
    timestamp: new Date().toISOString(),
    amount,
    code_reference,
    photo_url,
    notes,
    success,
    immutable: true,
  });
}

// ── Seller Flow ────────────────────────────────────────────────────────────

export async function createTransaction({ seller_id, seller_name, buyer_id, buyer_name, locker_id, locker_number, facility_name, item_description, transaction_value, pickup_window }) {
  const tx = await base44.entities.Transaction.create({
    seller_id, seller_name, buyer_id, buyer_name,
    locker_id, locker_number, facility_name,
    item_description, transaction_value, pickup_window,
    status: 'initiated',
    seller_drop_fee_paid: false,
    buyer_pickup_fee_paid: false,
    seller_codes_expired: false,
    buyer_codes_invalidated: false,
    late_fee_total: 0,
    late_fee_count: 0,
  });
  await writeAudit({ transaction_id: tx.id, locker_id, locker_number, user_id: seller_id, user_role: 'seller', event_type: 'transaction_initiated', notes: item_description });
  return tx;
}

export async function paySellerFee(txId, { seller_id, locker_id, locker_number }) {
  const tx = await base44.entities.Transaction.update(txId, { status: 'seller_paid', seller_drop_fee_paid: true });
  await writeAudit({ transaction_id: txId, locker_id, locker_number, user_id: seller_id, user_role: 'seller', event_type: 'seller_fee_paid', amount: 4.99 });
  return tx;
}

export async function generateSellerCodes(txId, { seller_id, locker_id, locker_number }) {
  const facilityCode = genFacilityCode();
  const lockerCode   = genLockerCode();
  const tx = await base44.entities.Transaction.update(txId, {
    status: 'seller_codes_issued',
    seller_facility_code: facilityCode,
    seller_locker_code: lockerCode,
  });
  // Store in AccessCode entity
  await base44.entities.AccessCode.create({ transaction_id: txId, code_type: 'seller_facility', code: facilityCode, issued_to_user_id: seller_id, issued_to_role: 'seller', status: 'active' });
  await base44.entities.AccessCode.create({ transaction_id: txId, code_type: 'seller_locker',   code: lockerCode,   issued_to_user_id: seller_id, issued_to_role: 'seller', status: 'active' });
  await writeAudit({ transaction_id: txId, locker_id, locker_number, user_id: seller_id, user_role: 'seller', event_type: 'seller_codes_generated', code_reference: `FAC:${facilityCode} / LOC:${lockerCode}` });
  return { facilityCode, lockerCode, tx };
}

export async function confirmSellerFacilityAccessed(txId, { seller_id, locker_id, locker_number }) {
  await writeAudit({ transaction_id: txId, locker_id, locker_number, user_id: seller_id, user_role: 'seller', event_type: 'seller_facility_accessed', notes: 'Seller confirmed facility entry' });
  return null;
}

export async function confirmSellerLockerOpened(txId, { seller_id, locker_id, locker_number }) {
  const tx = await base44.entities.Transaction.update(txId, {
    seller_locker_opened_at: new Date().toISOString(),
  });
  await writeAudit({ transaction_id: txId, locker_id, locker_number, user_id: seller_id, user_role: 'seller', event_type: 'seller_locker_accessed', notes: 'Seller confirmed locker opened' });
  return tx;
}

export async function uploadSellerPhoto(txId, { seller_id, locker_id, locker_number, photo_url, capture_timestamp, upload_timestamp }) {
  const tx = await base44.entities.Transaction.update(txId, {
    seller_item_photo_url: photo_url,
    seller_photo_capture_ts: capture_timestamp || new Date().toISOString(),
    seller_photo_upload_ts: upload_timestamp || new Date().toISOString(),
  });
  await writeAudit({
    transaction_id: txId, locker_id, locker_number, user_id: seller_id, user_role: 'seller',
    event_type: 'seller_photo_uploaded', photo_url,
    notes: `Live capture. Device ts: ${capture_timestamp} · Upload ts: ${upload_timestamp}`,
  });
  return tx;
}

export async function confirmSellerLockerClosed(txId, { seller_id, locker_id, locker_number }) {
  // Step A: Locker closed → awaiting_release. Seller must explicitly release buyer access.
  // 12h pickup timer does NOT start here — it starts when seller confirms release.
  const now = new Date();
  const tx = await base44.entities.Transaction.update(txId, {
    status: 'awaiting_release',
    seller_codes_expired: true,
    locker_closed_by_seller_at: now.toISOString(),
  });
  // Revoke seller codes
  const sellerCodes = await base44.entities.AccessCode.filter({ transaction_id: txId, issued_to_role: 'seller' });
  for (const c of sellerCodes) {
    await base44.entities.AccessCode.update(c.id, { status: 'expired' });
  }
  await writeAudit({ transaction_id: txId, locker_id, locker_number, user_id: seller_id, user_role: 'seller', event_type: 'seller_locker_closed', notes: 'Locker closed. Seller codes expired. Awaiting seller release. 12h timer will start at release.' });
  await writeAudit({ transaction_id: txId, locker_id, locker_number, user_id: seller_id, user_role: 'seller', event_type: 'seller_codes_expired' });
  return tx;
}

export async function releaseBuyerAccess(txId, { seller_id, buyer_id, locker_id, locker_number }) {
  // Step B: Seller is safely away and chooses to release buyer access.
  // 12-hour pickup timer starts NOW (not at locker-close).
  //
  // CREDENTIAL RULES:
  //   Facility access:  buyer_facility_code is UNIQUE — different from seller_facility_code.
  //   Locker access:    buyer_locker_code is the SAME locker authorization as seller_locker_code.
  //                     The physical locker does not change; QR is just a backup input method.
  //   QR codes are derived from the code strings in the UI — locker QR will match for same locker.
  //   Buyer receives NO credentials until seller completes full deposit workflow + releases access.

  // Fetch the existing transaction to get the seller's locker code for this assigned locker
  const txList = await base44.entities.Transaction.filter({ id: txId });
  const currentTx = txList[0];

  const now = new Date();
  const deadline = new Date(now.getTime() + 12 * 60 * 60 * 1000);

  // Unique facility code for buyer entry (separate from seller facility code)
  const buyerFacilityCode = genFacilityCode();
  // Locker code = same assigned locker authorization (seller_locker_code ties to the physical locker)
  const buyerLockerCode = currentTx.seller_locker_code;

  await Promise.all([
    base44.entities.AccessCode.create({
      transaction_id: txId,
      code_type: 'buyer_facility',
      code: buyerFacilityCode,
      issued_to_user_id: buyer_id,
      issued_to_role: 'buyer',
      status: 'active',
    }),
    base44.entities.AccessCode.create({
      transaction_id: txId,
      code_type: 'buyer_locker',
      code: buyerLockerCode,
      issued_to_user_id: buyer_id,
      issued_to_role: 'buyer',
      status: 'active',
    }),
  ]);

  const tx = await base44.entities.Transaction.update(txId, {
    status: 'buyer_codes_issued',
    buyer_released_at: now.toISOString(),
    pickup_deadline_at: deadline.toISOString(),
    buyer_facility_code: buyerFacilityCode,
    buyer_locker_code: buyerLockerCode,
    buyer_pickup_fee_paid: false,
  });

  await writeAudit({
    transaction_id: txId, locker_id, locker_number, user_id: seller_id, user_role: 'seller',
    event_type: 'buyer_access_released',
    notes: 'Seller released buyer access. Unique buyer facility code generated. Locker code corresponds to assigned locker. Pickup window active.',
  });
  await writeAudit({
    transaction_id: txId, locker_id, locker_number, user_id: buyer_id, user_role: 'system',
    event_type: 'buyer_codes_generated',
    code_reference: `FAC:${buyerFacilityCode} / LOC:${buyerLockerCode}`,
    notes: 'Buyer credential package issued at release. Facility code is unique to buyer. Locker code corresponds to the assigned locker for this transaction. 12h pickup timer started.',
  });
  await writeAudit({
    transaction_id: txId, locker_id, locker_number, user_id: buyer_id, user_role: 'system',
    event_type: 'buyer_notified',
    notes: 'Item ready for pickup. Buyer credential package delivered.',
  });

  return tx;
}

// ── Buyer Flow ─────────────────────────────────────────────────────────────

export async function payBuyerFee(txId, { buyer_id, locker_id, locker_number }) {
  const tx = await base44.entities.Transaction.update(txId, { status: 'buyer_paid', buyer_pickup_fee_paid: true });
  await writeAudit({ transaction_id: txId, locker_id, locker_number, user_id: buyer_id, user_role: 'buyer', event_type: 'buyer_fee_paid', amount: 4.99 });
  return tx;
}

export async function generateBuyerCodes(txId, { buyer_id, locker_id, locker_number }) {
  // Two separate credentials: Buyer Facility Access Code + Locker Code.
  // QR codes are derived visually from these strings in the UI — no separate token stored.
  const facilityCode = genFacilityCode();
  const lockerCode   = genLockerCode();
  const tx = await base44.entities.Transaction.update(txId, {
    status: 'buyer_codes_issued',
    buyer_facility_code: facilityCode,
    buyer_locker_code: lockerCode,
  });
  await base44.entities.AccessCode.create({ transaction_id: txId, code_type: 'buyer_facility', code: facilityCode, issued_to_user_id: buyer_id, issued_to_role: 'buyer', status: 'active' });
  await base44.entities.AccessCode.create({ transaction_id: txId, code_type: 'buyer_locker',   code: lockerCode,   issued_to_user_id: buyer_id, issued_to_role: 'buyer', status: 'active' });
  await writeAudit({ transaction_id: txId, locker_id, locker_number, user_id: buyer_id, user_role: 'buyer', event_type: 'buyer_codes_generated', code_reference: `FAC:${facilityCode} / LOC:${lockerCode}` });
  return { facilityCode, lockerCode, tx };
}

export async function confirmBuyerLockerOpened(txId, { buyer_id, seller_id, locker_id, locker_number }) {
  const tx = await base44.entities.Transaction.update(txId, {
    status: 'buyer_accessed',
    locker_opened_by_buyer_at: new Date().toISOString(),
  });
  await writeAudit({ transaction_id: txId, locker_id, locker_number, user_id: buyer_id, user_role: 'buyer', event_type: 'buyer_locker_opened' });
  await writeAudit({ transaction_id: txId, locker_id, locker_number, user_id: seller_id, user_role: 'system', event_type: 'buyer_notified', notes: 'Buyer has opened the locker' });
  return tx;
}

export async function uploadBuyerPhoto(txId, { buyer_id, locker_id, locker_number, photo_url, capture_timestamp, upload_timestamp }) {
  const tx = await base44.entities.Transaction.update(txId, {
    buyer_confirm_photo_url: photo_url,
    buyer_photo_capture_ts: capture_timestamp || new Date().toISOString(),
    buyer_photo_upload_ts: upload_timestamp || new Date().toISOString(),
  });
  await writeAudit({
    transaction_id: txId, locker_id, locker_number, user_id: buyer_id, user_role: 'buyer',
    event_type: 'buyer_photo_uploaded', photo_url,
    notes: `Live capture. Device ts: ${capture_timestamp} · Upload ts: ${upload_timestamp}`,
  });
  return tx;
}

export async function confirmBuyerLockerClosed(txId, { buyer_id, seller_id, locker_id, locker_number }) {
  const tx = await base44.entities.Transaction.update(txId, {
    status: 'completed',
    locker_closed_by_buyer_at: new Date().toISOString(),
  });
  // Revoke buyer codes
  const buyerCodes = await base44.entities.AccessCode.filter({ transaction_id: txId, issued_to_role: 'buyer' });
  for (const c of buyerCodes) {
    await base44.entities.AccessCode.update(c.id, { status: 'used' });
  }
  await writeAudit({ transaction_id: txId, locker_id, locker_number, user_id: buyer_id,  user_role: 'buyer',  event_type: 'buyer_locker_closed' });
  await writeAudit({ transaction_id: txId, locker_id, locker_number, user_id: seller_id, user_role: 'system', event_type: 'buyer_notified', notes: 'Buyer completed pickup — locker closed' });
  await writeAudit({ transaction_id: txId, locker_id, locker_number, user_id: 'system',  user_role: 'system', event_type: 'locker_returned_to_inventory' });
  await writeAudit({ transaction_id: txId, locker_id, locker_number, user_id: 'system',  user_role: 'system', event_type: 'transaction_completed' });
  return tx;
}

// ── Late Fees ──────────────────────────────────────────────────────────────

export async function chargeLateFee(txId, { buyer_id, seller_id, locker_id, locker_number, feeNumber, hoursOverdue }) {
  const existing = await base44.entities.Transaction.filter({ id: txId });
  const current = existing[0];
  const newTotal = (current?.late_fee_total || 0) + 2.00;
  const newCount = (current?.late_fee_count || 0) + 1;

  await base44.entities.LateFee.create({
    transaction_id: txId, buyer_id, amount: 2.00,
    fee_number: feeNumber, charged_at: new Date().toISOString(),
    hours_overdue: hoursOverdue, seller_notified: true, system_notified: true,
  });
  const tx = await base44.entities.Transaction.update(txId, {
    status: 'late',
    late_fee_total: newTotal,
    late_fee_count: newCount,
  });
  await writeAudit({ transaction_id: txId, locker_id, locker_number, user_id: buyer_id, user_role: 'buyer', event_type: 'late_fee_charged', amount: 2.00, notes: `Late fee #${feeNumber} — ${hoursOverdue}h overdue ($2.00 at 12h, +$2.00 every 4h)` });
  await writeAudit({ transaction_id: txId, locker_id, locker_number, user_id: 'system', user_role: 'system', event_type: 'late_fee_alert_sent', notes: `Buyer, seller, and FlipZone™ system notified — buyer is ${hoursOverdue}h late, $2.00 charged (fee #${feeNumber})` });
  return tx;
}

// ── Force Pickup ───────────────────────────────────────────────────────────

export async function initiateForcePickup(txId, { seller_id, locker_id, locker_number }) {
  // Invalidate buyer codes
  const buyerCodes = await base44.entities.AccessCode.filter({ transaction_id: txId, issued_to_role: 'buyer' });
  for (const c of buyerCodes) {
    await base44.entities.AccessCode.update(c.id, { status: 'revoked' });
  }
  // Generate new seller retrieval codes
  const facilityCode = genFacilityCode();
  const lockerCode   = genLockerCode();
  await base44.entities.AccessCode.create({ transaction_id: txId, code_type: 'retrieval_facility', code: facilityCode, issued_to_user_id: seller_id, issued_to_role: 'seller', status: 'active' });
  await base44.entities.AccessCode.create({ transaction_id: txId, code_type: 'retrieval_locker',   code: lockerCode,   issued_to_user_id: seller_id, issued_to_role: 'seller', status: 'active' });

  const tx = await base44.entities.Transaction.update(txId, {
    status: 'force_pickup_initiated',
    buyer_codes_invalidated: true,
    seller_facility_code: facilityCode,
    seller_locker_code: lockerCode,
  });
  await writeAudit({ transaction_id: txId, locker_id, locker_number, user_id: seller_id, user_role: 'seller', event_type: 'force_pickup_initiated' });
  await writeAudit({ transaction_id: txId, locker_id, locker_number, user_id: seller_id, user_role: 'seller', event_type: 'buyer_codes_invalidated' });
  await writeAudit({ transaction_id: txId, locker_id, locker_number, user_id: seller_id, user_role: 'seller', event_type: 'seller_retrieval_codes_generated', code_reference: `FAC:${facilityCode} / LOC:${lockerCode}` });
  return { facilityCode, lockerCode, tx };
}

export async function payRetrievalFee(txId, { seller_id, locker_id, locker_number }) {
  const tx = await base44.entities.Transaction.update(txId, { retrieval_fee_paid: true });
  await writeAudit({ transaction_id: txId, locker_id, locker_number, user_id: seller_id, user_role: 'seller', event_type: 'retrieval_fee_paid', amount: 4.99 });
  return tx;
}

export async function completeForcePickup(txId, { seller_id, locker_id, locker_number }) {
  const tx = await base44.entities.Transaction.update(txId, { status: 'force_pickup_complete' });
  await writeAudit({ transaction_id: txId, locker_id, locker_number, user_id: seller_id, user_role: 'seller', event_type: 'transaction_completed', notes: 'Force pickup completed' });
  await writeAudit({ transaction_id: txId, locker_id, locker_number, user_id: 'system',  user_role: 'system', event_type: 'locker_returned_to_inventory' });
  return tx;
}

// ── Disputes ───────────────────────────────────────────────────────────────

export async function openDispute(txId, { buyer_id, seller_id, locker_id, locker_number, notes }) {
  // Invalidate buyer codes
  const buyerCodes = await base44.entities.AccessCode.filter({ transaction_id: txId, issued_to_role: 'buyer' });
  for (const c of buyerCodes) {
    await base44.entities.AccessCode.update(c.id, { status: 'revoked' });
  }
  // Generate seller investigation codes
  const facilityCode = genFacilityCode();
  const lockerCode   = genLockerCode();
  await base44.entities.AccessCode.create({ transaction_id: txId, code_type: 'retrieval_facility', code: facilityCode, issued_to_user_id: seller_id, issued_to_role: 'seller', status: 'active' });
  await base44.entities.AccessCode.create({ transaction_id: txId, code_type: 'retrieval_locker',   code: lockerCode,   issued_to_user_id: seller_id, issued_to_role: 'seller', status: 'active' });

  const tx = await base44.entities.Transaction.update(txId, {
    status: 'frozen',
    buyer_codes_invalidated: true,
    seller_facility_code: facilityCode,
    seller_locker_code: lockerCode,
    dispute_notes: notes || '',
  });
  await writeAudit({ transaction_id: txId, locker_id, locker_number, user_id: buyer_id, user_role: 'buyer', event_type: 'dispute_opened', notes });
  await writeAudit({ transaction_id: txId, locker_id, locker_number, user_id: 'system', user_role: 'system', event_type: 'transaction_frozen' });
  await writeAudit({ transaction_id: txId, locker_id, locker_number, user_id: 'system', user_role: 'system', event_type: 'locker_removed_from_rotation' });
  await writeAudit({ transaction_id: txId, locker_id, locker_number, user_id: seller_id, user_role: 'seller', event_type: 'retrieval_fee_paid', notes: 'Dispute — seller issued investigation codes' });
  return { facilityCode, lockerCode, tx };
}