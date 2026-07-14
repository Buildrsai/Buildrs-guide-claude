"use client";

import { useMemo, useState } from "react";
import { useActiveAccount, useAppStore } from "@/lib/store/app-store";
import { useRange, useTotals } from "@/lib/store/use-derived";
import { inRange } from "@/lib/selectors/range";
import { compare } from "@/lib/selectors/series";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { PeriodPicker } from "@/components/shared/period-picker";
import { MetricCard } from "@/components/shared/metric-card";
import { DataTable, type Column } from "@/components/shared/data-table";
import { RefundDrawer } from "@/components/drawers/entity-drawers";
import type { Refund } from "@/lib/schemas";

export default function RefundsPage() {
  const account = useActiveAccount();
  const dataset = useAppStore((s) => s.dataset);
  const totals = useTotals();
  const range = useRange();
  const [selected, setSelected] = useState<Refund | null>(null);

  const paymentById = useMemo(
    () => new Map(dataset?.payments.map((p) => [p.id, p]) ?? []),
    [dataset],
  );
  const customerById = useMemo(
    () => new Map(dataset?.customers.map((c) => [c.id, c]) ?? []),
    [dataset],
  );

  const rows = useMemo(() => {
    if (!dataset || !range) return [];
    return dataset.refunds
      .filter((r) => inRange(r.createdAt, range))
      .slice()
      .reverse();
  }, [dataset, range]);

  if (!account || !totals) return null;
  const currency = account.config.currency;

  const columns: Column<Refund>[] = [
    {
      key: "amount",
      header: "Amount",
      className: "w-32",
      render: (r) => (
        <span className="font-medium text-error tabular">
          −{formatCurrency(r.amount, currency)}
        </span>
      ),
    },
    {
      key: "reason",
      header: "Reason",
      className: "w-48",
      render: (r) => <span className="capitalize">{r.reason.replaceAll("_", " ")}</span>,
    },
    {
      key: "customer",
      header: "Customer",
      render: (r) => {
        const payment = paymentById.get(r.paymentId);
        return payment
          ? (customerById.get(payment.customerId)?.email ?? "—")
          : "—";
      },
    },
    {
      key: "payment",
      header: "Original payment",
      align: "right",
      className: "w-40",
      render: (r) => {
        const payment = paymentById.get(r.paymentId);
        return payment ? (
          <span className="tabular text-muted">
            {formatCurrency(payment.amount, payment.currency)}
          </span>
        ) : (
          "—"
        );
      },
    },
    {
      key: "date",
      header: "Date",
      align: "right",
      className: "w-32",
      render: (r) => <span className="text-muted">{formatDate(r.createdAt)}</span>,
    },
  ];

  return (
    <>
      <PageHeader title="Refunds" actions={<PeriodPicker />} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <MetricCard
          label="Refunded"
          value={formatCurrency(totals.current.refundTotal, currency)}
          deltaPct={
            compare(totals.current.refundTotal, totals.previous.refundTotal)
              .deltaPct
          }
          invertDelta
          exportId="refunded-total"
        />
        <MetricCard
          label="Refund count"
          value={formatNumber(totals.current.refundCount)}
          exportId="refund-count"
        />
        <MetricCard
          label="Refund rate"
          value={`${(
            (totals.current.refundCount /
              Math.max(1, totals.current.succeededCount)) *
            100
          ).toFixed(1)}%`}
          hint="of succeeded payments"
          exportId="refund-rate"
        />
      </div>
      <div className="mt-6">
        <DataTable columns={columns} rows={rows} onRowClick={setSelected} />
      </div>
      <RefundDrawer refund={selected} onOpenChange={() => setSelected(null)} />
    </>
  );
}
