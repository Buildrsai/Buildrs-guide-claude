"use client";

import type { Account, Dataset } from "@/lib/schemas";
import { generateDataset } from "@/lib/engine/generate";
import { getPreset, presetSeed, PRESETS, type PresetId } from "@/lib/engine/presets";
import { Rng } from "@/lib/engine/prng";
import { db } from "./dexie";

const ACTIVE_ACCOUNT_KEY = "activeAccountId";
const INITIAL_PRESETS: PresetId[] = ["saas-10k-mrr", "ecommerce-high-volume"];
export const MAX_ACCOUNTS = 10;

export function buildAccountFromPreset(
  presetId: PresetId,
  opts?: { name?: string; seed?: number },
): Account {
  const preset = getPreset(presetId);
  if (!preset) throw new Error(`Unknown preset: ${presetId}`);
  const seed = opts?.seed ?? presetSeed(presetId);
  return {
    id: new Rng(`acct:${presetId}:${seed}`).id("acct", 16),
    name: opts?.name ?? preset.accountName,
    businessType: preset.businessType,
    country: preset.country,
    seed,
    initialSeed: seed,
    presetId,
    config: preset.config,
    createdAt: preset.config.periodEnd,
  };
}

/** First-run bootstrap: seed the two initial accounts and their datasets. */
export async function seedInitialAccountsIfEmpty(): Promise<void> {
  const count = await db.accounts.count();
  if (count > 0) return;
  for (const presetId of INITIAL_PRESETS) {
    const account = buildAccountFromPreset(presetId);
    const dataset = generateDataset(account);
    await db.accounts.put(account);
    await db.datasets.put(dataset);
  }
  const first = await db.accounts.toCollection().first();
  if (first) await setActiveAccountId(first.id);
}

export async function loadAccounts(): Promise<Account[]> {
  const accounts = await db.accounts.toArray();
  return accounts.sort((a, b) => a.name.localeCompare(b.name));
}

export async function loadDataset(accountId: string): Promise<Dataset | undefined> {
  return db.datasets.get(accountId);
}

export async function saveAccount(account: Account): Promise<void> {
  await db.accounts.put(account);
}

export async function saveDataset(dataset: Dataset): Promise<void> {
  await db.datasets.put(dataset);
}

export async function deleteAccount(accountId: string): Promise<void> {
  await db.datasets.delete(accountId);
  await db.accounts.delete(accountId);
}

export async function getActiveAccountId(): Promise<string | undefined> {
  const row = await db.appState.get(ACTIVE_ACCOUNT_KEY);
  return row?.value;
}

export async function setActiveAccountId(accountId: string): Promise<void> {
  await db.appState.put({ key: ACTIVE_ACCOUNT_KEY, value: accountId });
}

export { PRESETS };
