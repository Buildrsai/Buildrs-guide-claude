"use client";

import { cn } from "@/lib/utils";

/** Card wrapping a chart with title + meta line, Overview-style. */
export function ChartCard({
  title,
  value,
  meta,
  children,
  className,
  exportId,
}: {
  title: string;
  value?: string;
  meta?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  exportId?: string;
}) {
  return (
    <div
      data-export-target={exportId ?? title}
      className={cn(
        "rounded-lg border border-border bg-white p-4 shadow-card",
        className,
      )}
    >
      <div className="mb-3 flex items-baseline justify-between">
        <div>
          <h3 className="label-md text-secondary">{title}</h3>
          {value && (
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="headline-md text-secondary tabular">{value}</span>
              {meta}
            </div>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
