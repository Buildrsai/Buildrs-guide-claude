import type { Account } from "@/lib/schemas";
import { getPreset, presetSeed, type PresetId } from "@/lib/engine/presets";

export function accountFromPreset(presetId: PresetId): Account {
  const preset = getPreset(presetId);
  if (!preset) throw new Error(`unknown preset ${presetId}`);
  const seed = presetSeed(presetId);
  return {
    id: `acct_test_${presetId}`,
    name: preset.accountName,
    businessType: preset.businessType,
    country: preset.country,
    seed,
    initialSeed: seed,
    presetId: preset.id,
    config: preset.config,
    createdAt: preset.config.periodEnd,
  };
}
