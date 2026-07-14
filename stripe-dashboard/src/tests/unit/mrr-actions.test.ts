import { describe, expect, it } from "vitest";
import { generateDataset } from "@/lib/engine/generate";
import { applyScenarioAction } from "@/lib/engine/actions";
import { computeMrr } from "@/lib/selectors/mrr";
import { computeTotals } from "@/lib/selectors/totals";
import { rangeFromPreset } from "@/lib/selectors/range";
import { accountFromPreset } from "./helpers";

describe("MRR & churn", () => {
  const account = accountFromPreset("saas-50k-mrr");
  const dataset = generateDataset(account);
  const range = rangeFromPreset("30d", account.config);

  it("MRR lands near the configured target", () => {
    const { mrr } = computeMrr(dataset, range);
    const target = account.config.mrrTarget;
    expect(mrr).toBeGreaterThan(target * 0.85);
    expect(mrr).toBeLessThan(target * 1.2);
  });

  it("churn = canceled during range / active at range start", () => {
    const stats = computeMrr(dataset, range);
    expect(stats.churnRatePct).toBeCloseTo(
      (stats.canceledInRange / stats.activeAtRangeStart) * 100,
      10,
    );
    expect(stats.churnRatePct).toBeGreaterThan(0);
  });
});

describe("scenario actions", () => {
  const account = accountFromPreset("saas-10k-mrr");

  it("regenerate_activity changes the seed but keeps the config", () => {
    const r = applyScenarioAction(account, "regenerate_activity");
    expect(r.seed).toBe(account.seed + 1);
    expect(r.config).toEqual(account.config);
  });

  it("simulate_growth / simulate_decline shift the growth rate", () => {
    const up = applyScenarioAction(account, "simulate_growth");
    const down = applyScenarioAction(account, "simulate_decline");
    expect(up.config.growthRatePctMonthly).toBeGreaterThan(
      account.config.growthRatePctMonthly,
    );
    expect(down.config.growthRatePctMonthly).toBeLessThan(
      account.config.growthRatePctMonthly,
    );
  });

  it("add_launch_spike raises volume in the spike window", () => {
    const ecom = accountFromPreset("ecommerce-high-volume");
    const spiked = applyScenarioAction(ecom, "add_launch_spike");
    const base = generateDataset(ecom);
    const withSpike = generateDataset({ ...ecom, config: spiked.config });
    const window = rangeFromPreset("7d", ecom.config);
    const before = computeTotals(base, ecom.config, window).grossVolume;
    const after = computeTotals(withSpike, spiked.config, window).grossVolume;
    expect(after).toBeGreaterThan(before * 2);
  });

  it("add_refund_wave raises refunds", () => {
    const waved = applyScenarioAction(account, "add_refund_wave");
    const base = generateDataset(account);
    const withWave = generateDataset({ ...account, config: waved.config });
    const all = rangeFromPreset("all", account.config);
    expect(
      computeTotals(withWave, waved.config, all).refundTotal,
    ).toBeGreaterThan(computeTotals(base, account.config, all).refundTotal * 1.5);
  });

  it("add_failed_payment_incident raises failures", () => {
    const inc = applyScenarioAction(account, "add_failed_payment_incident");
    const base = generateDataset(account);
    const withInc = generateDataset({ ...account, config: inc.config });
    const all = rangeFromPreset("all", account.config);
    expect(computeTotals(withInc, inc.config, all).failedCount).toBeGreaterThan(
      computeTotals(base, account.config, all).failedCount,
    );
  });

  it("reset_scenario restores the preset config and initial seed", () => {
    const mutated = {
      ...account,
      seed: account.seed + 5,
      config: applyScenarioAction(account, "add_refund_wave").config,
    };
    const reset = applyScenarioAction(mutated, "reset_scenario");
    expect(reset.seed).toBe(account.initialSeed);
    expect(reset.config).toEqual(account.config);
  });
});
