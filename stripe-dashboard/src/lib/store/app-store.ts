"use client";

import { create } from "zustand";
import type { Account, Dataset, ScenarioConfig } from "@/lib/schemas";
import { generateDataset } from "@/lib/engine/generate";
import {
  applyScenarioAction,
  type ScenarioActionType,
} from "@/lib/engine/actions";
import type { PresetId } from "@/lib/engine/presets";
import type { RangePresetId } from "@/lib/selectors/range";
import * as repo from "@/lib/db/repository";
import { applyEntityEdit, type EditableEntity } from "./edit-actions";

interface AppStore {
  status: "idle" | "loading" | "ready";
  accounts: Account[];
  activeAccountId: string | null;
  dataset: Dataset | null;
  isGenerating: boolean;
  rangePreset: RangePresetId;

  bootstrap: () => Promise<void>;
  switchAccount: (id: string) => Promise<void>;
  createAccountFromPreset: (presetId: PresetId, name?: string) => Promise<Account>;
  removeAccount: (id: string) => Promise<void>;
  renameAccount: (id: string, name: string) => Promise<void>;
  updateConfig: (patch: Partial<ScenarioConfig>) => Promise<void>;
  setSeed: (seed: number) => Promise<void>;
  runAction: (action: ScenarioActionType) => Promise<void>;
  applyEdit: (
    entity: EditableEntity,
    id: string,
    patch: Record<string, unknown>,
  ) => Promise<void>;
  setRangePreset: (preset: RangePresetId) => void;
}

function activeAccount(state: Pick<AppStore, "accounts" | "activeAccountId">) {
  return state.accounts.find((a) => a.id === state.activeAccountId) ?? null;
}

export const useAppStore = create<AppStore>((set, get) => ({
  status: "idle",
  accounts: [],
  activeAccountId: null,
  dataset: null,
  isGenerating: false,
  rangePreset: "30d",

  bootstrap: async () => {
    if (get().status !== "idle") return;
    set({ status: "loading" });
    await repo.seedInitialAccountsIfEmpty();
    const accounts = await repo.loadAccounts();
    const savedId = await repo.getActiveAccountId();
    const active =
      accounts.find((a) => a.id === savedId) ?? accounts[0] ?? null;
    const dataset = active ? ((await repo.loadDataset(active.id)) ?? null) : null;
    set({
      status: "ready",
      accounts,
      activeAccountId: active?.id ?? null,
      dataset,
    });
  },

  switchAccount: async (id) => {
    if (id === get().activeAccountId) return;
    const dataset = (await repo.loadDataset(id)) ?? null;
    await repo.setActiveAccountId(id);
    set({ activeAccountId: id, dataset });
  },

  createAccountFromPreset: async (presetId, name) => {
    const { accounts } = get();
    if (accounts.length >= repo.MAX_ACCOUNTS) {
      throw new Error(`Limit of ${repo.MAX_ACCOUNTS} accounts reached`);
    }
    const account = repo.buildAccountFromPreset(presetId, {
      name,
      // vary the seed with the number of accounts so two accounts created
      // from the same preset don't collide
      seed:
        repo.buildAccountFromPreset(presetId).seed +
        accounts.filter((a) => a.presetId === presetId).length,
    });
    const dataset = generateDataset(account);
    await repo.saveAccount(account);
    await repo.saveDataset(dataset);
    await repo.setActiveAccountId(account.id);
    set({
      accounts: [...accounts, account].sort((a, b) => a.name.localeCompare(b.name)),
      activeAccountId: account.id,
      dataset,
    });
    return account;
  },

  removeAccount: async (id) => {
    const { accounts, activeAccountId } = get();
    if (accounts.length <= 1) return;
    await repo.deleteAccount(id);
    const remaining = accounts.filter((a) => a.id !== id);
    let nextActive = activeAccountId;
    let dataset = get().dataset;
    if (activeAccountId === id) {
      nextActive = remaining[0].id;
      dataset = (await repo.loadDataset(nextActive)) ?? null;
      await repo.setActiveAccountId(nextActive);
    }
    set({ accounts: remaining, activeAccountId: nextActive, dataset });
  },

  renameAccount: async (id, name) => {
    const accounts = get().accounts.map((a) =>
      a.id === id ? { ...a, name } : a,
    );
    const account = accounts.find((a) => a.id === id);
    if (account) await repo.saveAccount(account);
    set({ accounts });
  },

  updateConfig: async (patch) => {
    const account = activeAccount(get());
    if (!account) return;
    const updated: Account = {
      ...account,
      config: { ...account.config, ...patch },
    };
    set({ isGenerating: true });
    try {
      const dataset = generateDataset(updated);
      await repo.saveAccount(updated);
      await repo.saveDataset(dataset);
      set({
        accounts: get().accounts.map((a) => (a.id === updated.id ? updated : a)),
        dataset,
      });
    } finally {
      set({ isGenerating: false });
    }
  },

  setSeed: async (seed) => {
    const account = activeAccount(get());
    if (!account) return;
    const updated: Account = { ...account, seed };
    set({ isGenerating: true });
    try {
      const dataset = generateDataset(updated);
      await repo.saveAccount(updated);
      await repo.saveDataset(dataset);
      set({
        accounts: get().accounts.map((a) => (a.id === updated.id ? updated : a)),
        dataset,
      });
    } finally {
      set({ isGenerating: false });
    }
  },

  runAction: async (action) => {
    const account = activeAccount(get());
    if (!account) return;
    const { config, seed } = applyScenarioAction(account, action);
    const updated: Account = { ...account, config, seed };
    set({ isGenerating: true });
    try {
      const dataset = generateDataset(updated);
      await repo.saveAccount(updated);
      await repo.saveDataset(dataset);
      set({
        accounts: get().accounts.map((a) => (a.id === updated.id ? updated : a)),
        dataset,
      });
    } finally {
      set({ isGenerating: false });
    }
  },

  applyEdit: async (entity, id, patch) => {
    const { dataset } = get();
    const account = activeAccount(get());
    if (!dataset || !account) return;
    const next = applyEntityEdit(dataset, account.config, entity, id, patch);
    set({ dataset: next });
    await repo.saveDataset(next);
  },

  setRangePreset: (preset) => set({ rangePreset: preset }),
}));

export function useActiveAccount(): Account | null {
  return useAppStore((s) => s.accounts.find((a) => a.id === s.activeAccountId) ?? null);
}
