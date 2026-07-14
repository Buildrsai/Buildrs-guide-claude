import { addDays, differenceInCalendarDays, parseISO, subDays } from "date-fns";
import type { Dataset, ScenarioConfig } from "@/lib/schemas";
import { isoDay, periodStartOf } from "@/lib/engine/volume-curve";

/** Inclusive ISO date range (yyyy-MM-dd). */
export interface DateRange {
  start: string;
  end: string;
}

export type RangePresetId = "7d" | "30d" | "90d" | "all";

export function rangeFromPreset(
  preset: RangePresetId,
  config: ScenarioConfig,
): DateRange {
  const end = config.periodEnd;
  switch (preset) {
    case "7d":
      return { start: isoDay(subDays(parseISO(end), 6)), end };
    case "30d":
      return { start: isoDay(subDays(parseISO(end), 29)), end };
    case "90d":
      return { start: isoDay(subDays(parseISO(end), 89)), end };
    case "all":
      return { start: isoDay(periodStartOf(config)), end };
  }
}

/** The range of identical length immediately before `range`. */
export function previousRange(range: DateRange): DateRange {
  const days =
    differenceInCalendarDays(parseISO(range.end), parseISO(range.start)) + 1;
  const prevEnd = subDays(parseISO(range.start), 1);
  return { start: isoDay(subDays(prevEnd, days - 1)), end: isoDay(prevEnd) };
}

export function inRange(dateIso: string, range: DateRange): boolean {
  const day = dateIso.slice(0, 10);
  return day >= range.start && day <= range.end;
}

export function eachDay(range: DateRange): string[] {
  const days: string[] = [];
  let cursor = parseISO(range.start);
  const end = parseISO(range.end);
  while (differenceInCalendarDays(end, cursor) >= 0) {
    days.push(isoDay(cursor));
    cursor = addDays(cursor, 1);
  }
  return days;
}

export function fullRange(dataset: Dataset, config: ScenarioConfig): DateRange {
  void dataset;
  return rangeFromPreset("all", config);
}
