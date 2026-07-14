import { cn } from "@/lib/utils";

export type BadgeTone = "success" | "error" | "warning" | "neutral" | "info";

const TONES: Record<BadgeTone, string> = {
  success: "bg-success-tint text-[#3f6212]",
  error: "bg-error-tint text-error",
  warning: "bg-accent-tint text-[#b45309]",
  neutral: "bg-muted-tint text-muted",
  info: "bg-primary-tint text-primary",
};

const STATUS_TONE: Record<string, BadgeTone> = {
  succeeded: "success",
  paid: "success",
  active: "success",
  won: "success",
  available: "success",
  failed: "error",
  lost: "error",
  canceled: "neutral",
  refunded: "info",
  pending: "neutral",
  in_transit: "info",
  trialing: "info",
  past_due: "warning",
  needs_response: "warning",
  under_review: "warning",
  disputed: "warning",
};

export function statusLabel(status: string): string {
  return status.replaceAll("_", " ").replace(/^./, (c) => c.toUpperCase());
}

export function StatusBadge({
  status,
  tone,
  className,
}: {
  status: string;
  tone?: BadgeTone;
  className?: string;
}) {
  const resolved = tone ?? STATUS_TONE[status] ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-1.5 py-0.5 text-[12px] font-medium leading-4",
        TONES[resolved],
        className,
      )}
    >
      {statusLabel(status)}
    </span>
  );
}
