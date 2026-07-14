import { cn } from "@/lib/utils";

/** Percentage change vs the previous period, Stripe-style. */
export function DeltaPill({
  deltaPct,
  invert = false,
  className,
}: {
  deltaPct: number | null;
  /** set for metrics where an increase is bad (refunds, failures, churn) */
  invert?: boolean;
  className?: string;
}) {
  if (deltaPct === null || !Number.isFinite(deltaPct)) {
    return <span className={cn("label-sm text-muted", className)}>—</span>;
  }
  const positive = deltaPct >= 0;
  const good = invert ? !positive : positive;
  return (
    <span
      className={cn(
        "label-sm inline-flex items-center gap-0.5 tabular",
        good ? "text-[#3f6212]" : "text-error",
        className,
      )}
    >
      {positive ? "+" : ""}
      {deltaPct.toFixed(1)}%
    </span>
  );
}
