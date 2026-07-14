import type { Dataset, ScenarioConfig } from "@/lib/schemas";
import { nextPayoutDate } from "@/lib/engine/payouts";

export interface Balances {
  /** funds settled but not yet swept by a payout */
  available: number;
  /** funds not yet settled (availableOn after the simulated today) */
  pending: number;
  /** estimated amount of the next scheduled payout */
  nextPayoutAmount: number;
  nextPayoutDate: string;
  totalPaidOut: number;
  inTransit: number;
}

export function computeBalances(
  dataset: Dataset,
  config: ScenarioConfig,
): Balances {
  let available = 0;
  let pending = 0;
  const nextDate = nextPayoutDate(config);
  let nextPayoutAmount = 0;

  for (const t of dataset.balanceTransactions) {
    if (t.type === "payout") continue; // sweeping is tracked via payoutId
    if (t.payoutId) continue; // already paid out
    if (t.status === "available") {
      available += t.net;
    } else {
      pending += t.net;
    }
    if (t.availableOn <= nextDate) nextPayoutAmount += t.net;
  }

  let totalPaidOut = 0;
  let inTransit = 0;
  for (const po of dataset.payouts) {
    if (po.status === "paid") totalPaidOut += po.amount;
    if (po.status === "in_transit") inTransit += po.amount;
  }

  return {
    available,
    pending,
    nextPayoutAmount: Math.max(nextPayoutAmount, 0),
    nextPayoutDate: nextDate,
    totalPaidOut,
    inTransit,
  };
}
