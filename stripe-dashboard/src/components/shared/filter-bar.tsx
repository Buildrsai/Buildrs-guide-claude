"use client";

import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Boxed status filters with big counts — the pattern used on the real
 * Stripe Transactions page ("All 71 | Succeeded 53 | …").
 */
export function CountFilterBoxes({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string; count: number }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "min-w-28 shrink-0 cursor-pointer rounded-lg border px-3.5 py-2.5 text-left transition-colors",
            active === t.id
              ? "border-primary ring-1 ring-primary"
              : "border-border hover:border-primary-70",
          )}
        >
          <span
            className={cn(
              "label-md block",
              active === t.id ? "text-primary" : "text-secondary",
            )}
          >
            {t.label}
          </span>
          <span
            className={cn(
              "block text-[16px] font-semibold tabular",
              active === t.id ? "text-primary" : "text-secondary",
            )}
          >
            {t.count.toLocaleString("en-US")}
          </span>
        </button>
      ))}
    </div>
  );
}

/** Decorative dashed filter chips row (Date and time, Amount, …). */
export function FilterChips({ labels }: { labels: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {labels.map((label) => (
        <button
          key={label}
          className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-[12.5px] text-muted transition-colors hover:border-primary-70 hover:text-secondary"
        >
          <Plus className="h-3 w-3" />
          {label}
        </button>
      ))}
    </div>
  );
}

/** Status filter tabs + free-text search, Stripe list-page style. */
export function FilterTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 border-b border-border">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "relative -mb-px cursor-pointer px-3 py-2 text-[14px] transition-colors",
            active === t.id
              ? "border-b-2 border-primary font-medium text-primary"
              : "text-muted hover:text-secondary",
          )}
        >
          {t.label}
          {t.count !== undefined && (
            <span className="ml-1.5 caption text-muted tabular">{t.count.toLocaleString("en-US")}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export function TableSearch({
  value,
  onChange,
  placeholder = "Filter by name, email, amount…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative w-72">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 w-full rounded-sm border border-border bg-white pl-8 pr-2.5 text-[13.5px] shadow-card placeholder:text-muted/70 focus:border-primary-60 focus:outline-2 focus:outline-offset-0 focus:outline-primary-70/40"
      />
    </div>
  );
}
