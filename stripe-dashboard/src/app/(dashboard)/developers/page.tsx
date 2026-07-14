"use client";

import { useMemo, useState } from "react";
import { Copy, Eye, EyeOff } from "lucide-react";
import { useActiveAccount, useAppStore } from "@/lib/store/app-store";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";

export default function DevelopersPage() {
  const account = useActiveAccount();
  const dataset = useAppStore((s) => s.dataset);
  const [revealed, setRevealed] = useState(false);

  const events = useMemo(() => {
    if (!dataset) return [];
    const paymentEvents = dataset.payments.slice(-14).map((p) => ({
      id: `evt_${p.id.slice(3)}`,
      type: p.status === "succeeded" ? "payment_intent.succeeded" : "payment_intent.payment_failed",
      date: p.createdAt,
      ok: p.status === "succeeded",
    }));
    const refundEvents = dataset.refunds.slice(-4).map((r) => ({
      id: `evt_${r.id.slice(3)}`,
      type: "charge.refunded",
      date: r.createdAt,
      ok: true,
    }));
    return [...paymentEvents, ...refundEvents]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 15);
  }, [dataset]);

  if (!account) return null;
  const suffix = account.id.slice(-12);
  const publishable = `pk_sim_${suffix}9hFz2LqTb0Ku4Rw8`;
  const secret = `sk_sim_${suffix}Xm3Vd7NpAc5Je1Yt`;

  return (
    <>
      <PageHeader title="Developers">
        <p className="caption mt-1 text-muted">
          API version 2026-06-30 · These keys are decorative — nothing here is
          real.
        </p>
      </PageHeader>

      <div
        data-export-target="api-keys"
        className="rounded-lg border border-border bg-white p-4 shadow-card"
      >
        <h3 className="label-md mb-3 text-secondary">API keys</h3>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
            <div>
              <div className="caption text-muted">Publishable key</div>
              <code className="font-mono text-[12.5px] text-secondary">
                {publishable}
              </code>
            </div>
            <Button size="sm" variant="ghost">
              <Copy className="h-3.5 w-3.5" /> Copy
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
            <div>
              <div className="caption text-muted">Secret key</div>
              <code className="font-mono text-[12.5px] text-secondary">
                {revealed ? secret : `sk_sim_••••••••••••••••••••••••`}
              </code>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setRevealed(!revealed)}>
              {revealed ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
              {revealed ? "Hide" : "Reveal"}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-border bg-white p-4 shadow-card">
        <h3 className="label-md mb-3 text-secondary">Webhook events</h3>
        <table className="w-full text-[13.5px]">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="label-sm pb-2 font-medium text-muted">Event</th>
              <th className="label-sm pb-2 font-medium text-muted">ID</th>
              <th className="label-sm pb-2 font-medium text-muted">Status</th>
              <th className="label-sm pb-2 text-right font-medium text-muted">Date</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-b border-border/60 last:border-0">
                <td className="py-2 font-mono text-[12px] text-secondary">{e.type}</td>
                <td className="py-2 font-mono text-[12px] text-muted">{e.id}</td>
                <td className="py-2">
                  <StatusBadge status={e.ok ? "succeeded" : "failed"} />
                </td>
                <td className="py-2 text-right caption text-muted">
                  {formatDate(e.date)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
