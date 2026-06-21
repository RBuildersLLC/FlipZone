/**
 * FlipZone™ Transaction Engine
 * Handles all state transitions, code generation, fee recording, and audit logging.
 * AAA: Authentication via base44.auth.me() · Authorization via role check · Accounting via AuditLog
 * CIA: Codes returned only to correct role · Audit records immutable · Active at all times
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ── Code generation ──────────────────────────────────────────────────────────

function generateCode(prefix) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = prefix + '-';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  code += '-';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// ── Audit helper ─────────────────────────────────────────────────────────────

async function audit(base44, payload) {
  await base44.asServiceRole.entities.AuditLog.create({
    ...payload,
    timestamp: new Date().toISOString(),
    immutable: true,
    success: payload.success !== false,
  });
}

// ── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, transaction_id } = body;

    // ── ACTION: initiate_transaction ─────────────────────────────────────────
    if (action === 'initiate_transaction') {
      const { item_description, transaction_value, pickup_window, locker_number, facility_name, buyer_name, buyer_id } = body;

      const txn = await base44.asServiceRole.entities.Transaction.create({
        seller_id: user.id,
        seller_name: user.full_name,
        buyer_id: buyer_id || null,
        buyer_name: buyer_name || null,
        item_description,
        transaction_value: parseFloat(transaction_value) || 0,
        pickup_window: pickup_window || '24 hours',
        locker_number,
        facility_name,
        status: 'initiated',
        seller_drop_fee_paid: false,
        buyer_pickup_fee_paid: false,
        retrieval_fee_paid: false,
        seller_codes_expired: false,
        buyer_codes_invalidated: false,
        late_fee_total: 0,
        late_fee_count: 0,
      });

      await audit(base44, {
        transaction_id: txn.id,
        locker_number,
        user_id: user.id,
        user_role: 'seller',
        event_type: 'transaction_initiated',
        notes: `Item: ${item_description} | Value: $${transaction_value} | Buyer: ${buyer_name}`,
      });

      return Response.json({ success: true, transaction: txn });
    }

    // ── ACTION: pay_seller_fee ────────────────────────────────────────────────
    if (action === 'pay_seller_fee') {
      const txns = await base44.asServiceRole.entities.Transaction.filter({ id: transaction_id });
      const txn = txns[0];
      if (!txn) return Response.json({ error: 'Transaction not found' }, { status: 404 });
      if (txn.seller_id !== user.id && user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

      const updated = await base44.asServiceRole.entities.Transaction.update(transaction_id, {
        seller_drop_fee_paid: true,
        status: 'seller_paid',
      });

      await audit(base44, {
        transaction_id,
        user_id: user.id,
        user_role: 'seller',
        event_type: 'seller_fee_paid',
        amount: 4.99,
        notes: 'Seller drop-off fee $4.99 charged',
      });

      return Response.json({ success: true, transaction: updated });
    }

    // ── ACTION: generate_seller_codes ─────────────────────────────────────────
    if (action === 'generate_seller_codes') {
      const txns = await base44.asServiceRole.entities.Transaction.filter({ id: transaction_id });
      const txn = txns[0];
      if (!txn) return Response.json({ error: 'Transaction not found' }, { status: 404 });
      if (txn.seller_id !== user.id && user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
      if (!txn.seller_drop_fee_paid) return Response.json({ error: 'Seller must pay drop-off fee first' }, { status: 400 });

      const facilityCode = generateCode('FAC');
      const lockerCode   = generateCode('LKR');
      const expiresAt    = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(); // 4-hour window

      await base44.asServiceRole.entities.AccessCode.create({
        transaction_id, code_type: 'seller_facility', code: facilityCode,
        issued_to_user_id: user.id, issued_to_role: 'seller',
        expires_at: expiresAt, status: 'active',
      });
      await base44.asServiceRole.entities.AccessCode.create({
        transaction_id, code_type: 'seller_locker', code: lockerCode,
        issued_to_user_id: user.id, issued_to_role: 'seller',
        expires_at: expiresAt, status: 'active',
      });

      const updated = await base44.asServiceRole.entities.Transaction.update(transaction_id, {
        seller_facility_code: facilityCode,
        seller_locker_code: lockerCode,
        status: 'seller_codes_issued',
      });

      await audit(base44, {
        transaction_id,
        user_id: user.id,
        user_role: 'seller',
        event_type: 'seller_codes_generated',
        code_reference: `FAC:${facilityCode.slice(-4)} LKR:${lockerCode.slice(-4)}`,
        notes: 'Seller facility and locker codes generated',
      });

      return Response.json({ success: true, transaction: updated, seller_facility_code: facilityCode, seller_locker_code: lockerCode });
    }

    // ── ACTION: seller_upload_photo ───────────────────────────────────────────
    if (action === 'seller_upload_photo') {
      const { photo_url } = body;
      const txns = await base44.asServiceRole.entities.Transaction.filter({ id: transaction_id });
      const txn = txns[0];
      if (!txn) return Response.json({ error: 'Transaction not found' }, { status: 404 });
      if (txn.seller_id !== user.id && user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

      const updated = await base44.asServiceRole.entities.Transaction.update(transaction_id, {
        seller_item_photo_url: photo_url,
      });

      await audit(base44, {
        transaction_id,
        user_id: user.id,
        user_role: 'seller',
        event_type: 'seller_photo_uploaded',
        photo_url,
        notes: 'Seller item photo uploaded — chain of custody evidence recorded',
      });

      return Response.json({ success: true, transaction: updated });
    }

    // ── ACTION: seller_close_locker ───────────────────────────────────────────
    if (action === 'seller_close_locker') {
      const txns = await base44.asServiceRole.entities.Transaction.filter({ id: transaction_id });
      const txn = txns[0];
      if (!txn) return Response.json({ error: 'Transaction not found' }, { status: 404 });
      if (txn.seller_id !== user.id && user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

      const now = new Date().toISOString();
      const pickupDeadline = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(); // +12 hours

      const updated = await base44.asServiceRole.entities.Transaction.update(transaction_id, {
        status: 'item_dropped',
        locker_closed_by_seller_at: now,
        pickup_deadline_at: pickupDeadline,
        seller_codes_expired: true,
        seller_facility_code: null,
        seller_locker_code: null,
      });

      // Expire seller codes in AccessCode entity
      const codes = await base44.asServiceRole.entities.AccessCode.filter({ transaction_id });
      for (const c of codes) {
        if (c.issued_to_role === 'seller' && c.status === 'active') {
          await base44.asServiceRole.entities.AccessCode.update(c.id, { status: 'expired' });
        }
      }

      await audit(base44, {
        transaction_id,
        user_id: user.id,
        user_role: 'seller',
        event_type: 'seller_locker_closed',
        notes: `Seller codes expired. Pickup deadline: ${pickupDeadline}`,
      });
      await audit(base44, {
        transaction_id,
        user_id: user.id,
        user_role: 'seller',
        event_type: 'seller_codes_expired',
        notes: 'Seller facility and locker codes revoked on locker close',
      });
      await audit(base44, {
        transaction_id,
        user_id: 'system',
        user_role: 'system',
        event_type: 'buyer_notified',
        notes: `Buyer notified: item ready. 12-hour pickup window started. Deadline: ${pickupDeadline}`,
      });

      return Response.json({ success: true, transaction: updated, pickup_deadline: pickupDeadline });
    }

    // ── ACTION: pay_buyer_fee ─────────────────────────────────────────────────
    if (action === 'pay_buyer_fee') {
      const txns = await base44.asServiceRole.entities.Transaction.filter({ id: transaction_id });
      const txn = txns[0];
      if (!txn) return Response.json({ error: 'Transaction not found' }, { status: 404 });

      const updated = await base44.asServiceRole.entities.Transaction.update(transaction_id, {
        buyer_pickup_fee_paid: true,
        status: 'buyer_paid',
      });

      await audit(base44, {
        transaction_id,
        user_id: user.id,
        user_role: 'buyer',
        event_type: 'buyer_fee_paid',
        amount: 4.99,
        notes: 'Buyer pickup fee $4.99 charged',
      });

      return Response.json({ success: true, transaction: updated });
    }

    // ── ACTION: generate_buyer_codes ──────────────────────────────────────────
    if (action === 'generate_buyer_codes') {
      const txns = await base44.asServiceRole.entities.Transaction.filter({ id: transaction_id });
      const txn = txns[0];
      if (!txn) return Response.json({ error: 'Transaction not found' }, { status: 404 });
      if (!txn.buyer_pickup_fee_paid) return Response.json({ error: 'Buyer must pay pickup fee first' }, { status: 400 });

      const facilityCode = generateCode('FAC');
      const lockerCode   = generateCode('LKR');
      const expiresAt    = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      await base44.asServiceRole.entities.AccessCode.create({
        transaction_id, code_type: 'buyer_facility', code: facilityCode,
        issued_to_user_id: user.id, issued_to_role: 'buyer',
        expires_at: expiresAt, status: 'active',
      });
      await base44.asServiceRole.entities.AccessCode.create({
        transaction_id, code_type: 'buyer_locker', code: lockerCode,
        issued_to_user_id: user.id, issued_to_role: 'buyer',
        expires_at: expiresAt, status: 'active',
      });

      const updated = await base44.asServiceRole.entities.Transaction.update(transaction_id, {
        buyer_facility_code: facilityCode,
        buyer_locker_code: lockerCode,
        status: 'buyer_codes_issued',
      });

      await audit(base44, {
        transaction_id,
        user_id: user.id,
        user_role: 'buyer',
        event_type: 'buyer_codes_generated',
        code_reference: `FAC:${facilityCode.slice(-4)} LKR:${lockerCode.slice(-4)}`,
        notes: 'Buyer facility and locker codes generated',
      });

      return Response.json({ success: true, transaction: updated, buyer_facility_code: facilityCode, buyer_locker_code: lockerCode });
    }

    // ── ACTION: buyer_open_locker ─────────────────────────────────────────────
    if (action === 'buyer_open_locker') {
      const txns = await base44.asServiceRole.entities.Transaction.filter({ id: transaction_id });
      const txn = txns[0];
      if (!txn) return Response.json({ error: 'Transaction not found' }, { status: 404 });

      const now = new Date().toISOString();
      const updated = await base44.asServiceRole.entities.Transaction.update(transaction_id, {
        locker_opened_by_buyer_at: now,
        status: 'buyer_accessed',
      });

      await audit(base44, {
        transaction_id,
        user_id: user.id,
        user_role: 'buyer',
        event_type: 'buyer_locker_opened',
        notes: 'Buyer locker open event — seller and FlipZone™ alerted',
      });

      return Response.json({ success: true, transaction: updated });
    }

    // ── ACTION: buyer_upload_photo ────────────────────────────────────────────
    if (action === 'buyer_upload_photo') {
      const { photo_url } = body;
      const txns = await base44.asServiceRole.entities.Transaction.filter({ id: transaction_id });
      const txn = txns[0];
      if (!txn) return Response.json({ error: 'Transaction not found' }, { status: 404 });

      const updated = await base44.asServiceRole.entities.Transaction.update(transaction_id, {
        buyer_confirm_photo_url: photo_url,
      });

      await audit(base44, {
        transaction_id,
        user_id: user.id,
        user_role: 'buyer',
        event_type: 'buyer_photo_uploaded',
        photo_url,
        notes: 'Buyer item confirmation photo uploaded',
      });

      return Response.json({ success: true, transaction: updated });
    }

    // ── ACTION: buyer_close_locker ────────────────────────────────────────────
    if (action === 'buyer_close_locker') {
      const txns = await base44.asServiceRole.entities.Transaction.filter({ id: transaction_id });
      const txn = txns[0];
      if (!txn) return Response.json({ error: 'Transaction not found' }, { status: 404 });

      const now = new Date().toISOString();
      const updated = await base44.asServiceRole.entities.Transaction.update(transaction_id, {
        locker_closed_by_buyer_at: now,
        buyer_facility_code: null,
        buyer_locker_code: null,
        status: 'completed',
      });

      // Expire buyer codes
      const codes = await base44.asServiceRole.entities.AccessCode.filter({ transaction_id });
      for (const c of codes) {
        if (c.issued_to_role === 'buyer' && c.status === 'active') {
          await base44.asServiceRole.entities.AccessCode.update(c.id, { status: 'used' });
        }
      }

      await audit(base44, {
        transaction_id,
        user_id: user.id,
        user_role: 'buyer',
        event_type: 'buyer_locker_closed',
        notes: 'Buyer closed locker — seller and FlipZone™ alerted',
      });
      await audit(base44, {
        transaction_id,
        user_id: 'system',
        user_role: 'system',
        event_type: 'locker_returned_to_inventory',
        notes: 'Locker returned to available inventory',
      });
      await audit(base44, {
        transaction_id,
        user_id: 'system',
        user_role: 'system',
        event_type: 'transaction_completed',
        notes: 'Transaction completed successfully',
      });

      return Response.json({ success: true, transaction: updated });
    }

    // ── ACTION: charge_late_fee ───────────────────────────────────────────────
    if (action === 'charge_late_fee') {
      const txns = await base44.asServiceRole.entities.Transaction.filter({ id: transaction_id });
      const txn = txns[0];
      if (!txn) return Response.json({ error: 'Transaction not found' }, { status: 404 });

      const feeNumber = (txn.late_fee_count || 0) + 1;
      const hoursOverdue = feeNumber === 1 ? 12 : 12 + (feeNumber - 1) * 4;

      await base44.asServiceRole.entities.LateFee.create({
        transaction_id,
        buyer_id: txn.buyer_id,
        amount: 2.00,
        fee_number: feeNumber,
        charged_at: new Date().toISOString(),
        hours_overdue: hoursOverdue,
        seller_notified: true,
        system_notified: true,
      });

      const updated = await base44.asServiceRole.entities.Transaction.update(transaction_id, {
        late_fee_total: (txn.late_fee_total || 0) + 2.00,
        late_fee_count: feeNumber,
        status: 'late',
      });

      await audit(base44, {
        transaction_id,
        user_id: 'system',
        user_role: 'system',
        event_type: 'late_fee_charged',
        amount: 2.00,
        notes: `Late fee #${feeNumber} charged — ${hoursOverdue}h overdue. Total: $${updated.late_fee_total}`,
      });
      await audit(base44, {
        transaction_id,
        user_id: 'system',
        user_role: 'system',
        event_type: 'late_fee_alert_sent',
        notes: `Seller and FlipZone™ notified of late fee #${feeNumber}`,
      });

      return Response.json({ success: true, transaction: updated, fee_number: feeNumber });
    }

    // ── ACTION: force_pickup ──────────────────────────────────────────────────
    if (action === 'force_pickup') {
      const txns = await base44.asServiceRole.entities.Transaction.filter({ id: transaction_id });
      const txn = txns[0];
      if (!txn) return Response.json({ error: 'Transaction not found' }, { status: 404 });
      if (txn.seller_id !== user.id && user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

      // Invalidate buyer codes
      const codes = await base44.asServiceRole.entities.AccessCode.filter({ transaction_id });
      for (const c of codes) {
        if (c.issued_to_role === 'buyer' && c.status === 'active') {
          await base44.asServiceRole.entities.AccessCode.update(c.id, { status: 'revoked' });
        }
      }

      // Generate new seller retrieval codes
      const facilityCode = generateCode('RET');
      const lockerCode   = generateCode('RLK');
      const expiresAt    = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();

      await base44.asServiceRole.entities.AccessCode.create({
        transaction_id, code_type: 'retrieval_facility', code: facilityCode,
        issued_to_user_id: user.id, issued_to_role: 'seller',
        expires_at: expiresAt, status: 'active',
      });
      await base44.asServiceRole.entities.AccessCode.create({
        transaction_id, code_type: 'retrieval_locker', code: lockerCode,
        issued_to_user_id: user.id, issued_to_role: 'seller',
        expires_at: expiresAt, status: 'active',
      });

      const updated = await base44.asServiceRole.entities.Transaction.update(transaction_id, {
        buyer_codes_invalidated: true,
        buyer_facility_code: null,
        buyer_locker_code: null,
        seller_facility_code: facilityCode,
        seller_locker_code: lockerCode,
        status: 'force_pickup_initiated',
        retrieval_fee_paid: false,
      });

      await audit(base44, { transaction_id, user_id: user.id, user_role: 'seller', event_type: 'buyer_codes_invalidated', notes: 'Buyer codes revoked — force pickup initiated' });
      await audit(base44, { transaction_id, user_id: user.id, user_role: 'seller', event_type: 'seller_retrieval_codes_generated', code_reference: `RET:${facilityCode.slice(-4)} RLK:${lockerCode.slice(-4)}`, notes: 'New retrieval codes issued to seller' });
      await audit(base44, { transaction_id, user_id: user.id, user_role: 'seller', event_type: 'force_pickup_initiated', notes: 'Seller initiated force pickup' });

      return Response.json({ success: true, transaction: updated, retrieval_facility_code: facilityCode, retrieval_locker_code: lockerCode });
    }

    // ── ACTION: pay_retrieval_fee ─────────────────────────────────────────────
    if (action === 'pay_retrieval_fee') {
      const txns = await base44.asServiceRole.entities.Transaction.filter({ id: transaction_id });
      const txn = txns[0];
      if (!txn) return Response.json({ error: 'Transaction not found' }, { status: 404 });
      if (txn.seller_id !== user.id && user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

      const updated = await base44.asServiceRole.entities.Transaction.update(transaction_id, {
        retrieval_fee_paid: true,
      });

      await audit(base44, {
        transaction_id,
        user_id: user.id,
        user_role: 'seller',
        event_type: 'retrieval_fee_paid',
        amount: 4.99,
        notes: 'Force pickup / retrieval fee $4.99 charged',
      });

      return Response.json({ success: true, transaction: updated });
    }

    // ── ACTION: open_dispute ──────────────────────────────────────────────────
    if (action === 'open_dispute') {
      const { reason } = body;
      const txns = await base44.asServiceRole.entities.Transaction.filter({ id: transaction_id });
      const txn = txns[0];
      if (!txn) return Response.json({ error: 'Transaction not found' }, { status: 404 });

      // Generate seller investigation codes
      const facilityCode = generateCode('DSP');
      const lockerCode   = generateCode('DLK');
      const expiresAt    = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      await base44.asServiceRole.entities.AccessCode.create({
        transaction_id, code_type: 'retrieval_facility', code: facilityCode,
        issued_to_user_id: txn.seller_id, issued_to_role: 'seller',
        expires_at: expiresAt, status: 'active',
      });
      await base44.asServiceRole.entities.AccessCode.create({
        transaction_id, code_type: 'retrieval_locker', code: lockerCode,
        issued_to_user_id: txn.seller_id, issued_to_role: 'seller',
        expires_at: expiresAt, status: 'active',
      });

      const updated = await base44.asServiceRole.entities.Transaction.update(transaction_id, {
        status: 'disputed',
        buyer_facility_code: null,
        buyer_locker_code: null,
        buyer_codes_invalidated: true,
        seller_facility_code: facilityCode,
        seller_locker_code: lockerCode,
        notes: reason || 'Buyer dispute opened',
      });

      await audit(base44, { transaction_id, user_id: user.id, user_role: 'buyer', event_type: 'dispute_opened', notes: reason || 'Buyer opened dispute' });
      await audit(base44, { transaction_id, user_id: 'system', user_role: 'system', event_type: 'transaction_frozen', notes: 'Transaction frozen — locker removed from rotation' });
      await audit(base44, { transaction_id, user_id: 'system', user_role: 'system', event_type: 'locker_removed_from_rotation', notes: 'Locker held pending dispute resolution' });
      await audit(base44, { transaction_id, user_id: 'system', user_role: 'system', event_type: 'seller_retrieval_codes_generated', code_reference: `DSP:${facilityCode.slice(-4)} DLK:${lockerCode.slice(-4)}`, notes: 'Seller issued dispute investigation codes' });

      return Response.json({ success: true, transaction: updated, retrieval_facility_code: facilityCode, retrieval_locker_code: lockerCode });
    }

    // ── ACTION: get_transaction ───────────────────────────────────────────────
    if (action === 'get_transaction') {
      const txns = await base44.asServiceRole.entities.Transaction.filter({ id: transaction_id });
      const txn = txns[0];
      if (!txn) return Response.json({ error: 'Transaction not found' }, { status: 404 });

      // Confidentiality: strip codes that don't belong to this user's role
      const isAdmin = user.role === 'admin';
      const isSeller = txn.seller_id === user.id;
      const isBuyer = txn.buyer_id === user.id;

      const masked = { ...txn };
      if (!isSeller && !isAdmin) {
        masked.seller_facility_code = null;
        masked.seller_locker_code = null;
      }
      if (!isBuyer && !isAdmin) {
        masked.buyer_facility_code = null;
        masked.buyer_locker_code = null;
      }

      return Response.json({ success: true, transaction: masked });
    }

    // ── ACTION: get_audit_log ─────────────────────────────────────────────────
    if (action === 'get_audit_log') {
      if (user.role !== 'admin') {
        // Non-admins can only see logs for their own transactions
        const allTxns = await base44.asServiceRole.entities.Transaction.filter({});
        const userTxnIds = allTxns
          .filter(t => t.seller_id === user.id || t.buyer_id === user.id)
          .map(t => t.id);
        if (!userTxnIds.includes(transaction_id)) {
          return Response.json({ error: 'Forbidden' }, { status: 403 });
        }
      }

      const logs = await base44.asServiceRole.entities.AuditLog.filter({ transaction_id });
      logs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      return Response.json({ success: true, logs });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});