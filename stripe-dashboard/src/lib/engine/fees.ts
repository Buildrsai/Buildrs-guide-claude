import type { Payment, ScenarioConfig } from "@/lib/schemas";

/** Fee charged on a lost or under-review dispute, minor units. */
export const DISPUTE_FEE = 1500;

/**
 * Single source of truth for processing fees. Fees are never stored on
 * payments — they are always computed from the config (or the manual
 * feeOverride set through the edit panel).
 */
export function computeFee(
  payment: Pick<Payment, "amount" | "status" | "feeOverride">,
  config: Pick<ScenarioConfig, "feePercent" | "feeFixed">,
): number {
  if (payment.status !== "succeeded") return 0;
  if (payment.feeOverride !== undefined) return payment.feeOverride;
  return Math.round((payment.amount * config.feePercent) / 100) + config.feeFixed;
}
