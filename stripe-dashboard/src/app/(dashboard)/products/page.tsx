"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store/app-store";
import { formatCurrency, formatNumber } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { PlanDrawer } from "@/components/drawers/entity-drawers";
import type { Plan } from "@/lib/schemas";

interface ProductRow {
  id: string;
  name: string;
  description: string;
  plan?: Plan;
  activeSubs: number;
  revenue: number;
}

export default function ProductsPage() {
  const dataset = useAppStore((s) => s.dataset);
  const [selected, setSelected] = useState<Plan | null>(null);

  const rows = useMemo<ProductRow[]>(() => {
    if (!dataset) return [];
    const planByProduct = new Map(dataset.plans.map((p) => [p.productId, p]));
    const activeByPlan = new Map<string, number>();
    for (const s of dataset.subscriptions) {
      if (s.status === "canceled") continue;
      activeByPlan.set(s.planId, (activeByPlan.get(s.planId) ?? 0) + 1);
    }
    const revenueByDescription = new Map<string, number>();
    for (const p of dataset.payments) {
      if (p.status !== "succeeded") continue;
      revenueByDescription.set(
        p.description,
        (revenueByDescription.get(p.description) ?? 0) + p.amount,
      );
    }
    return dataset.products.map((product) => {
      const plan = planByProduct.get(product.id);
      const subRevenue = dataset.payments
        .filter(
          (p) =>
            p.status === "succeeded" &&
            p.subscriptionId &&
            p.description.includes(product.name),
        )
        .reduce((s, p) => s + p.amount, 0);
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        plan,
        activeSubs: plan ? (activeByPlan.get(plan.id) ?? 0) : 0,
        revenue: plan
          ? subRevenue
          : (revenueByDescription.get(product.name) ?? 0),
      };
    });
  }, [dataset]);

  const currency = dataset?.payments[0]?.currency ?? "eur";

  const columns: Column<ProductRow>[] = [
    {
      key: "name",
      header: "Name",
      render: (r) => <span className="font-medium text-secondary">{r.name}</span>,
    },
    {
      key: "description",
      header: "Description",
      render: (r) => <span className="text-muted">{r.description}</span>,
    },
    {
      key: "price",
      header: "Price",
      align: "right",
      className: "w-36",
      render: (r) =>
        r.plan ? (
          <span className="tabular">
            {formatCurrency(r.plan.amount, r.plan.currency)}/{r.plan.interval}
          </span>
        ) : (
          <span className="text-muted">One-time</span>
        ),
    },
    {
      key: "subs",
      header: "Active subscriptions",
      align: "right",
      className: "w-40",
      render: (r) =>
        r.plan ? (
          <span className="tabular">{formatNumber(r.activeSubs)}</span>
        ) : (
          <span className="text-muted">—</span>
        ),
    },
    {
      key: "revenue",
      header: "Revenue (all time)",
      align: "right",
      className: "w-40",
      render: (r) => (
        <span className="tabular">{formatCurrency(r.revenue, currency)}</span>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Product catalog" />
      <DataTable
        columns={columns}
        rows={rows}
        onRowClick={(r) => r.plan && setSelected(r.plan)}
      />
      <PlanDrawer plan={selected} onOpenChange={() => setSelected(null)} />
    </>
  );
}
