"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store/app-store";

/**
 * Client bootstrap gate: seeds the initial accounts on first run, loads
 * IndexedDB state, and holds children behind a skeleton until ready so
 * static prerender and hydration never touch Dexie.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  const status = useAppStore((s) => s.status);
  const bootstrap = useAppStore((s) => s.bootstrap);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  if (status !== "ready") {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
          <p className="caption text-muted">Loading simulation…</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
