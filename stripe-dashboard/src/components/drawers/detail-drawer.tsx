"use client";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function DetailDrawer({
  open,
  onOpenChange,
  title,
  subtitle,
  headline,
  badge,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  headline?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent data-testid="detail-drawer">
        <div className="border-b border-border px-6 py-5">
          <SheetTitle className="label-sm text-muted uppercase tracking-wide">
            {title}
          </SheetTitle>
          <div className="mt-1 flex items-center gap-3">
            {headline && (
              <span className="headline-lg text-secondary tabular">{headline}</span>
            )}
            {badge}
          </div>
          {subtitle && <p className="caption mt-1 text-muted">{subtitle}</p>}
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

export function KV({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="caption shrink-0 text-muted">{label}</span>
      <span
        className={cn(
          "text-right text-[13.5px] text-secondary",
          mono && "font-mono text-[12.5px]",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function DrawerSection({
  title,
  children,
  actions,
}: {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <div className="mb-2 flex items-center justify-between border-b border-border pb-1.5">
        <h4 className="label-md text-secondary">{title}</h4>
        {actions}
      </div>
      {children}
    </section>
  );
}
