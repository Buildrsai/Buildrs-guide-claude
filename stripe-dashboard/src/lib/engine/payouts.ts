import { addDays, isAfter, parseISO } from "date-fns";
import type {
  BalanceTransaction,
  Dispute,
  Payment,
  Payout,
  Refund,
  ScenarioConfig,
} from "@/lib/schemas";
import { computeFee, DISPUTE_FEE } from "./fees";
import { isoDay, periodStartOf } from "./volume-curve";
import { Rng } from "./prng";

export interface CoreEntities {
  payments: Payment[];
  refunds: Refund[];
  disputes: Dispute[];
}

export interface DerivedLedger {
  balanceTransactions: BalanceTransaction[];
  payouts: Payout[];
}

/** Disputes in these states have their funds withdrawn from the balance. */
export function isDeductedDispute(d: Pick<Dispute, "status">): boolean {
  return d.status !== "won";
}

function payoutDates(config: ScenarioConfig): string[] {
  const start = periodStartOf(config);
  const end = parseISO(config.periodEnd);
  const dates: string[] = [];
  let cursor = start;
  while (!isAfter(cursor, end)) {
    const keep =
      config.payoutSchedule === "daily"
        ? true
        : config.payoutSchedule === "weekly"
          ? cursor.getDay() === 1 // Mondays
          : cursor.getDate() === 1; // 1st of month
    if (keep) dates.push(isoDay(cursor));
    cursor = addDays(cursor, 1);
  }
  return dates;
}

/** Next payout date strictly after the simulated today. */
export function nextPayoutDate(config: ScenarioConfig): string {
  let cursor = addDays(parseISO(config.periodEnd), 1);
  for (let i = 0; i < 40; i++) {
    const keep =
      config.payoutSchedule === "daily"
        ? true
        : config.payoutSchedule === "weekly"
          ? cursor.getDay() === 1
          : cursor.getDate() === 1;
    if (keep) return isoDay(cursor);
    cursor = addDays(cursor, 1);
  }
  return isoDay(cursor);
}

/**
 * Derives the full balance ledger + payouts from the source-of-truth
 * entities. Used both by the generator and by the recompute-on-edit path,
 * so derived data can never drift from the transactions. IDs are hashed
 * from the source entity ids so an edit elsewhere never reshuffles them.
 */
export function deriveBalanceAndPayouts(
  core: CoreEntities,
  config: ScenarioConfig,
  seed: number,
): DerivedLedger {
  const today = parseISO(config.periodEnd);
  const txns: BalanceTransaction[] = [];

  const idFor = (kind: string, sourceId: string, prefix: string) =>
    new Rng(`${seed}:${kind}:${sourceId}`).id(prefix);

  const paymentById = new Map(core.payments.map((p) => [p.id, p]));

  for (const p of core.payments) {
    if (p.status !== "succeeded") continue;
    const fee = computeFee(p, config);
    const availableOn = isoDay(
      addDays(parseISO(p.createdAt), config.payoutDelayDays),
    );
    txns.push({
      id: idFor("txn-charge", p.id, "txn"),
      type: "charge",
      sourceId: p.id,
      amount: p.amount,
      fee,
      net: p.amount - fee,
      currency: p.currency,
      createdAt: p.createdAt,
      availableOn,
      status: isAfter(parseISO(availableOn), today) ? "pending" : "available",
    });
  }

  for (const r of core.refunds) {
    const payment = paymentById.get(r.paymentId);
    if (!payment) continue;
    const availableOn = isoDay(parseISO(r.createdAt));
    txns.push({
      id: idFor("txn-refund", r.id, "txn"),
      type: "refund",
      sourceId: r.id,
      amount: -r.amount,
      fee: 0,
      net: -r.amount,
      currency: payment.currency,
      createdAt: r.createdAt,
      availableOn,
      status: isAfter(parseISO(availableOn), today) ? "pending" : "available",
    });
  }

  for (const d of core.disputes) {
    if (!isDeductedDispute(d)) continue;
    const payment = paymentById.get(d.paymentId);
    if (!payment) continue;
    const availableOn = isoDay(parseISO(d.createdAt));
    txns.push({
      id: idFor("txn-dispute", d.id, "txn"),
      type: "dispute",
      sourceId: d.id,
      amount: -d.amount,
      fee: DISPUTE_FEE,
      net: -(d.amount + DISPUTE_FEE),
      currency: payment.currency,
      createdAt: d.createdAt,
      availableOn,
      status: isAfter(parseISO(availableOn), today) ? "pending" : "available",
    });
  }

  txns.sort((a, b) =>
    a.createdAt === b.createdAt
      ? a.id.localeCompare(b.id)
      : a.createdAt.localeCompare(b.createdAt),
  );

  // Sweep available funds into payouts on the schedule.
  const payouts: Payout[] = [];
  const swept = new Set<string>();
  for (const date of payoutDates(config)) {
    const eligibleNow = txns.filter(
      (t) => !swept.has(t.id) && t.status === "available" && t.availableOn <= date,
    );
    const amount = eligibleNow.reduce((s, t) => s + t.net, 0);
    if (amount <= 0 || eligibleNow.length === 0) continue;
    const payoutId = new Rng(`${seed}:payout:${date}`).id("po");
    for (const t of eligibleNow) {
      t.payoutId = payoutId;
      swept.add(t.id);
    }
    const arrival = isoDay(addDays(parseISO(date), 2));
    payouts.push({
      id: payoutId,
      amount,
      currency: config.currency,
      createdAt: date,
      arrivalDate: arrival,
      status: isAfter(parseISO(arrival), today) ? "in_transit" : "paid",
      method: "standard",
    });
  }

  // Ledger entries for payouts themselves (display only — excluded from
  // balance math, which tracks sweeping via payoutId).
  const payoutTxns: BalanceTransaction[] = payouts.map((po) => ({
    id: new Rng(`${seed}:txn-payout:${po.id}`).id("txn"),
    type: "payout",
    sourceId: po.id,
    amount: -po.amount,
    fee: 0,
    net: -po.amount,
    currency: po.currency,
    createdAt: po.createdAt,
    availableOn: po.createdAt,
    status: "available",
    payoutId: po.id,
  }));

  const balanceTransactions = [...txns, ...payoutTxns].sort((a, b) =>
    a.createdAt === b.createdAt
      ? a.id.localeCompare(b.id)
      : b.createdAt.localeCompare(a.createdAt),
  );

  return { balanceTransactions, payouts };
}
