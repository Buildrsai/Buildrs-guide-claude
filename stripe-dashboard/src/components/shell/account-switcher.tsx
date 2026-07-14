"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useActiveAccount, useAppStore } from "@/lib/store/app-store";
import { PRESETS, type PresetId } from "@/lib/engine/presets";
import { MAX_ACCOUNTS } from "@/lib/db/repository";
import { cn } from "@/lib/utils";

/** Stripe-style organization switcher (top-left of the sidebar). */
export function AccountSwitcher() {
  const accounts = useAppStore((s) => s.accounts);
  const switchAccount = useAppStore((s) => s.switchAccount);
  const createAccountFromPreset = useAppStore((s) => s.createAccountFromPreset);
  const active = useActiveAccount();
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [presetId, setPresetId] = useState<PresetId>("saas-10k-mrr");
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  if (!active) return null;

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          data-testid="account-switcher"
          className="flex w-full cursor-pointer items-center gap-2 rounded-md p-1.5 transition-colors hover:bg-muted-tint"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-[13px] font-semibold text-white">
            {active.name.charAt(0).toUpperCase()}
          </span>
          <span className="flex-1 truncate text-left text-[14px] font-medium text-secondary">
            {active.name}
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted" />
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="label-sm px-2.5 py-1.5 text-muted">Accounts</div>
          <div className="max-h-72 overflow-y-auto">
            {accounts.map((account) => (
              <button
                key={account.id}
                data-testid={`account-option-${account.id}`}
                onClick={() => {
                  void switchAccount(account.id);
                  setOpen(false);
                }}
                className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-left transition-colors hover:bg-muted-tint"
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-md text-[12px] font-semibold text-white",
                    account.id === active.id ? "bg-primary" : "bg-secondary/70",
                  )}
                >
                  {account.name.charAt(0).toUpperCase()}
                </span>
                <span className="flex-1 truncate text-[13.5px] text-secondary">
                  {account.name}
                </span>
                {account.id === active.id && (
                  <Check className="h-3.5 w-3.5 text-primary" />
                )}
              </button>
            ))}
          </div>
          <div className="my-1 h-px bg-border" />
          <button
            onClick={() => {
              setOpen(false);
              setCreateOpen(true);
            }}
            disabled={accounts.length >= MAX_ACCOUNTS}
            className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-[13.5px] text-primary transition-colors hover:bg-muted-tint disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            New account
            <span className="ml-auto caption text-muted tabular">
              {accounts.length}/{MAX_ACCOUNTS}
            </span>
          </button>
        </PopoverContent>
      </Popover>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogTitle>Create an account</DialogTitle>
          <DialogDescription>
            Pick a scenario preset — every account gets its own generated data.
          </DialogDescription>
          <div className="mt-4 flex flex-col gap-3">
            <div>
              <Label htmlFor="acct-name">Account name</Label>
              <Input
                id="acct-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={PRESETS.find((p) => p.id === presetId)?.accountName}
              />
            </div>
            <div>
              <Label>Scenario preset</Label>
              <div className="grid max-h-64 grid-cols-1 gap-1.5 overflow-y-auto">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setPresetId(preset.id)}
                    className={cn(
                      "cursor-pointer rounded-md border p-2.5 text-left transition-colors",
                      presetId === preset.id
                        ? "border-primary bg-primary-tint"
                        : "border-border hover:border-primary-70",
                    )}
                  >
                    <div className="label-md text-secondary">{preset.name}</div>
                    <div className="caption text-muted">{preset.description}</div>
                  </button>
                ))}
              </div>
            </div>
            <Button
              variant="primary"
              disabled={creating}
              onClick={async () => {
                setCreating(true);
                try {
                  await createAccountFromPreset(presetId, name || undefined);
                  setCreateOpen(false);
                  setName("");
                } finally {
                  setCreating(false);
                }
              }}
            >
              {creating ? "Generating…" : "Create account"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
