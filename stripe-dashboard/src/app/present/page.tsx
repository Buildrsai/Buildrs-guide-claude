"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { AppProviders } from "@/components/providers/app-providers";
import { useActiveAccount } from "@/lib/store/app-store";
import {
  useBalances,
  useDailySeries,
  useMrr,
  useTotals,
} from "@/lib/store/use-derived";
import { compare } from "@/lib/selectors/series";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { MetricCard } from "@/components/shared/metric-card";
import { ChartCard } from "@/components/shared/chart-card";
import { DeltaPill } from "@/components/shared/delta-pill";
import { VolumeAreaChart } from "@/components/charts/volume-area-chart";
import { BarSeriesChart } from "@/components/charts/bar-series-chart";

type Slide = "volume" | "payments" | "subscriptions";
const SLIDES: Slide[] = ["volume", "payments", "subscriptions"];

function Stage() {
  const account = useActiveAccount();
  const totals = useTotals();
  const mrr = useMrr();
  const balances = useBalances();
  const gross = useDailySeries("gross");
  const payments = useDailySeries("payments");
  const failed = useDailySeries("failed");
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const compute = () =>
      setScale(
        Math.min(window.innerWidth / 1920, window.innerHeight / 1080) * 0.98,
      );
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.push("/overview");
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % SLIDES.length);
      if (e.key === "ArrowLeft")
        setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  const slide = SLIDES[index];
  const currency = account?.config.currency ?? "eur";
  const grossCmp = useMemo(
    () =>
      totals
        ? compare(totals.current.grossVolume, totals.previous.grossVolume)
        : null,
    [totals],
  );

  if (!account || !totals || !balances) return null;

  return (
    <div className="flex h-screen w-screen items-center justify-center overflow-hidden bg-secondary">
      <div
        data-capture-root
        className="shrink-0 origin-center overflow-hidden rounded-lg bg-canvas"
        style={{ width: 1920, height: 1080, transform: `scale(${scale})` }}
      >
        <div className="flex h-full flex-col px-24 py-16">
          <header className="mb-10 flex items-end justify-between">
            <div>
              <div className="label-lg text-muted">{account.name}</div>
              <h1 className="headline-display text-secondary">
                {slide === "volume"
                  ? "Gross volume"
                  : slide === "payments"
                    ? "Payments"
                    : "Subscriptions"}
              </h1>
            </div>
            <div className="caption text-muted">
              {formatDate(account.config.periodEnd)} · {index + 1}/{SLIDES.length}
            </div>
          </header>

          {slide === "volume" && (
            <div className="grid flex-1 grid-cols-4 gap-6">
              <MetricCard
                label="Gross volume"
                value={formatCurrency(totals.current.grossVolume, currency)}
                deltaPct={grossCmp?.deltaPct}
              />
              <MetricCard
                label="Net volume"
                value={formatCurrency(totals.current.netVolume, currency)}
              />
              <MetricCard
                label="Available balance"
                value={formatCurrency(balances.available, currency)}
              />
              <MetricCard
                label="Next payout"
                value={formatCurrency(balances.nextPayoutAmount, currency)}
                hint={formatDate(balances.nextPayoutDate)}
              />
              <div className="col-span-4">
                <ChartCard
                  title="Gross volume"
                  value={formatCurrency(totals.current.grossVolume, currency)}
                  meta={<DeltaPill deltaPct={grossCmp?.deltaPct ?? null} />}
                >
                  <VolumeAreaChart
                    data={gross}
                    height={520}
                    formatValue={(v) =>
                      formatCurrency(v, currency, { compact: true })
                    }
                  />
                </ChartCard>
              </div>
            </div>
          )}

          {slide === "payments" && (
            <div className="grid flex-1 grid-cols-3 gap-6">
              <MetricCard
                label="Successful payments"
                value={formatNumber(totals.current.succeededCount)}
              />
              <MetricCard
                label="Failed payments"
                value={formatNumber(totals.current.failedCount)}
              />
              <MetricCard
                label="Refunded"
                value={formatCurrency(totals.current.refundTotal, currency)}
              />
              <div className="col-span-2">
                <ChartCard title="Payments per day">
                  <BarSeriesChart
                    data={payments}
                    height={520}
                    formatValue={(v) => formatNumber(v)}
                  />
                </ChartCard>
              </div>
              <ChartCard title="Failed per day">
                <BarSeriesChart
                  data={failed}
                  height={520}
                  formatValue={(v) => formatNumber(v)}
                  tone="error"
                />
              </ChartCard>
            </div>
          )}

          {slide === "subscriptions" && mrr && (
            <div className="grid flex-1 grid-cols-4 gap-6">
              <MetricCard
                label="MRR"
                value={formatCurrency(mrr.current.mrr, currency)}
                deltaPct={compare(mrr.current.mrr, mrr.previous.mrr).deltaPct}
              />
              <MetricCard
                label="Active subscriptions"
                value={formatNumber(mrr.current.activeCount)}
              />
              <MetricCard
                label="Churn"
                value={`${mrr.current.churnRatePct.toFixed(1)}%`}
              />
              <MetricCard
                label="ARPU"
                value={formatCurrency(mrr.current.arpu, currency)}
              />
              <div className="col-span-4">
                <ChartCard
                  title="Gross volume"
                  value={formatCurrency(totals.current.grossVolume, currency)}
                >
                  <VolumeAreaChart
                    data={gross}
                    height={520}
                    formatValue={(v) =>
                      formatCurrency(v, currency, { compact: true })
                    }
                  />
                </ChartCard>
              </div>
            </div>
          )}

          <footer className="mt-6 flex items-center justify-between">
            <span className="caption text-muted">
              ← → to navigate · Esc to exit
            </span>
          </footer>
        </div>
      </div>
      <button
        onClick={() => router.push("/overview")}
        className="absolute right-4 top-4 cursor-pointer rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

export default function PresentPage() {
  return (
    <AppProviders>
      <Stage />
    </AppProviders>
  );
}
