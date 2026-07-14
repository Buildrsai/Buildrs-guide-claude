"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { CreditCard, Search, User } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useActiveAccount, useAppStore } from "@/lib/store/app-store";
import { formatCurrency, formatDate } from "@/lib/format";

/** ⌘K palette searching the active dataset (customers + payments). */
export function SearchCommand({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const dataset = useAppStore((s) => s.dataset);
  const account = useActiveAccount();
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const results = useMemo(() => {
    if (!dataset || query.trim().length < 2) {
      return { customers: [], payments: [] };
    }
    const q = query.toLowerCase();
    return {
      customers: dataset.customers
        .filter(
          (c) =>
            c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
        )
        .slice(0, 5),
      payments: dataset.payments
        .filter(
          (p) =>
            p.id.includes(q) ||
            p.description.toLowerCase().includes(q) ||
            String(p.amount / 100).startsWith(q),
        )
        .slice(0, 5),
    };
  }, [dataset, query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[20%] max-w-xl -translate-y-0 p-0">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <Command shouldFilter={false} label="Search">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Search className="h-4 w-4 text-muted" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search customers, payments…"
              className="w-full bg-transparent text-[14px] outline-none placeholder:text-muted/70"
            />
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            {query.trim().length >= 2 &&
              results.customers.length === 0 &&
              results.payments.length === 0 && (
                <div className="py-8 text-center caption text-muted">
                  No results for “{query}”
                </div>
              )}
            {results.customers.length > 0 && (
              <Command.Group
                heading={
                  <span className="label-sm px-2 text-muted">Customers</span>
                }
              >
                {results.customers.map((c) => (
                  <Command.Item
                    key={c.id}
                    onSelect={() => {
                      onOpenChange(false);
                      router.push("/customers");
                    }}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-[13.5px] text-secondary data-[selected=true]:bg-muted-tint"
                  >
                    <User className="h-3.5 w-3.5 text-muted" />
                    {c.name}
                    <span className="caption text-muted">{c.email}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
            {results.payments.length > 0 && account && (
              <Command.Group
                heading={<span className="label-sm px-2 text-muted">Payments</span>}
              >
                {results.payments.map((p) => (
                  <Command.Item
                    key={p.id}
                    onSelect={() => {
                      onOpenChange(false);
                      router.push("/payments");
                    }}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-[13.5px] text-secondary data-[selected=true]:bg-muted-tint"
                  >
                    <CreditCard className="h-3.5 w-3.5 text-muted" />
                    <span className="tabular">
                      {formatCurrency(p.amount, p.currency)}
                    </span>
                    <span className="truncate caption text-muted">
                      {p.description}
                    </span>
                    <span className="ml-auto caption text-muted">
                      {formatDate(p.createdAt)}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
