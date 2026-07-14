import { describe, expect, it } from "vitest";
import { generateDataset } from "@/lib/engine/generate";
import { computeFee, DISPUTE_FEE } from "@/lib/engine/fees";
import { isDeductedDispute } from "@/lib/engine/payouts";
import { computeTotals } from "@/lib/selectors/totals";
import { computeBalances } from "@/lib/selectors/balances";
import { computeDailySeries } from "@/lib/selectors/series";
import { rangeFromPreset } from "@/lib/selectors/range";
import { accountFromPreset } from "./helpers";

const account = accountFromPreset("saas-50k-mrr");
const dataset = generateDataset(account);
const config = account.config;
const all = rangeFromPreset("all", config);

describe("aggregate coherence (single source of truth)", () => {
  it("gross volume equals the manual sum of succeeded payments", () => {
    const manual = dataset.payments
      .filter((p) => p.status === "succeeded")
      .reduce((s, p) => s + p.amount, 0);
    expect(computeTotals(dataset, config, all).grossVolume).toBe(manual);
  });

  it("net = gross − refunds − fees − disputes", () => {
    const t = computeTotals(dataset, config, all);
    expect(t.netVolume).toBe(
      t.grossVolume - t.refundTotal - t.feeTotal - t.disputeTotal,
    );
    const manualRefunds = dataset.refunds.reduce((s, r) => s + r.amount, 0);
    expect(t.refundTotal).toBe(manualRefunds);
  });

  it("refunds genuinely decrease net volume", () => {
    const t = computeTotals(dataset, config, all);
    expect(t.refundTotal).toBeGreaterThan(0);
    expect(t.netVolume).toBeLessThan(t.grossVolume - t.feeTotal);
  });

  it("every refund maps to a succeeded payment, dated after it, ≤ its amount", () => {
    const byId = new Map(dataset.payments.map((p) => [p.id, p]));
    for (const r of dataset.refunds) {
      const p = byId.get(r.paymentId);
      expect(p).toBeDefined();
      expect(p!.status).toBe("succeeded");
      expect(r.createdAt >= p!.createdAt).toBe(true);
      expect(r.amount).toBeLessThanOrEqual(p!.amount);
    }
  });

  it("fee total equals the sum of ledger charge fees", () => {
    const t = computeTotals(dataset, config, all);
    const ledgerFees = dataset.balanceTransactions
      .filter((x) => x.type === "charge")
      .reduce((s, x) => s + x.fee, 0);
    expect(t.feeTotal).toBe(ledgerFees);
  });

  it("daily gross series sums to the period gross volume", () => {
    const series = computeDailySeries(dataset, config, "gross", all);
    const sum = series.reduce((s, pt) => s + pt.value, 0);
    expect(sum).toBe(computeTotals(dataset, config, all).grossVolume);
  });

  it("balances reconcile with payouts: paid + in transit + available + pending = Σ net ledger", () => {
    const b = computeBalances(dataset, config);
    const netLedger = dataset.balanceTransactions
      .filter((t) => t.type !== "payout")
      .reduce((s, t) => s + t.net, 0);
    expect(b.totalPaidOut + b.inTransit + b.available + b.pending).toBe(netLedger);
  });

  it("every payout equals the sum of the ledger entries it swept", () => {
    const byPayout = new Map<string, number>();
    for (const t of dataset.balanceTransactions) {
      if (t.type === "payout" || !t.payoutId) continue;
      byPayout.set(t.payoutId, (byPayout.get(t.payoutId) ?? 0) + t.net);
    }
    for (const po of dataset.payouts) {
      expect(byPayout.get(po.id)).toBe(po.amount);
    }
  });

  it("dispute deductions match ledger dispute entries", () => {
    const deducted = dataset.disputes
      .filter(isDeductedDispute)
      .reduce((s, d) => s + d.amount + DISPUTE_FEE, 0);
    const ledger = dataset.balanceTransactions
      .filter((t) => t.type === "dispute")
      .reduce((s, t) => s + -t.net, 0);
    expect(ledger).toBe(deducted);
  });
});

describe("fees", () => {
  it("computes percent + fixed on the amount", () => {
    expect(
      computeFee(
        { amount: 10_000, status: "succeeded" },
        { feePercent: 2.9, feeFixed: 30 },
      ),
    ).toBe(320);
  });

  it("respects a manual fee override", () => {
    expect(
      computeFee(
        { amount: 10_000, status: "succeeded", feeOverride: 555 },
        { feePercent: 2.9, feeFixed: 30 },
      ),
    ).toBe(555);
  });

  it("failed payments carry no fee", () => {
    expect(
      computeFee(
        { amount: 10_000, status: "failed" },
        { feePercent: 2.9, feeFixed: 30 },
      ),
    ).toBe(0);
  });
});
