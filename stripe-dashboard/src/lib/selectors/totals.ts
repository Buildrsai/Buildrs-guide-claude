import type { Dataset, ScenarioConfig } from "@/lib/schemas";
import { computeFee } from "@/lib/engine/fees";
import { DISPUTE_FEE } from "@/lib/engine/fees";
import { isDeductedDispute } from "@/lib/engine/payouts";
import { inRange, type DateRange } from "./range";

export interface Totals {
  grossVolume: number;
  refundTotal: number;
  feeTotal: number;
  disputeTotal: number;
  netVolume: number;
  succeededCount: number;
  failedCount: number;
  refundCount: number;
  disputeCount: number;
  newCustomers: number;
  avgOrderValue: number;
}

/**
 * Every aggregate is derived from the transaction-level source of truth.
 * Gross = Σ succeeded payments; Net = gross − refunds − fees − disputes.
 */
export function computeTotals(
  dataset: Dataset,
  config: ScenarioConfig,
  range: DateRange,
): Totals {
  let grossVolume = 0;
  let feeTotal = 0;
  let succeededCount = 0;
  let failedCount = 0;

  for (const p of dataset.payments) {
    if (!inRange(p.createdAt, range)) continue;
    if (p.status === "succeeded") {
      grossVolume += p.amount;
      feeTotal += computeFee(p, config);
      succeededCount++;
    } else {
      failedCount++;
    }
  }

  let refundTotal = 0;
  let refundCount = 0;
  for (const r of dataset.refunds) {
    if (!inRange(r.createdAt, range)) continue;
    refundTotal += r.amount;
    refundCount++;
  }

  let disputeTotal = 0;
  let disputeCount = 0;
  for (const d of dataset.disputes) {
    if (!inRange(d.createdAt, range)) continue;
    disputeCount++;
    if (isDeductedDispute(d)) disputeTotal += d.amount + DISPUTE_FEE;
  }

  let newCustomers = 0;
  for (const c of dataset.customers) {
    if (inRange(c.createdAt, range)) newCustomers++;
  }

  return {
    grossVolume,
    refundTotal,
    feeTotal,
    disputeTotal,
    netVolume: grossVolume - refundTotal - feeTotal - disputeTotal,
    succeededCount,
    failedCount,
    refundCount,
    disputeCount,
    newCustomers,
    avgOrderValue: succeededCount > 0 ? Math.round(grossVolume / succeededCount) : 0,
  };
}
