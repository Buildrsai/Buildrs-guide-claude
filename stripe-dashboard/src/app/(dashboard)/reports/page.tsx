"use client";

import { useActiveAccount } from "@/lib/store/app-store";
import {
  useDailySeries,
  useMrr,
  useTotals,
} from "@/lib/store/use-derived";
import { compare } from "@/lib/selectors/series";
import { formatCurrency, formatNumber } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { PeriodPicker } from "@/components/shared/period-picker";
import { ChartCard } from "@/components/shared/chart-card";
import { DeltaPill } from "@/components/shared/delta-pill";
import { VolumeAreaChart } from "@/components/charts/volume-area-chart";
import { BarSeriesChart } from "@/components/charts/bar-series-chart";

export default function ReportsPage() {
  const account = useActiveAccount();
  const totals = useTotals();
  const mrr = useMrr();
  const gross = useDailySeries("gross");
  const net = useDailySeries("net");
  const payments = useDailySeries("payments");
  const failed = useDailySeries("failed");
  const refunds = useDailySeries("refunds");
  const customers = useDailySeries("new_customers");

  if (!account || !totals) return null;
  const currency = account.config.currency;
  const fmt = (v: number) => formatCurrency(v, currency, { compact: true });

  return (
    <>
      <PageHeader title="Reports" actions={<PeriodPicker />}>
        <p className="caption mt-1 text-muted">
          Every report is computed live from the transaction-level data.
        </p>
      </PageHeader>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Gross volume"
          value={formatCurrency(totals.current.grossVolume, currency)}
          meta={
            <DeltaPill
              deltaPct={
                compare(totals.current.grossVolume, totals.previous.grossVolume)
                  .deltaPct
              }
            />
          }
          exportId="report-gross-volume"
        >
          <VolumeAreaChart data={gross} formatValue={fmt} height={200} />
        </ChartCard>
        <ChartCard
          title="Net volume"
          value={formatCurrency(totals.current.netVolume, currency)}
          meta={
            <DeltaPill
              deltaPct={
                compare(totals.current.netVolume, totals.previous.netVolume)
                  .deltaPct
              }
            />
          }
          exportId="report-net-volume"
        >
          <VolumeAreaChart data={net} formatValue={fmt} height={200} />
        </ChartCard>
        <ChartCard
          title="Successful payments"
          value={formatNumber(totals.current.succeededCount)}
          exportId="report-payments"
        >
          <BarSeriesChart
            data={payments}
            formatValue={(v) => formatNumber(v)}
            height={200}
          />
        </ChartCard>
        <ChartCard
          title="Failed payments"
          value={formatNumber(totals.current.failedCount)}
          exportId="report-failed"
        >
          <BarSeriesChart
            data={failed}
            formatValue={(v) => formatNumber(v)}
            height={200}
            tone="error"
          />
        </ChartCard>
        <ChartCard
          title="Refunds"
          value={formatCurrency(totals.current.refundTotal, currency)}
          exportId="report-refunds"
        >
          <BarSeriesChart data={refunds} formatValue={fmt} height={200} tone="error" />
        </ChartCard>
        <ChartCard
          title="New customers"
          value={formatNumber(totals.current.newCustomers)}
          exportId="report-customers"
        >
          <BarSeriesChart
            data={customers}
            formatValue={(v) => formatNumber(v)}
            height={200}
          />
        </ChartCard>
      </div>
      {account.config.mrrTarget > 0 && mrr && (
        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div
            data-export-target="report-mrr"
            className="rounded-lg border border-border bg-white p-4 shadow-card"
          >
            <div className="label-md text-muted">MRR</div>
            <div className="headline-md mt-1 text-secondary tabular">
              {formatCurrency(mrr.current.mrr, currency)}
            </div>
          </div>
          <div
            data-export-target="report-churn"
            className="rounded-lg border border-border bg-white p-4 shadow-card"
          >
            <div className="label-md text-muted">Churn</div>
            <div className="headline-md mt-1 text-secondary tabular">
              {mrr.current.churnRatePct.toFixed(1)}%
            </div>
          </div>
          <div
            data-export-target="report-active-subs"
            className="rounded-lg border border-border bg-white p-4 shadow-card"
          >
            <div className="label-md text-muted">Active subscriptions</div>
            <div className="headline-md mt-1 text-secondary tabular">
              {formatNumber(mrr.current.activeCount)}
            </div>
          </div>
          <div
            data-export-target="report-arpu"
            className="rounded-lg border border-border bg-white p-4 shadow-card"
          >
            <div className="label-md text-muted">ARPU</div>
            <div className="headline-md mt-1 text-secondary tabular">
              {formatCurrency(mrr.current.arpu, currency)}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
