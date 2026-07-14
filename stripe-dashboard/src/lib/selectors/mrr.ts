import type { Dataset, Plan, Subscription } from "@/lib/schemas";
import type { DateRange } from "./range";

function monthlyAmount(plan: Plan): number {
  return plan.interval === "year" ? Math.round(plan.amount / 12) : plan.amount;
}

function isActiveAt(sub: Subscription, dateIso: string): boolean {
  if (sub.startDate > dateIso) return false;
  if (sub.canceledAt && sub.canceledAt <= dateIso) return false;
  return true;
}

export interface MrrStats {
  /** normalized monthly sum of currently active subscriptions, minor units */
  mrr: number;
  activeCount: number;
  trialingCount: number;
  pastDueCount: number;
  canceledInRange: number;
  activeAtRangeStart: number;
  /** canceled during range / active at range start */
  churnRatePct: number;
  arpu: number;
}

export function computeMrr(
  dataset: Dataset,
  range: DateRange,
): MrrStats {
  const planById = new Map(dataset.plans.map((p) => [p.id, p]));
  let mrr = 0;
  let activeCount = 0;
  let trialingCount = 0;
  let pastDueCount = 0;
  let canceledInRange = 0;
  let activeAtRangeStart = 0;

  for (const sub of dataset.subscriptions) {
    const plan = planById.get(sub.planId);
    if (!plan) continue;

    if (sub.status === "trialing") {
      trialingCount++;
    } else if (isActiveAt(sub, range.end)) {
      // active (or past_due but still billed) at the end of the range
      mrr += monthlyAmount(plan);
      activeCount++;
      if (sub.status === "past_due") pastDueCount++;
    }

    if (isActiveAt(sub, range.start)) activeAtRangeStart++;
    if (
      sub.canceledAt &&
      sub.canceledAt >= range.start &&
      sub.canceledAt <= range.end
    ) {
      canceledInRange++;
    }
  }

  return {
    mrr,
    activeCount,
    trialingCount,
    pastDueCount,
    canceledInRange,
    activeAtRangeStart,
    churnRatePct:
      activeAtRangeStart > 0 ? (canceledInRange / activeAtRangeStart) * 100 : 0,
    arpu: activeCount > 0 ? Math.round(mrr / activeCount) : 0,
  };
}
