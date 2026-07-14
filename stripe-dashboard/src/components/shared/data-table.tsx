"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  align?: "left" | "right";
  render: (row: T) => React.ReactNode;
}

const PAGE_SIZE = 20;

/**
 * Dense Stripe-style table: sticky header, hoverable rows, row click opens
 * the detail drawer, footer pagination.
 */
export function DataTable<T extends { id: string }>({
  columns,
  rows,
  onRowClick,
  emptyLabel = "No results found",
  className,
}: {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  emptyLabel?: string;
  className?: string;
}) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = useMemo(
    () => rows.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE),
    [rows, safePage],
  );

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[14px]" data-testid="data-table">
          <thead>
            <tr className="border-b border-border">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    "label-sm sticky top-0 bg-white px-2 py-2 text-left font-medium text-muted first:pl-1 last:pr-1",
                    c.align === "right" && "text-right",
                    c.className,
                  )}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "border-b border-border/60 transition-colors",
                  onRowClick && "cursor-pointer hover:bg-canvas",
                )}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={cn(
                      "h-10 whitespace-nowrap px-2 py-1.5 align-middle text-secondary first:pl-1 last:pr-1",
                      c.align === "right" && "text-right tabular",
                      c.className,
                    )}
                  >
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 text-center caption text-muted"
                >
                  {emptyLabel}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between pt-3">
        <span className="caption text-muted tabular">
          {rows.length.toLocaleString("en-US")} result
          {rows.length === 1 ? "" : "s"}
        </span>
        {pageCount > 1 && (
          <div className="flex items-center gap-2">
            <span className="caption text-muted tabular">
              Page {safePage + 1} of {pageCount.toLocaleString("en-US")}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={safePage === 0}
              onClick={() => setPage(safePage - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage(safePage + 1)}
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
