"use client";

import { useMemo, useState } from "react";
import { useActiveAccount, useAppStore } from "@/lib/store/app-store";
import { useMrr } from "@/lib/store/use-derived";
import { compare } from "@/lib/selectors/series";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { PeriodPicker } from "@/components/shared/period-picker";
import { MetricCard } from "@/components/shared/metric-card";
import { DataTable, type Column } from "@/components/shared/data-table";
import { FilterTabs } from "@/components/shared/filter-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { SubscriptionDrawer } from "@/components/drawers/entity-drawers";
import type { Subscription } from "@/lib/schemas";

type Tab = "all" | "active" | "trialing" | "past_due" | "canceled";

export default function SubscriptionsPage() {
  const account = useActiveAccount();
  const dataset = useAppStore((s) => s.dataset);
  const mrr = useMrr();
  const [tab, setTab] = useState<Tab>("all");
  const [selected, setSelected] = useState<Subscription | null>(null);

  const planById = useMemo(
    () => new Map(dataset?.plans.map((p) => [p.id, p]) ?? []),
    [dataset],
  );
  const customerById = useMemo(
    () => new Map(dataset?.customers.map((c) => [c.id, c]) ?? []),
    [dataset],
  );

  const rows = useMemo(() => {
    if (!dataset) return [];
    return dataset.subscriptions
      .filter((s) => tab === "all" || s.status === tab)
      .slice()
      .reverse();
  }, [dataset, tab]);

  if (!account || !mrr || !dataset) return null;
  const currency = account.config.currency;
  const mrrDelta = compare(mrr.current.mrr, mrr.previous.mrr);

  const columns: Column<Subscription>[] = [
    {
      key: "customer",
      header: "Customer",
      render: (s) => (
        <span className="font-medium text-secondary">
          {customerById.get(s.customerId)?.name ?? s.customerId}
        </span>
      ),
    },
    {
      key: "plan",
      header: "Plan",
      render: (s) => planById.get(s.planId)?.nickname ?? "—",
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      className: "w-32",
      render: (s) => {
        const plan = planById.get(s.planId);
        return plan ? (
          <span className="tabular">
            {formatCurrency(plan.amount, plan.currency)}/{plan.interval}
          </span>
        ) : (
          "—"
        );
      },
    },
    {
      key: "status",
      header: "Status",
      className: "w-28",
      render: (s) => <StatusBadge status={s.status} />,
    },
    {
      key: "started",
      header: "Started",
      align: "right",
      className: "w-32",
      render: (s) => <span className="text-muted">{formatDate(s.startDate)}</span>,
    },
    {
      key: "period",
      header: "Current period ends",
      align: "right",
      className: "w-40",
      render: (s) => (
        <span className="text-muted">
          {s.status === "canceled" && s.canceledAt
            ? `Canceled ${formatDate(s.canceledAt)}`
            : formatDate(s.currentPeriodEnd)}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Subscriptions" actions={<PeriodPicker />} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="MRR"
          value={formatCurrency(mrr.current.mrr, currency)}
          deltaPct={mrrDelta.deltaPct}
          exportId="mrr-card"
        />
        <MetricCard
          label="Active subscriptions"
          value={formatNumber(mrr.current.activeCount)}
          exportId="active-subs"
        />
        <MetricCard
          label="Churn rate"
          value={`${mrr.current.churnRatePct.toFixed(1)}%`}
          deltaPct={
            compare(mrr.current.churnRatePct, mrr.previous.churnRatePct).deltaPct
          }
          invertDelta
          hint="of subscribers at period start"
          exportId="churn-rate"
        />
        <MetricCard
          label="ARPU"
          value={formatCurrency(mrr.current.arpu, currency)}
          exportId="arpu"
        />
      </div>
      <div className="mt-6">
        <FilterTabs
          tabs={[
            { id: "all", label: "All" },
            { id: "active", label: "Active" },
            { id: "trialing", label: "Trialing" },
            { id: "past_due", label: "Past due" },
            { id: "canceled", label: "Canceled" },
          ]}
          active={tab}
          onChange={(id) => setTab(id as Tab)}
        />
        <div className="mt-3">
          <DataTable
            columns={columns}
            rows={rows}
            onRowClick={setSelected}
            emptyLabel="No subscriptions for this scenario"
          />
        </div>
      </div>
      <SubscriptionDrawer
        subscription={selected}
        onOpenChange={() => setSelected(null)}
      />
    </>
  );
}
