import type { Dataset, ScenarioConfig } from "@/lib/schemas";
import { computeFee } from "@/lib/engine/fees";
import { eachDay, inRange, previousRange, type DateRange } from "./range";

export type SeriesMetric =
  | "gross"
  | "net"
  | "payments"
  | "failed"
  | "refunds"
  | "new_customers";

export interface SeriesPoint {
  date: string;
  value: number;
  /** value on the aligned day of the previous period */
  previous: number;
}

function dailyValues(
  dataset: Dataset,
  config: ScenarioConfig,
  metric: SeriesMetric,
  range: DateRange,
): Map<string, number> {
  const map = new Map<string, number>();
  const bump = (dateIso: string, v: number) => {
    const day = dateIso.slice(0, 10);
    map.set(day, (map.get(day) ?? 0) + v);
  };

  if (metric === "new_customers") {
    for (const c of dataset.customers) {
      if (inRange(c.createdAt, range)) bump(c.createdAt, 1);
    }
    return map;
  }
  if (metric === "refunds") {
    for (const r of dataset.refunds) {
      if (inRange(r.createdAt, range)) bump(r.createdAt, r.amount);
    }
    return map;
  }
  for (const p of dataset.payments) {
    if (!inRange(p.createdAt, range)) continue;
    if (metric === "failed") {
      if (p.status === "failed") bump(p.createdAt, 1);
      continue;
    }
    if (p.status !== "succeeded") continue;
    if (metric === "gross") bump(p.createdAt, p.amount);
    if (metric === "payments") bump(p.createdAt, 1);
    if (metric === "net") bump(p.createdAt, p.amount - computeFee(p, config));
  }
  if (metric === "net") {
    for (const r of dataset.refunds) {
      if (inRange(r.createdAt, range)) bump(r.createdAt, -r.amount);
    }
  }
  return map;
}

/**
 * Daily series over `range`, with the previous period of equal length
 * aligned day-by-day for comparisons.
 */
export function computeDailySeries(
  dataset: Dataset,
  config: ScenarioConfig,
  metric: SeriesMetric,
  range: DateRange,
): SeriesPoint[] {
  const prev = previousRange(range);
  const current = dailyValues(dataset, config, metric, range);
  const previous = dailyValues(dataset, config, metric, prev);
  const days = eachDay(range);
  const prevDays = eachDay(prev);
  return days.map((date, i) => ({
    date,
    value: current.get(date) ?? 0,
    previous: previous.get(prevDays[i] ?? "") ?? 0,
  }));
}

export interface Comparison {
  current: number;
  previous: number;
  /** percent change vs previous period; null when previous == 0 */
  deltaPct: number | null;
}

export function compare(current: number, previous: number): Comparison {
  return {
    current,
    previous,
    deltaPct: previous !== 0 ? ((current - previous) / Math.abs(previous)) * 100 : null,
  };
}
