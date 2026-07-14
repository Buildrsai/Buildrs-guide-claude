"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useActiveAccount, useAppStore } from "@/lib/store/app-store";
import {
  useBalances,
  useDailySeries,
  useMrr,
  useTotals,
} from "@/lib/store/use-derived";
import { compare } from "@/lib/selectors/series";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { PeriodPicker } from "@/components/shared/period-picker";
import { MetricCard } from "@/components/shared/metric-card";
import { ChartCard } from "@/components/shared/chart-card";
import { DeltaPill } from "@/components/shared/delta-pill";
import { StatusBadge } from "@/components/shared/status-badge";
import { VolumeAreaChart } from "@/components/charts/volume-area-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { PaymentDrawer } from "@/components/drawers/payment-drawer";
import type { Payment } from "@/lib/schemas";

export default function OverviewPage() {
  const account = useActiveAccount();
  const dataset = useAppStore((s) => s.dataset);
  const totals = useTotals();
  const mrr = useMrr();
  const balances = useBalances();
  const grossSeries = useDailySeries("gross");
  const [selected, setSelected] = useState<Payment | null>(null);

  const byMethod = useMemo(() => {
    if (!dataset) return [];
    const map = new Map<string, number>();
    for (const p of dataset.payments) {
      if (p.status !== "succeeded") continue;
      const key = p.paymentMethod.type.replaceAll("_", " ");
      map.set(key, (map.get(key) ?? 0) + p.amount);
    }
    return [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [dataset]);

  const topPlans = useMemo(() => {
    if (!dataset) return [];
    const counts = new Map<string, number>();
    for (const s of dataset.subscriptions) {
      if (s.status === "canceled") continue;
      counts.set(s.planId, (counts.get(s.planId) ?? 0) + 1);
    }
    return dataset.plans
      .map((p) => ({ plan: p, count: counts.get(p.id) ?? 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [dataset]);

  const recentPayments = useMemo(
    () => (dataset ? dataset.payments.slice(-7).reverse() : []),
    [dataset],
  );

  if (!account || !totals || !balances) return null;
  const currency = account.config.currency;
  const gross = compare(totals.current.grossVolume, totals.previous.grossVolume);
  const net = compare(totals.current.netVolume, totals.previous.netVolume);
  const cust = compare(totals.current.newCustomers, totals.previous.newCustomers);

  return (
    <>
      <PageHeader title={account.name} actions={<PeriodPicker />}>
        <p className="caption mt-1 text-muted">
          Here’s what’s happening with your business.
        </p>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Gross volume"
          value={formatCurrency(gross.current, currency)}
          deltaPct={gross.deltaPct}
          exportId="gross-volume"
        />
        <MetricCard
          label="Net volume"
          value={formatCurrency(net.current, currency)}
          deltaPct={net.deltaPct}
          exportId="net-volume"
        />
        {account.config.mrrTarget > 0 && mrr ? (
          <MetricCard
            label="MRR"
            value={formatCurrency(mrr.current.mrr, currency)}
            deltaPct={compare(mrr.current.mrr, mrr.previous.mrr).deltaPct}
            exportId="mrr"
          />
        ) : (
          <MetricCard
            label="Payments"
            value={formatNumber(totals.current.succeededCount)}
            deltaPct={
              compare(
                totals.current.succeededCount,
                totals.previous.succeededCount,
              ).deltaPct
            }
            exportId="payments-count"
          />
        )}
        <MetricCard
          label="New customers"
          value={formatNumber(cust.current)}
          deltaPct={cust.deltaPct}
          exportId="new-customers"
        />
      </div>

      <div className="mt-4">
        <ChartCard
          title="Gross volume"
          value={formatCurrency(gross.current, currency)}
          meta={<DeltaPill deltaPct={gross.deltaPct} />}
          exportId="gross-volume-chart"
        >
          <VolumeAreaChart
            data={grossSeries}
            height={240}
            formatValue={(v) => formatCurrency(v, currency, { compact: true })}
          />
          <p className="caption mt-2 text-muted">
            Solid line: selected period · dashed line: previous period
          </p>
        </ChartCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Volume by payment method" exportId="volume-by-method">
          <DonutChart
            data={byMethod}
            formatValue={(v) => formatCurrency(v, currency, { compact: true })}
          />
        </ChartCard>

        <div
          data-export-target="balances-summary"
          className="rounded-lg border border-border bg-white p-4 shadow-card"
        >
          <h3 className="label-md text-secondary">Balances</h3>
          <div className="mt-3 flex flex-col gap-3">
            <div>
              <div className="caption text-muted">Available</div>
              <div className="headline-md text-secondary tabular">
                {formatCurrency(balances.available, currency)}
              </div>
            </div>
            <div>
              <div className="caption text-muted">Pending</div>
              <div className="headline-md text-secondary tabular">
                {formatCurrency(balances.pending, currency)}
              </div>
            </div>
            <div className="border-t border-border pt-3">
              <div className="caption text-muted">
                Next payout · {formatDate(balances.nextPayoutDate)}
              </div>
              <div className="text-[16px] font-medium text-secondary tabular">
                {formatCurrency(balances.nextPayoutAmount, currency)}
              </div>
            </div>
            <Link
              href="/balances"
              className="label-md inline-flex items-center gap-1 text-primary hover:text-primary-60"
            >
              View balances <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {topPlans.length > 0 ? (
          <div
            data-export-target="top-plans"
            className="rounded-lg border border-border bg-white p-4 shadow-card"
          >
            <h3 className="label-md text-secondary">Top plans</h3>
            <ul className="mt-3 flex flex-col gap-2.5">
              {topPlans.map(({ plan, count }) => (
                <li key={plan.id} className="flex items-center justify-between">
                  <span className="text-[13.5px] text-secondary">{plan.nickname}</span>
                  <span className="caption text-muted tabular">
                    {formatNumber(count)} active ·{" "}
                    {formatCurrency(plan.amount, currency)}/{plan.interval}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/subscriptions"
              className="label-md mt-4 inline-flex items-center gap-1 text-primary hover:text-primary-60"
            >
              View subscriptions <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div
            data-export-target="failed-payments"
            className="rounded-lg border border-border bg-white p-4 shadow-card"
          >
            <h3 className="label-md text-secondary">Failed payments</h3>
            <div className="mt-3">
              <div className="headline-md text-secondary tabular">
                {formatNumber(totals.current.failedCount)}
              </div>
              <p className="caption mt-1 text-muted">
                {(
                  (totals.current.failedCount /
                    Math.max(
                      1,
                      totals.current.failedCount + totals.current.succeededCount,
                    )) *
                  100
                ).toFixed(1)}
                % of attempted payments failed in this period.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 rounded-lg border border-border bg-white p-4 shadow-card">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="label-md text-secondary">Recent payments</h3>
          <Link
            href="/payments"
            className="label-md inline-flex items-center gap-1 text-primary hover:text-primary-60"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <table className="w-full text-[14px]">
          <tbody>
            {recentPayments.map((p) => (
              <tr
                key={p.id}
                onClick={() => setSelected(p)}
                className="cursor-pointer border-b border-border/60 last:border-0 hover:bg-canvas"
              >
                <td className="w-28 py-2 pr-2 tabular font-medium text-secondary">
                  {formatCurrency(p.amount, p.currency)}
                </td>
                <td className="py-2 pr-2">
                  <StatusBadge status={p.status} />
                </td>
                <td className="truncate py-2 pr-2 text-muted">{p.description}</td>
                <td className="py-2 text-right caption text-muted">
                  {formatDate(p.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PaymentDrawer payment={selected} onOpenChange={() => setSelected(null)} />
    </>
  );
}
