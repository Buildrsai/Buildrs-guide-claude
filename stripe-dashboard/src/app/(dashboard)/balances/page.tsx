"use client";

import { useMemo, useState } from "react";
import { useActiveAccount, useAppStore } from "@/lib/store/app-store";
import { useBalances } from "@/lib/store/use-derived";
import { formatCurrency, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { DataTable, type Column } from "@/components/shared/data-table";
import { FilterTabs } from "@/components/shared/filter-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import type { BalanceTransaction } from "@/lib/schemas";

type Tab = "all" | "charge" | "refund" | "dispute" | "payout";

export default function BalancesPage() {
  const account = useActiveAccount();
  const dataset = useAppStore((s) => s.dataset);
  const balances = useBalances();
  const [tab, setTab] = useState<Tab>("all");
  const [selected, setSelected] = useState<BalanceTransaction | null>(null);
  void selected;

  const rows = useMemo(() => {
    if (!dataset) return [];
    return dataset.balanceTransactions.filter(
      (t) => tab === "all" || t.type === tab,
    );
  }, [dataset, tab]);

  if (!account || !balances) return null;
  const currency = account.config.currency;

  const columns: Column<BalanceTransaction>[] = [
    {
      key: "type",
      header: "Type",
      className: "w-24",
      render: (t) => <span className="capitalize">{t.type}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      className: "w-32",
      render: (t) => (
        <span className={t.amount < 0 ? "text-error tabular" : "tabular"}>
          {formatCurrency(t.amount, t.currency)}
        </span>
      ),
    },
    {
      key: "fee",
      header: "Fee",
      align: "right",
      className: "w-24",
      render: (t) => (
        <span className="text-muted tabular">{formatCurrency(t.fee, t.currency)}</span>
      ),
    },
    {
      key: "net",
      header: "Net",
      align: "right",
      className: "w-32",
      render: (t) => (
        <span className="font-medium tabular">
          {formatCurrency(t.net, t.currency)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      className: "w-28",
      render: (t) => (
        <StatusBadge status={t.payoutId && t.type !== "payout" ? "paid" : t.status} />
      ),
    },
    {
      key: "source",
      header: "Source",
      render: (t) => <span className="font-mono text-[12px] text-muted">{t.sourceId}</span>,
    },
    {
      key: "available",
      header: "Available on",
      align: "right",
      className: "w-32",
      render: (t) => <span className="text-muted">{formatDate(t.availableOn)}</span>,
    },
    {
      key: "created",
      header: "Created",
      align: "right",
      className: "w-32",
      render: (t) => <span className="text-muted">{formatDate(t.createdAt)}</span>,
    },
  ];

  return (
    <>
      <PageHeader title="Balances" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <MetricCard
          label="Available balance"
          value={formatCurrency(balances.available, currency)}
          hint="settled, awaiting payout"
          exportId="available-balance"
        />
        <MetricCard
          label="Pending balance"
          value={formatCurrency(balances.pending, currency)}
          hint={`settles after ${account.config.payoutDelayDays} days`}
          exportId="pending-balance"
        />
        <MetricCard
          label="Next payout"
          value={formatCurrency(balances.nextPayoutAmount, currency)}
          hint={formatDate(balances.nextPayoutDate)}
          exportId="next-payout"
        />
      </div>
      <div className="mt-6">
        <h2 className="headline-md mb-2 text-secondary">Balance activity</h2>
        <FilterTabs
          tabs={[
            { id: "all", label: "All" },
            { id: "charge", label: "Charges" },
            { id: "refund", label: "Refunds" },
            { id: "dispute", label: "Disputes" },
            { id: "payout", label: "Payouts" },
          ]}
          active={tab}
          onChange={(id) => setTab(id as Tab)}
        />
        <div className="mt-3">
          <DataTable columns={columns} rows={rows} onRowClick={setSelected} />
        </div>
      </div>
    </>
  );
}
