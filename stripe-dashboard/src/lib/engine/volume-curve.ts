import {
  addDays,
  differenceInCalendarDays,
  isWeekend,
  parseISO,
  subMonths,
} from "date-fns";
import type { ScenarioConfig, ScenarioOverlay } from "@/lib/schemas";
import type { Rng } from "./prng";

export interface DayVolume {
  /** ISO date (yyyy-MM-dd) */
  date: string;
  /** target one-off revenue for the day, minor units */
  oneOffRevenue: number;
}

export function isoDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function periodStartOf(config: ScenarioConfig): Date {
  return subMonths(parseISO(config.periodEnd), config.periodMonths);
}

/** multiplier from overlays of a given type on a given day */
export function overlayFactor(
  overlays: readonly ScenarioOverlay[],
  type: ScenarioOverlay["type"],
  date: Date,
): number {
  let factor = 1;
  for (const o of overlays) {
    if (o.type !== type) continue;
    const start = parseISO(o.startDate);
    const offset = differenceInCalendarDays(date, start);
    if (offset >= 0 && offset < o.days) factor *= o.multiplier;
  }
  return factor;
}

/**
 * Builds the daily one-off revenue curve:
 * compound growth × monthly sinusoid × weekend dip × jitter × launch spikes,
 * normalized so that the last 30 days sum to the configured one-off monthly
 * target (monthlyRevenueTarget − mrrTarget, floored at 0).
 */
export function buildDailyVolumeCurve(
  config: ScenarioConfig,
  rng: Rng,
): DayVolume[] {
  const end = parseISO(config.periodEnd);
  const start = periodStartOf(config);
  const totalDays = differenceInCalendarDays(end, start);
  const dailyGrowth = Math.pow(
    1 + config.growthRatePctMonthly / 100,
    1 / 30.44,
  );

  const raw: { date: Date; weight: number }[] = [];
  for (let i = 0; i <= totalDays; i++) {
    const date = addDays(start, i);
    let w = Math.pow(dailyGrowth, i - totalDays); // == 1 at periodEnd
    const phase = (2 * Math.PI * i) / 30.44;
    w *= 1 + (config.seasonality.monthlyAmplitudePct / 100) * Math.sin(phase);
    if (isWeekend(date)) w *= 1 - config.seasonality.weekendDipPct / 100;
    w *= 1 + (rng.next() - 0.5) * 0.3; // ±15% daily jitter
    raw.push({ date, weight: Math.max(w, 0) });
  }

  const oneOffMonthlyTarget = Math.max(
    config.monthlyRevenueTarget - config.mrrTarget,
    0,
  );
  const last30 = raw.slice(-30);
  const last30Weight = last30.reduce((s, d) => s + d.weight, 0);
  const scale =
    last30Weight > 0 && oneOffMonthlyTarget > 0
      ? oneOffMonthlyTarget / last30Weight
      : 0;

  // Spikes are applied AFTER normalization so a launch genuinely adds
  // volume on top of the baseline instead of being renormalized away.
  return raw.map((d) => ({
    date: isoDay(d.date),
    oneOffRevenue: Math.round(
      d.weight * scale * overlayFactor(config.overlays, "launch_spike", d.date),
    ),
  }));
}
