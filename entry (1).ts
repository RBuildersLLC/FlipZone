/**
 * FlipZone™ Late Fee Checker
 * Runs on a schedule. Finds transactions past pickup deadline and charges $2.00 late fees.
 * First fee: 12h after seller locker-close. Subsequent: every 4h.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Service-role only — no user auth needed for scheduled jobs
    const now = new Date();

    // Find all transactions that are late or buyer_codes_issued (buyer hasn't picked up)
    const transactions = await base44.asServiceRole.entities.Transaction.filter({});
    const lateTargets = transactions.filter(t =>
      ['awaiting_release', 'item_dropped', 'buyer_notified', 'buyer_codes_issued', 'buyer_paid', 'late'].includes(t.status) &&
      t.pickup_deadline_at &&
      new Date(t.pickup_deadline_at) < now
    );

    const results = [];

    for (const txn of lateTargets) {
      const deadlineMs = new Date(txn.pickup_deadline_at).getTime();
      const nowMs = now.getTime();
      const msOverdue = nowMs - deadlineMs;
      const hoursOverdue = msOverdue / (1000 * 60 * 60);

      // Late Fee Rule: $2.00 charged at 12h overdue (fee #1), then every 4h after (fee #2+).
      // Cycle ends on: buyer pickup, force pickup, dispute, or cancellation.
      // expectedFeeCount at 0h = 1, at 4h = 2, at 8h = 3, etc.
      const expectedFeeCount = 1 + Math.floor(hoursOverdue / 4);
      const currentFeeCount = txn.late_fee_count || 0;

      if (expectedFeeCount > currentFeeCount) {
        const feesToCharge = expectedFeeCount - currentFeeCount;

        for (let i = 0; i < feesToCharge; i++) {
          const feeNumber = currentFeeCount + i + 1;

          await base44.asServiceRole.entities.LateFee.create({
            transaction_id: txn.id,
            buyer_id: txn.buyer_id,
            amount: 2.00,
            fee_number: feeNumber,
            charged_at: now.toISOString(),
            hours_overdue: Math.round(hoursOverdue),
            seller_notified: true,
            system_notified: true,
          });

          await base44.asServiceRole.entities.AuditLog.create({
            transaction_id: txn.id,
            user_id: 'system',
            user_role: 'system',
            event_type: 'late_fee_charged',
            amount: 2.00,
            timestamp: now.toISOString(),
            immutable: true,
            success: true,
            notes: `Late fee #${feeNumber} — ${Math.round(hoursOverdue)}h overdue. Total: $${((txn.late_fee_total || 0) + 2 * (i + 1)).toFixed(2)}`,
          });

          await base44.asServiceRole.entities.AuditLog.create({
            transaction_id: txn.id,
            user_id: 'system',
            user_role: 'system',
            event_type: 'late_fee_alert_sent',
            timestamp: now.toISOString(),
            immutable: true,
            success: true,
            notes: `Buyer, seller, and FlipZone™ system alerted — late fee #${feeNumber}. Rule: $2.00 at 12h, +$2.00 every 4h until pickup, force pickup, dispute, or cancellation.`,
          });
        }

        await base44.asServiceRole.entities.Transaction.update(txn.id, {
          late_fee_count: expectedFeeCount,
          late_fee_total: (txn.late_fee_total || 0) + (feesToCharge * 2),
          status: 'late',
        });

        results.push({ transaction_id: txn.id, fees_charged: feesToCharge });
      }
    }

    return Response.json({ success: true, processed: lateTargets.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});