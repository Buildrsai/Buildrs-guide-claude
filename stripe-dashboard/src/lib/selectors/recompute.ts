import type { Dataset, ScenarioConfig } from "@/lib/schemas";
import { deriveBalanceAndPayouts } from "@/lib/engine/payouts";

/**
 * Rebuilds every derived artifact (balance ledger + payouts) from the
 * source-of-truth entities. Called after ANY manual edit so totals, charts,
 * balances, fees and payouts can never drift from the transactions.
 * Runs the exact same derivation code as the generator.
 */
export function rebuildDerived(
  dataset: Dataset,
  config: ScenarioConfig,
): Dataset {
  const { balanceTransactions, payouts } = deriveBalanceAndPayouts(
    {
      payments: dataset.payments,
      refunds: dataset.refunds,
      disputes: dataset.disputes,
    },
    config,
    dataset.seed,
  );
  return { ...dataset, balanceTransactions, payouts };
}
