"use client";

import { useMemo, useState } from "react";
import { useActiveAccount, useAppStore } from "@/lib/store/app-store";
import { useBalances } from "@/lib/store/use-derived";
import { formatCurrency, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { PayoutDrawer } from "@/components/drawers/entity-drawers";
import type { Payout } from "@/lib/schemas";

export default function PayoutsPage() {
  const account = useActiveAccount();
  const dataset = useAppStore((s) => s.dataset);
  const balances = useBalances();
  const [selected, setSelected] = useState<Payout | null>(null);

  const rows = useMemo(
    () => (dataset ? dataset.payouts.slice().reverse() : []),
    [dataset],
  );

  if (!account || !balances) return null;
  const currency = account.config.currency;

  const columns: Column<Payout>[] = [
    {
      key: "amount",
      header: "Amount",
      className: "w-36",
      render: (p) => (
        <span className="font-medium tabular">
          {formatCurrency(p.amount, p.currency)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      className: "w-28",
      render: (p) => <StatusBadge status={p.status} />,
    },
    {
      key: "method",
      header: "Method",
      render: () => <span className="text-muted">Standard — bank account</span>,
    },
    {
      key: "initiated",
      header: "Initiated",
      align: "right",
      className: "w-32",
      render: (p) => <span className="text-muted">{formatDate(p.createdAt)}</span>,
    },
    {
      key: "arrival",
      header: "Arrival",
      align: "right",
      className: "w-32",
      render: (p) => <span className="text-muted">{formatDate(p.arrivalDate)}</span>,
    },
  ];

  return (
    <>
      <PageHeader title="Payouts" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <MetricCard
          label="Payout schedule"
          value={
            account.config.payoutSchedule.charAt(0).toUpperCase() +
            account.config.payoutSchedule.slice(1)
          }
          hint={`${account.config.payoutDelayDays}-day settlement`}
          exportId="payout-schedule"
        />
        <MetricCard
          label="In transit"
          value={formatCurrency(balances.inTransit, currency)}
          exportId="in-transit"
        />
        <MetricCard
          label="Paid out to date"
          value={formatCurrency(balances.totalPaidOut, currency)}
          exportId="paid-out"
        />
      </div>
      <div className="mt-6">
        <DataTable columns={columns} rows={rows} onRowClick={setSelected} />
      </div>
      <PayoutDrawer payout={selected} onOpenChange={() => setSelected(null)} />
    </>
  );
}
