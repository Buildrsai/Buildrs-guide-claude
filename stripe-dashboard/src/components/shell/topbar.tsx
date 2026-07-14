"use client";

import Link from "next/link";
import { Bell, HelpCircle, Search, SlidersHorizontal } from "lucide-react";
import { useActiveAccount } from "@/lib/store/app-store";
import { ExportMenu } from "@/components/export/export-menu";
import { SearchCommand } from "./search-command";
import { useState } from "react";

function TestModeBadge() {
  return (
    <span
      data-testid="test-mode-badge"
      className="inline-flex items-center gap-1.5 rounded-full bg-accent-tint px-2.5 py-1 text-[12px] font-medium text-[#b45309]"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      Simulation
    </span>
  );
}

export function Topbar() {
  const account = useActiveAccount();
  const [searchOpen, setSearchOpen] = useState(false);
  return (
    <header
      data-testid="topbar"
      className="flex h-[52px] shrink-0 items-center gap-3 border-b border-border bg-white px-4"
    >
      <button
        onClick={() => setSearchOpen(true)}
        className="flex h-8 w-full max-w-md cursor-pointer items-center gap-2 rounded-full border border-border bg-canvas px-3 text-[13.5px] text-muted transition-colors hover:border-primary-70"
      >
        <Search className="h-3.5 w-3.5" />
        Search
        <kbd className="ml-auto rounded-sm border border-border bg-white px-1.5 text-[11px] text-muted">
          ⌘K
        </kbd>
      </button>
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
      <div className="ml-auto flex items-center gap-2">
        <TestModeBadge />
        <ExportMenu />
        <Link
          href="/admin"
          data-testid="admin-link"
          className="flex h-8 items-center gap-1.5 rounded-sm px-2.5 text-[13.5px] text-secondary transition-colors hover:bg-muted-tint"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted" />
          Data studio
        </Link>
        <button className="cursor-pointer rounded-sm p-1.5 text-muted transition-colors hover:bg-muted-tint hover:text-secondary">
          <HelpCircle className="h-4 w-4" />
        </button>
        <button className="cursor-pointer rounded-sm p-1.5 text-muted transition-colors hover:bg-muted-tint hover:text-secondary">
          <Bell className="h-4 w-4" />
        </button>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-[12px] font-semibold text-white">
          {account?.name.charAt(0).toUpperCase() ?? "S"}
        </span>
      </div>
    </header>
  );
}
