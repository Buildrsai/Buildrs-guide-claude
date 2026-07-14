import { describe, expect, it } from "vitest";
import { generateDataset } from "@/lib/engine/generate";
import { accountFromPreset } from "./helpers";

describe("deterministic generation", () => {
  it("same (config, seed) produces a byte-identical dataset", () => {
    const account = accountFromPreset("saas-10k-mrr");
    const a = generateDataset(account);
    const b = generateDataset(account);
    expect(JSON.stringify(a)).toEqual(JSON.stringify(b));
  });

  it("a different seed produces different data", () => {
    const account = accountFromPreset("saas-10k-mrr");
    const a = generateDataset(account);
    const b = generateDataset({ ...account, seed: account.seed + 1 });
    expect(JSON.stringify(a.payments)).not.toEqual(JSON.stringify(b.payments));
  });

  it("all presets generate non-trivial datasets", () => {
    for (const preset of [
      "saas-10k-mrr",
      "saas-50k-mrr",
      "saas-100k-mrr",
      "saas-high-growth",
      "saas-declining",
      "launch-7-days",
      "refund-heavy-month",
      "failed-payment-incident",
      "ecommerce-high-volume",
      "agency-irregular",
    ] as const) {
      const dataset = generateDataset(accountFromPreset(preset));
      expect(dataset.payments.length, preset).toBeGreaterThan(20);
      expect(dataset.customers.length, preset).toBeGreaterThan(10);
      expect(dataset.payouts.length, preset).toBeGreaterThan(0);
    }
  });
});
