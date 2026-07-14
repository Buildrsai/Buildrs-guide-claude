"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store/app-store";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { TableSearch } from "@/components/shared/filter-bar";
import { CustomerDrawer } from "@/components/drawers/entity-drawers";
import type { Customer } from "@/lib/schemas";

export default function CustomersPage() {
  const dataset = useAppStore((s) => s.dataset);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);

  const spendById = useMemo(() => {
    const map = new Map<string, { spend: number; count: number }>();
    if (!dataset) return map;
    for (const p of dataset.payments) {
      if (p.status !== "succeeded") continue;
      const cur = map.get(p.customerId) ?? { spend: 0, count: 0 };
      cur.spend += p.amount;
      cur.count += 1;
      map.set(p.customerId, cur);
    }
    return map;
  }, [dataset]);

  const rows = useMemo(() => {
    if (!dataset) return [];
    const q = query.trim().toLowerCase();
    return dataset.customers
      .filter(
        (c) =>
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.country.toLowerCase() === q,
      )
      .slice()
      .reverse();
  }, [dataset, query]);

  const currency = dataset?.payments[0]?.currency ?? "eur";

  const columns: Column<Customer>[] = [
    {
      key: "name",
      header: "Name",
      render: (c) => <span className="font-medium text-secondary">{c.name}</span>,
    },
    {
      key: "email",
      header: "Email",
      render: (c) => <span className="text-muted">{c.email}</span>,
    },
    {
      key: "method",
      header: "Default payment method",
      className: "w-48",
      render: (c) =>
        `${c.paymentMethod.type.replaceAll("_", " ")}${
          c.paymentMethod.last4 ? ` •••• ${c.paymentMethod.last4}` : ""
        }`,
    },
    {
      key: "country",
      header: "Country",
      className: "w-20",
      render: (c) => c.country,
    },
    {
      key: "spend",
      header: "Total spend",
      align: "right",
      className: "w-32",
      render: (c) => (
        <span className="tabular">
          {formatCurrency(spendById.get(c.id)?.spend ?? 0, currency)}
        </span>
      ),
    },
    {
      key: "payments",
      header: "Payments",
      align: "right",
      className: "w-24",
      render: (c) => (
        <span className="text-muted tabular">
          {formatNumber(spendById.get(c.id)?.count ?? 0)}
        </span>
      ),
    },
    {
      key: "created",
      header: "Created",
      align: "right",
      className: "w-32",
      render: (c) => <span className="text-muted">{formatDate(c.createdAt)}</span>,
    },
  ];

  return (
    <>
      <PageHeader
        title="Customers"
        actions={<TableSearch value={query} onChange={setQuery} placeholder="Filter by name, email, country…" />}
      />
      <DataTable columns={columns} rows={rows} onRowClick={setSelected} />
      <CustomerDrawer customer={selected} onOpenChange={() => setSelected(null)} />
    </>
  );
}
