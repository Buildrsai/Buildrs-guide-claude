"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

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
