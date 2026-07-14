import { addDays, parseISO } from "date-fns";
import type { Account, ScenarioConfig } from "@/lib/schemas";
import { isoDay } from "./volume-curve";
import { getPreset } from "./presets";

export type ScenarioActionType =
  | "generate_scenario"
  | "regenerate_activity"
  | "simulate_growth"
  | "simulate_decline"
  | "add_launch_spike"
  | "add_refund_wave"
  | "add_failed_payment_incident"
  | "reset_scenario";

export interface ScenarioActionResult {
  config: ScenarioConfig;
  seed: number;
}

const GROWTH_STEP = 8;

function withOverlay(
  config: ScenarioConfig,
  type: "launch_spike" | "refund_wave" | "failure_incident",
  startOffsetDays: number,
  days: number,
  multiplier: number,
): ScenarioConfig {
  const count = config.overlays.filter((o) => o.type === type).length + 1;
  return {
    ...config,
    overlays: [
      ...config.overlays,
      {
        id: `ovl_${type}_${count}`,
        type,
        startDate: isoDay(addDays(parseISO(config.periodEnd), -startOffsetDays)),
        days,
        multiplier,
      },
    ],
  };
}

/**
 * Every scenario action is a pure config/seed transformation; the caller
 * then re-runs generateDataset — same inputs, same output, always.
 */
export function applyScenarioAction(
  account: Pick<Account, "config" | "seed" | "initialSeed" | "presetId">,
  action: ScenarioActionType,
): ScenarioActionResult {
  const { config, seed } = account;
  switch (action) {
    case "generate_scenario": {
      const preset = account.presetId ? getPreset(account.presetId) : undefined;
      return { config: preset ? preset.config : config, seed };
    }
    case "regenerate_activity":
      return { config, seed: (seed + 1) >>> 0 };
    case "simulate_growth":
      return {
        config: {
          ...config,
          growthRatePctMonthly: Math.min(400, config.growthRatePctMonthly + GROWTH_STEP),
        },
        seed,
      };
    case "simulate_decline":
      return {
        config: {
          ...config,
          growthRatePctMonthly: Math.max(-80, config.growthRatePctMonthly - GROWTH_STEP),
        },
        seed,
      };
    case "add_launch_spike":
      return { config: withOverlay(config, "launch_spike", 6, 7, 4), seed };
    case "add_refund_wave":
      return { config: withOverlay(config, "refund_wave", 20, 21, 6), seed };
    case "add_failed_payment_incident":
      return { config: withOverlay(config, "failure_incident", 7, 5, 8), seed };
    case "reset_scenario": {
      const preset = account.presetId ? getPreset(account.presetId) : undefined;
      return {
        config: preset ? preset.config : { ...config, overlays: [] },
        seed: account.initialSeed,
      };
    }
  }
}
