import { describe, expect, it } from "vitest";
import { generateDataset } from "@/lib/engine/generate";
import { computeFee } from "@/lib/engine/fees";
import { rebuildDerived } from "@/lib/selectors/recompute";
import { computeTotals } from "@/lib/selectors/totals";
import { computeBalances } from "@/lib/selectors/balances";
import { computeDailySeries } from "@/lib/selectors/series";
import { rangeFromPreset } from "@/lib/selectors/range";
import { accountFromPreset } from "./helpers";

const account = accountFromPreset("saas-10k-mrr");
const config = account.config;
const all = rangeFromPreset("all", config);

describe("recompute on edit", () => {
  it("editing a payment amount shifts totals, series and balances by the exact delta", () => {
    const dataset = generateDataset(account);
    const target = dataset.payments.find((p) => p.status === "succeeded")!;
    const delta = 12_345;
    const edited = rebuildDerived(
      {
        ...dataset,
        payments: dataset.payments.map((p) =>
          p.id === target.id ? { ...p, amount: p.amount + delta } : p,
        ),
      },
      config,
    );

    const before = computeTotals(dataset, config, all);
    const after = computeTotals(edited, config, all);
    expect(after.grossVolume - before.grossVolume).toBe(delta);

    const feeBefore = computeFee(target, config);
    const feeAfter = computeFee({ ...target, amount: target.amount + delta }, config);
    expect(after.feeTotal - before.feeTotal).toBe(feeAfter - feeBefore);
    expect(after.netVolume - before.netVolume).toBe(delta - (feeAfter - feeBefore));

    // the daily chart bucket moves by exactly the delta
    const day = target.createdAt.slice(0, 10);
    const sBefore = computeDailySeries(dataset, config, "gross", all);
    const sAfter = computeDailySeries(edited, config, "gross", all);
    const pBefore = sBefore.find((p) => p.date === day)!.value;
    const pAfter = sAfter.find((p) => p.date === day)!.value;
    expect(pAfter - pBefore).toBe(delta);

    // balances + payouts still reconcile after the edit
    const b = computeBalances(edited, config);
    const netLedger = edited.balanceTransactions
      .filter((t) => t.type !== "payout")
      .reduce((s, t) => s + t.net, 0);
    expect(b.totalPaidOut + b.inTransit + b.available + b.pending).toBe(netLedger);
  });

  it("editing a payment date moves it between chart buckets", () => {
    const dataset = generateDataset(account);
    const target = dataset.payments.find(
      (p) => p.status === "succeeded" && p.createdAt > all.start,
    )!;
    const fromDay = target.createdAt.slice(0, 10);
    const toDay = all.start;
    const edited = rebuildDerived(
      {
        ...dataset,
        payments: dataset.payments.map((p) =>
          p.id === target.id ? { ...p, createdAt: toDay } : p,
        ),
      },
      config,
    );
    const sBefore = computeDailySeries(dataset, config, "gross", all);
    const sAfter = computeDailySeries(edited, config, "gross", all);
    expect(
      sBefore.find((p) => p.date === fromDay)!.value -
        sAfter.find((p) => p.date === fromDay)!.value,
    ).toBe(target.amount);
    expect(
      sAfter.find((p) => p.date === toDay)!.value -
        sBefore.find((p) => p.date === toDay)!.value,
    ).toBe(target.amount);
  });

  it("recompute is deterministic (same edit → same ledger ids)", () => {
    const dataset = generateDataset(account);
    const edit = (d: typeof dataset) =>
      rebuildDerived(
        {
          ...d,
          payments: d.payments.map((p, i) =>
            i === 0 ? { ...p, amount: p.amount + 100 } : p,
          ),
        },
        config,
      );
    expect(JSON.stringify(edit(dataset))).toEqual(JSON.stringify(edit(dataset)));
  });
});
