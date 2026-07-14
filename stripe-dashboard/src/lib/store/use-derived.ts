"use client";

import { useMemo } from "react";
import { computeTotals, type Totals } from "@/lib/selectors/totals";
import { computeBalances, type Balances } from "@/lib/selectors/balances";
import { computeMrr, type MrrStats } from "@/lib/selectors/mrr";
import {
  computeDailySeries,
  type SeriesMetric,
  type SeriesPoint,
} from "@/lib/selectors/series";
import {
  previousRange,
  rangeFromPreset,
  type DateRange,
} from "@/lib/selectors/range";
import { useActiveAccount, useAppStore } from "./app-store";

export function useRange(): DateRange | null {
  const account = useActiveAccount();
  const preset = useAppStore((s) => s.rangePreset);
  return useMemo(
    () => (account ? rangeFromPreset(preset, account.config) : null),
    [account, preset],
  );
}

export function useTotals(): { current: Totals; previous: Totals } | null {
  const dataset = useAppStore((s) => s.dataset);
  const account = useActiveAccount();
  const range = useRange();
  return useMemo(() => {
    if (!dataset || !account || !range) return null;
    return {
      current: computeTotals(dataset, account.config, range),
      previous: computeTotals(dataset, account.config, previousRange(range)),
    };
  }, [dataset, account, range]);
}

export function useBalances(): Balances | null {
  const dataset = useAppStore((s) => s.dataset);
  const account = useActiveAccount();
  return useMemo(
    () => (dataset && account ? computeBalances(dataset, account.config) : null),
    [dataset, account],
  );
}

export function useMrr(): { current: MrrStats; previous: MrrStats } | null {
  const dataset = useAppStore((s) => s.dataset);
  const range = useRange();
  return useMemo(() => {
    if (!dataset || !range) return null;
    return {
      current: computeMrr(dataset, range),
      previous: computeMrr(dataset, previousRange(range)),
    };
  }, [dataset, range]);
}

export function useDailySeries(metric: SeriesMetric): SeriesPoint[] {
  const dataset = useAppStore((s) => s.dataset);
  const account = useActiveAccount();
  const range = useRange();
  return useMemo(() => {
    if (!dataset || !account || !range) return [];
    return computeDailySeries(dataset, account.config, metric, range);
  }, [dataset, account, range, metric]);
}
