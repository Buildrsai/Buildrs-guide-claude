"use client";

import Link from "next/link";
import { ArrowRight, SlidersHorizontal } from "lucide-react";
import { useActiveAccount } from "@/lib/store/app-store";
import { getPreset } from "@/lib/engine/presets";
import { PageHeader } from "@/components/shared/page-header";
import { KV } from "@/components/drawers/detail-drawer";

export default function SettingsPage() {
  const account = useActiveAccount();
  if (!account) return null;
  const preset = account.presetId ? getPreset(account.presetId) : undefined;

  return (
    <>
      <PageHeader title="Settings" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-white p-4 shadow-card">
          <h3 className="label-md mb-2 text-secondary">Business profile</h3>
          <KV label="Business name" value={account.name} />
          <KV label="Business type" value={account.businessType.toUpperCase()} />
          <KV label="Country" value={account.country} />
          <KV
            label="Default currency"
            value={account.config.currency.toUpperCase()}
          />
          <KV label="Account ID" value={account.id} mono />
        </div>
        <div className="rounded-lg border border-border bg-white p-4 shadow-card">
          <h3 className="label-md mb-2 text-secondary">Payouts</h3>
          <KV
            label="Schedule"
            value={
              account.config.payoutSchedule.charAt(0).toUpperCase() +
              account.config.payoutSchedule.slice(1)
            }
          />
          <KV
            label="Settlement delay"
            value={`${account.config.payoutDelayDays} days`}
          />
          <KV
            label="Processing fees"
            value={`${account.config.feePercent}% + ${(account.config.feeFixed / 100).toFixed(2)}`}
          />
        </div>
        <div className="rounded-lg border border-border bg-white p-4 shadow-card">
          <h3 className="label-md mb-2 text-secondary">Scenario</h3>
          <KV label="Preset" value={preset?.name ?? "Custom"} />
          <KV label="Seed" value={account.seed} mono />
          <KV label="Simulated today" value={account.config.periodEnd} />
          <Link
            href="/admin"
            className="label-md mt-3 inline-flex items-center gap-1.5 text-primary hover:text-primary-60"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Open the data studio
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="rounded-lg border border-accent/40 bg-accent-tint p-4">
          <h3 className="label-md mb-2 text-[#b45309]">Simulation notice</h3>
          <p className="text-[13.5px] leading-5 text-[#7a4a10]">
            Every number, customer and transaction in this dashboard is
            synthetically generated. The “SIMULATION — DONNÉES FICTIVES”
            watermark appears on every page and is burnt into every export —
            it cannot be disabled.
          </p>
        </div>
      </div>
    </>
  );
}
