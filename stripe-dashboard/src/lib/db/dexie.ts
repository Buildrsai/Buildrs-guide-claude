"use client";

import Dexie, { type EntityTable } from "dexie";
import type { Account, Dataset } from "@/lib/schemas";

interface AppStateRow {
  key: string;
  value: string;
}

/**
 * Client-only persistence. One dataset record per account so regenerate
 * and edits are atomic swaps. Never import this module from server code.
 */
export const db = new Dexie("stripe-sim") as Dexie & {
  accounts: EntityTable<Account, "id">;
  datasets: EntityTable<Dataset, "accountId">;
  appState: EntityTable<AppStateRow, "key">;
};

db.version(1).stores({
  accounts: "id",
  datasets: "accountId",
  appState: "key",
});
