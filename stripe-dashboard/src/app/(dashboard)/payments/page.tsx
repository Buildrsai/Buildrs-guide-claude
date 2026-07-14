"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store/app-store";
import { useRange } from "@/lib/store/use-derived";
import { inRange } from "@/lib/selectors/range";
import { formatCurrency, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { PeriodPicker } from "@/components/shared/period-picker";
import { DataTable, type Column } from "@/components/shared/data-table";
import {
  CountFilterBoxes,
  FilterChips,
  TableSearch,
} from "@/components/shared/filter-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { PaymentDrawer } from "@/components/drawers/payment-drawer";
import type { Payment } from "@/lib/schemas";

type Tab = "all" | "succeeded" | "refunded" | "disputed" | "failed";

export default function PaymentsPage() {
  const dataset = useAppStore((s) => s.dataset);
  const range = useRange();
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Payment | null>(null);

  const customerById = useMemo(
    () => new Map(dataset?.customers.map((c) => [c.id, c]) ?? []),
    [dataset],
  );
  const refundedIds = useMemo(
    () => new Set(dataset?.refunds.map((r) => r.paymentId) ?? []),
    [dataset],
  );
  const disputedIds = useMemo(
    () => new Set(dataset?.disputes.map((d) => d.paymentId) ?? []),
    [dataset],
  );

  const rows = useMemo(() => {
    if (!dataset || !range) return [];
    const q = query.trim().toLowerCase();
    return dataset.payments
      .filter((p) => inRange(p.createdAt, range))
      .filter((p) => {
        switch (tab) {
          case "succeeded":
            return p.status === "succeeded" && !refundedIds.has(p.id);
          case "refunded":
            return refundedIds.has(p.id);
          case "disputed":
            return disputedIds.has(p.id);
          case "failed":
            return p.status === "failed";
          default:
            return true;
        }
      })
      .filter((p) => {
        if (!q) return true;
        const customer = customerById.get(p.customerId);
        return (
          p.description.toLowerCase().includes(q) ||
          p.id.includes(q) ||
          (customer?.name.toLowerCase().includes(q) ?? false) ||
          (customer?.email.toLowerCase().includes(q) ?? false) ||
          String(p.amount / 100).startsWith(q)
        );
      })
      .slice()
      .reverse();
  }, [dataset, range, tab, query, customerById, refundedIds, disputedIds]);

  const counts = useMemo(() => {
    if (!dataset || !range) return { all: 0, succeeded: 0, refunded: 0, disputed: 0, failed: 0 };
    const inR = dataset.payments.filter((p) => inRange(p.createdAt, range));
    return {
      all: inR.length,
      succeeded: inR.filter((p) => p.status === "succeeded" && !refundedIds.has(p.id)).length,
      refunded: inR.filter((p) => refundedIds.has(p.id)).length,
      disputed: inR.filter((p) => disputedIds.has(p.id)).length,
      failed: inR.filter((p) => p.status === "failed").length,
    };
  }, [dataset, range, refundedIds, disputedIds]);

  const columns: Column<Payment>[] = [
    {
      key: "amount",
      header: "Amount",
      className: "w-32",
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
      render: (p) => (
        <StatusBadge
          status={
            disputedIds.has(p.id)
              ? "disputed"
              : refundedIds.has(p.id)
                ? "refunded"
                : p.status
          }
        />
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (p) => <span className="text-muted">{p.description}</span>,
    },
    {
      key: "customer",
      header: "Customer",
      render: (p) => customerById.get(p.customerId)?.email ?? "—",
    },
    {
      key: "method",
      header: "Payment method",
      className: "w-40",
      render: (p) =>
        `${p.paymentMethod.type.replaceAll("_", " ")}${
          p.paymentMethod.last4 ? ` •••• ${p.paymentMethod.last4}` : ""
        }`,
    },
    {
      key: "date",
      header: "Date",
      align: "right",
      className: "w-32",
      render: (p) => <span className="text-muted">{formatDate(p.createdAt)}</span>,
    },
  ];

  return (
    <>
      <PageHeader
        title="Payments"
        actions={
          <>
            <TableSearch value={query} onChange={setQuery} />
            <PeriodPicker />
          </>
        }
      />
      <CountFilterBoxes
        tabs={[
          { id: "all", label: "All", count: counts.all },
          { id: "succeeded", label: "Succeeded", count: counts.succeeded },
          { id: "refunded", label: "Refunded", count: counts.refunded },
          { id: "disputed", label: "Disputed", count: counts.disputed },
          { id: "failed", label: "Failed", count: counts.failed },
        ]}
        active={tab}
        onChange={(id) => setTab(id as Tab)}
      />
      <div className="mt-3">
        <FilterChips
          labels={[
            "Date and time",
            "Amount",
            "Currency",
            "Status",
            "Payment method",
            "More filters",
          ]}
        />
      </div>
      <div className="mt-3">
        <DataTable columns={columns} rows={rows} onRowClick={setSelected} />
      </div>
      <PaymentDrawer payment={selected} onOpenChange={() => setSelected(null)} />
    </>
  );
}
