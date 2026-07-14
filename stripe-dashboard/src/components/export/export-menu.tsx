"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Clapperboard, Download, Image as ImageIcon, MonitorPlay } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useActiveAccount } from "@/lib/store/app-store";
import {
  exportCard,
  exportFullPage,
  exportYouTubeFrame,
} from "@/lib/export/export-image";
import { findExportTargets, type PixelRatio } from "@/lib/export/capture";

export function ExportMenu() {
  const account = useActiveAccount();
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const pageName = pathname.split("/").filter(Boolean).pop() ?? "page";

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };

  const name = account?.name ?? "simulation";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-testid="export-menu"
        className="flex h-8 cursor-pointer items-center gap-1.5 rounded-sm border border-border bg-white px-2.5 text-[13.5px] text-secondary shadow-card transition-colors hover:border-primary-70 disabled:opacity-50"
        disabled={busy}
      >
        <Download className="h-3.5 w-3.5 text-muted" />
        {busy ? "Exporting…" : "Export"}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60">
        <DropdownMenuLabel>Full page — PNG</DropdownMenuLabel>
        {([1, 2, 4] as PixelRatio[]).map((ratio) => (
          <DropdownMenuItem
            key={ratio}
            data-testid={`export-png-${ratio}x`}
            onSelect={() => void run(() => exportFullPage(name, pageName, ratio))}
          >
            <ImageIcon className="h-3.5 w-3.5 text-muted" />
            PNG {ratio}x
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Cards on this page</DropdownMenuLabel>
        <div className="max-h-44 overflow-y-auto">
          {findExportTargets()
            .slice(0, 12)
            .map(({ id, el }, i) => (
              <DropdownMenuItem
                key={`${id}-${i}`}
                onSelect={() => void run(() => exportCard(el, name, id))}
              >
                <ImageIcon className="h-3.5 w-3.5 text-muted" />
                <span className="truncate">{id}</span>
              </DropdownMenuItem>
            ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          data-testid="export-youtube"
          onSelect={() => void run(() => exportYouTubeFrame(name, pageName))}
        >
          <Clapperboard className="h-3.5 w-3.5 text-muted" />
          16:9 frame (1920×1080)
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/present")}>
          <MonitorPlay className="h-3.5 w-3.5 text-muted" />
          Presentation mode
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
