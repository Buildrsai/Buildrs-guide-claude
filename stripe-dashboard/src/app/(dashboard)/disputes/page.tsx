"use client";

import { useMemo, useState } from "react";
import { useActiveAccount, useAppStore } from "@/lib/store/app-store";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { DataTable, type Column } from "@/components/shared/data-table";
import { FilterTabs } from "@/components/shared/filter-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { DisputeDrawer } from "@/components/drawers/entity-drawers";
import type { Dispute } from "@/lib/schemas";

type Tab = "all" | "needs_response" | "under_review" | "won" | "lost";

export default function DisputesPage() {
  const account = useActiveAccount();
  const dataset = useAppStore((s) => s.dataset);
  const [tab, setTab] = useState<Tab>("all");
  const [selected, setSelected] = useState<Dispute | null>(null);

  const customerById = useMemo(
    () => new Map(dataset?.customers.map((c) => [c.id, c]) ?? []),
    [dataset],
  );
  const paymentById = useMemo(
    () => new Map(dataset?.payments.map((p) => [p.id, p]) ?? []),
    [dataset],
  );

  const rows = useMemo(() => {
    if (!dataset) return [];
    return dataset.disputes
      .filter((d) => tab === "all" || d.status === tab)
      .slice()
      .reverse();
  }, [dataset, tab]);

  if (!account || !dataset) return null;
  const currency = account.config.currency;
  const open = dataset.disputes.filter(
    (d) => d.status === "needs_response" || d.status === "under_review",
  );
  const disputedAmount = dataset.disputes.reduce((s, d) => s + d.amount, 0);
  const winRateBase = dataset.disputes.filter(
    (d) => d.status === "won" || d.status === "lost",
  );
  const winRate =
    winRateBase.length > 0
      ? (winRateBase.filter((d) => d.status === "won").length /
          winRateBase.length) *
        100
      : 0;

  const columns: Column<Dispute>[] = [
    {
      key: "amount",
      header: "Amount",
      className: "w-32",
      render: (d) => (
        <span className="font-medium tabular">
          {formatCurrency(d.amount, currency)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      className: "w-36",
      render: (d) => <StatusBadge status={d.status} />,
    },
    {
      key: "reason",
      header: "Reason",
      render: (d) => (
        <span className="capitalize text-muted">{d.reason.replaceAll("_", " ")}</span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (d) => {
        const payment = paymentById.get(d.paymentId);
        return payment
          ? (customerById.get(payment.customerId)?.email ?? "—")
          : "—";
      },
    },
    {
      key: "due",
      header: "Evidence due",
      align: "right",
      className: "w-36",
      render: (d) => <span className="text-muted">{formatDate(d.evidenceDueBy)}</span>,
    },
    {
      key: "opened",
      header: "Opened",
      align: "right",
      className: "w-32",
      render: (d) => <span className="text-muted">{formatDate(d.createdAt)}</span>,
    },
  ];

  return (
    <>
      <PageHeader title="Disputes" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <MetricCard
          label="Open disputes"
          value={formatNumber(open.length)}
          hint="need a response or under review"
          exportId="open-disputes"
        />
        <MetricCard
          label="Disputed amount"
          value={formatCurrency(disputedAmount, currency)}
          exportId="disputed-amount"
        />
        <MetricCard
          label="Win rate"
          value={`${winRate.toFixed(0)}%`}
          hint="of resolved disputes"
          exportId="dispute-win-rate"
        />
      </div>
      <div className="mt-6">
        <FilterTabs
          tabs={[
            { id: "all", label: "All" },
            { id: "needs_response", label: "Needs response" },
            { id: "under_review", label: "Under review" },
            { id: "won", label: "Won" },
            { id: "lost", label: "Lost" },
          ]}
          active={tab}
          onChange={(id) => setTab(id as Tab)}
        />
        <div className="mt-3">
          <DataTable
            columns={columns}
            rows={rows}
            onRowClick={setSelected}
            emptyLabel="No disputes — lucky you"
          />
        </div>
      </div>
      <DisputeDrawer dispute={selected} onOpenChange={() => setSelected(null)} />
    </>
  );
}
