"use client";

import { Calendar, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppStore } from "@/lib/store/app-store";
import type { RangePresetId } from "@/lib/selectors/range";

const LABELS: Record<RangePresetId, string> = {
  "7d": "Last 7 days",
  "30d": "Last 4 weeks",
  "90d": "Last 3 months",
  all: "All time",
};

export function PeriodPicker() {
  const preset = useAppStore((s) => s.rangePreset);
  const setPreset = useAppStore((s) => s.setRangePreset);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-8 cursor-pointer items-center gap-1.5 rounded-sm border border-border bg-white px-2.5 text-[13.5px] text-secondary shadow-card transition-colors hover:border-primary-70">
        <Calendar className="h-3.5 w-3.5 text-muted" />
        {LABELS[preset]}
        <ChevronDown className="h-3.5 w-3.5 text-muted" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {(Object.keys(LABELS) as RangePresetId[]).map((id) => (
          <DropdownMenuItem key={id} onSelect={() => setPreset(id)}>
            {LABELS[id]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
