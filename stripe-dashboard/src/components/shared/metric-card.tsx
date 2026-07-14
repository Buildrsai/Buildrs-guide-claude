"use client";

import { cn } from "@/lib/utils";
import { DeltaPill } from "./delta-pill";

/**
 * Overview-style metric block: label, big value, delta vs previous period.
 * `data-export-target` lets the export menu capture a single card.
 */
export function MetricCard({
  label,
  value,
  deltaPct,
  invertDelta,
  hint,
  children,
  className,
  exportId,
}: {
  label: string;
  value: string;
  deltaPct?: number | null;
  invertDelta?: boolean;
  hint?: string;
  children?: React.ReactNode;
  className?: string;
  exportId?: string;
}) {
  return (
    <div
      data-export-target={exportId ?? label}
      className={cn(
        "group rounded-lg border border-border bg-white p-4 shadow-card transition-shadow hover:shadow-menu/50",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="label-md text-muted">{label}</span>
        {deltaPct !== undefined && (
          <DeltaPill deltaPct={deltaPct} invert={invertDelta} />
        )}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="headline-md font-normal text-secondary tabular">
          {value}
        </span>
        {hint && <span className="caption text-muted">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
