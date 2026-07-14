"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Dices,
  Flame,
  Plus,
  RefreshCcw,
  RotateCcw,
  Trash2,
  TrendingDown,
  TrendingUp,
  Undo2,
  Zap,
} from "lucide-react";
import { useActiveAccount, useAppStore } from "@/lib/store/app-store";
import { PRESETS, type PresetId } from "@/lib/engine/presets";
import type { ScenarioActionType } from "@/lib/engine/actions";
import {
  ScenarioConfigSchema,
  type ScenarioConfig,
  type PaymentMethodType,
} from "@/lib/schemas";
import { MAX_ACCOUNTS } from "@/lib/db/repository";
import { Button } from "@/components/ui/button";
import { Input, Label, NativeSelect } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const ACTIONS: {
  id: ScenarioActionType;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: "generate_scenario", label: "Generate scenario", icon: Zap },
  { id: "regenerate_activity", label: "Regenerate activity", icon: Dices },
  { id: "simulate_growth", label: "Simulate growth", icon: TrendingUp },
  { id: "simulate_decline", label: "Simulate decline", icon: TrendingDown },
  { id: "add_launch_spike", label: "Add launch spike", icon: Flame },
  { id: "add_refund_wave", label: "Add refund wave", icon: Undo2 },
  {
    id: "add_failed_payment_incident",
    label: "Add failed payment incident",
    icon: RefreshCcw,
  },
  { id: "reset_scenario", label: "Reset scenario", icon: RotateCcw },
];

const METHOD_TYPES: PaymentMethodType[] = [
  "card",
  "sepa_debit",
  "link",
  "apple_pay",
  "google_pay",
  "paypal",
  "bank_transfer",
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-white p-4 shadow-card">
      <h3 className="label-md mb-3 text-secondary">{title}</h3>
      {children}
    </section>
  );
}

export default function AdminPage() {
  const account = useActiveAccount();
  const accounts = useAppStore((s) => s.accounts);
  const isGenerating = useAppStore((s) => s.isGenerating);
  const switchAccount = useAppStore((s) => s.switchAccount);
  const removeAccount = useAppStore((s) => s.removeAccount);
  const renameAccount = useAppStore((s) => s.renameAccount);
  const createAccountFromPreset = useAppStore((s) => s.createAccountFromPreset);
  const updateConfig = useAppStore((s) => s.updateConfig);
  const setSeed = useAppStore((s) => s.setSeed);
  const runAction = useAppStore((s) => s.runAction);

  const [draft, setDraft] = useState<ScenarioConfig | null>(null);
  const [seedDraft, setSeedDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    if (account) {
      setDraft(structuredClone(account.config));
      setSeedDraft(String(account.seed));
      setError(null);
    }
  }, [account]);

  const dirty = useMemo(
    () =>
      account && draft
        ? JSON.stringify(draft) !== JSON.stringify(account.config)
        : false,
    [account, draft],
  );

  if (!account || !draft) return null;

  const num = (v: string) => (v === "" ? 0 : Number(v));
  const money = (minor: number) => (minor / 100).toString();
  const toMinor = (v: string) => Math.round(num(v) * 100);

  const apply = async () => {
    const parsed = ScenarioConfigSchema.safeParse(draft);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid configuration");
      return;
    }
    setError(null);
    await updateConfig(parsed.data);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  };

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="headline-lg text-secondary">Data studio</h1>
            <span className="rounded-full bg-accent-tint px-2.5 py-1 text-[12px] font-medium text-[#b45309]">
              Admin — simulation control
            </span>
          </div>
          <p className="caption mt-1 text-muted">
            Configure the scenario; every metric on the dashboard is derived
            from the data generated here.
          </p>
        </div>
        <Link
          href="/overview"
          className="label-md inline-flex items-center gap-1.5 text-primary hover:text-primary-60"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        {/* Accounts column */}
        <div className="flex flex-col gap-4">
          <Section title={`Accounts (${accounts.length}/${MAX_ACCOUNTS})`}>
            <div className="flex flex-col gap-1.5">
              {accounts.map((a) => (
                <div
                  key={a.id}
                  className={cn(
                    "flex items-center gap-2 rounded-md border p-2 transition-colors",
                    a.id === account.id
                      ? "border-primary bg-primary-tint"
                      : "border-border hover:border-primary-70",
                  )}
                >
                  <button
                    className="flex flex-1 cursor-pointer items-center gap-2 text-left"
                    onClick={() => void switchAccount(a.id)}
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-secondary/80 text-[11px] font-semibold text-white">
                      {a.name.charAt(0)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13.5px] font-medium text-secondary">
                        {a.name}
                      </span>
                      <span className="caption block text-muted">
                        {PRESETS.find((p) => p.id === a.presetId)?.name ?? "Custom"}
                      </span>
                    </span>
                  </button>
                  {a.id === account.id && (
                    <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                  )}
                  {accounts.length > 1 && (
                    <button
                      title="Delete account"
                      className="cursor-pointer rounded-sm p-1 text-muted transition-colors hover:bg-error-tint hover:text-error"
                      onClick={() => void removeAccount(a.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3">
              <Label>Rename active account</Label>
              <Input
                value={account.name}
                onChange={(e) => void renameAccount(account.id, e.target.value)}
              />
            </div>
          </Section>

          <Section title="Create from preset">
            <div className="flex max-h-[340px] flex-col gap-1.5 overflow-y-auto">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  disabled={accounts.length >= MAX_ACCOUNTS || isGenerating}
                  onClick={() =>
                    void createAccountFromPreset(preset.id as PresetId)
                  }
                  className="cursor-pointer rounded-md border border-border p-2 text-left transition-colors hover:border-primary-70 disabled:opacity-50"
                >
                  <span className="flex items-center gap-1.5 text-[13px] font-medium text-secondary">
                    <Plus className="h-3 w-3 text-primary" />
                    {preset.name}
                  </span>
                  <span className="caption block text-muted">
                    {preset.description}
                  </span>
                </button>
              ))}
            </div>
          </Section>
        </div>

        {/* Config column */}
        <div className="flex flex-col gap-4">
          <Section title="Scenario actions">
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              {ACTIONS.map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  variant="secondary"
                  disabled={isGenerating}
                  data-testid={`action-${id}`}
                  onClick={() => void runAction(id)}
                  className="justify-start"
                >
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  <span className="truncate">{label}</span>
                </Button>
              ))}
            </div>
            <div className="mt-3 flex items-end gap-2">
              <div className="w-48">
                <Label>Seed (deterministic)</Label>
                <Input
                  data-testid="seed-input"
                  value={seedDraft}
                  onChange={(e) => setSeedDraft(e.target.value)}
                />
              </div>
              <Button
                variant="secondary"
                disabled={isGenerating || Number(seedDraft) === account.seed}
                onClick={() => void setSeed(Number(seedDraft) >>> 0)}
              >
                Apply seed
              </Button>
              <p className="caption pb-1.5 text-muted">
                Same seed + same config → identical data, always.
              </p>
            </div>
            {account.config.overlays.length > 0 && (
              <div className="mt-3">
                <Label>Active overlays</Label>
                <div className="flex flex-wrap gap-1.5">
                  {account.config.overlays.map((o) => (
                    <span
                      key={o.id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary-tint px-2.5 py-1 text-[12px] text-primary"
                    >
                      {o.type.replaceAll("_", " ")} ×{o.multiplier} ·{" "}
                      {o.startDate} +{o.days}d
                      <button
                        className="cursor-pointer hover:text-error"
                        onClick={() =>
                          void updateConfig({
                            overlays: account.config.overlays.filter(
                              (x) => x.id !== o.id,
                            ),
                          })
                        }
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Section>

          <Section title="Business & period">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div>
                <Label>Currency</Label>
                <NativeSelect
                  value={draft.currency}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      currency: e.target.value as ScenarioConfig["currency"],
                    })
                  }
                >
                  <option value="eur">EUR</option>
                  <option value="usd">USD</option>
                  <option value="gbp">GBP</option>
                </NativeSelect>
              </div>
              <div>
                <Label>Simulated today</Label>
                <Input
                  type="date"
                  value={draft.periodEnd}
                  onChange={(e) => setDraft({ ...draft, periodEnd: e.target.value })}
                />
              </div>
              <div>
                <Label>History (months)</Label>
                <Input
                  type="number"
                  min={1}
                  max={24}
                  value={draft.periodMonths}
                  onChange={(e) =>
                    setDraft({ ...draft, periodMonths: num(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label>Transaction frequency</Label>
                <NativeSelect
                  value={draft.txFrequency}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      txFrequency: e.target.value as ScenarioConfig["txFrequency"],
                    })
                  }
                >
                  <option value="low">Low — few, large</option>
                  <option value="medium">Medium</option>
                  <option value="high">High — many, small</option>
                </NativeSelect>
              </div>
            </div>
          </Section>

          <Section title="Revenue targets">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div>
                <Label>Monthly revenue</Label>
                <Input
                  type="number"
                  min={0}
                  value={money(draft.monthlyRevenueTarget)}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      monthlyRevenueTarget: toMinor(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label>MRR target (0 = no subs)</Label>
                <Input
                  type="number"
                  min={0}
                  value={money(draft.mrrTarget)}
                  onChange={(e) =>
                    setDraft({ ...draft, mrrTarget: toMinor(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label>Customers</Label>
                <Input
                  type="number"
                  min={1}
                  value={draft.customerCount}
                  onChange={(e) =>
                    setDraft({ ...draft, customerCount: num(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label>Average order value</Label>
                <Input
                  type="number"
                  min={0.5}
                  step="0.5"
                  value={money(draft.avgOrderValue)}
                  onChange={(e) =>
                    setDraft({ ...draft, avgOrderValue: toMinor(e.target.value) })
                  }
                />
              </div>
            </div>
          </Section>

          <Section title="Dynamics (% )">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {(
                [
                  ["Growth / month", "growthRatePctMonthly", -80, 400],
                  ["Churn / month", "churnRatePctMonthly", 0, 80],
                  ["Refund rate", "refundRatePct", 0, 100],
                  ["Failure rate", "failureRatePct", 0, 90],
                ] as const
              ).map(([label, key, min, max]) => (
                <div key={key}>
                  <Label>{label}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min={min}
                    max={max}
                    value={draft[key]}
                    onChange={(e) => setDraft({ ...draft, [key]: num(e.target.value) })}
                  />
                </div>
              ))}
            </div>
          </Section>

          <Section title="Fees, payouts & seasonality">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div>
                <Label>Fee %</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={draft.feePercent}
                  onChange={(e) => setDraft({ ...draft, feePercent: num(e.target.value) })}
                />
              </div>
              <div>
                <Label>Fee fixed</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={money(draft.feeFixed)}
                  onChange={(e) => setDraft({ ...draft, feeFixed: toMinor(e.target.value) })}
                />
              </div>
              <div>
                <Label>Payout delay (days)</Label>
                <Input
                  type="number"
                  min={0}
                  max={30}
                  value={draft.payoutDelayDays}
                  onChange={(e) =>
                    setDraft({ ...draft, payoutDelayDays: num(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label>Payout schedule</Label>
                <NativeSelect
                  value={draft.payoutSchedule}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      payoutSchedule: e.target
                        .value as ScenarioConfig["payoutSchedule"],
                    })
                  }
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </NativeSelect>
              </div>
              <div>
                <Label>Week-end dip %</Label>
                <Input
                  type="number"
                  min={0}
                  max={90}
                  value={draft.seasonality.weekendDipPct}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      seasonality: {
                        ...draft.seasonality,
                        weekendDipPct: num(e.target.value),
                      },
                    })
                  }
                />
              </div>
              <div>
                <Label>Monthly amplitude %</Label>
                <Input
                  type="number"
                  min={0}
                  max={90}
                  value={draft.seasonality.monthlyAmplitudePct}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      seasonality: {
                        ...draft.seasonality,
                        monthlyAmplitudePct: num(e.target.value),
                      },
                    })
                  }
                />
              </div>
            </div>
          </Section>

          <Section title="Plan distribution">
            <div className="flex flex-col gap-2">
              {draft.planDistribution.map((plan, i) => (
                <div key={i} className="grid grid-cols-[1fr_110px_110px_90px_32px] gap-2">
                  <Input
                    value={plan.name}
                    placeholder="Plan name"
                    onChange={(e) => {
                      const next = [...draft.planDistribution];
                      next[i] = { ...plan, name: e.target.value };
                      setDraft({ ...draft, planDistribution: next });
                    }}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    value={money(plan.amount)}
                    onChange={(e) => {
                      const next = [...draft.planDistribution];
                      next[i] = { ...plan, amount: toMinor(e.target.value) };
                      setDraft({ ...draft, planDistribution: next });
                    }}
                  />
                  <NativeSelect
                    value={plan.interval}
                    onChange={(e) => {
                      const next = [...draft.planDistribution];
                      next[i] = {
                        ...plan,
                        interval: e.target.value as "month" | "year",
                      };
                      setDraft({ ...draft, planDistribution: next });
                    }}
                  >
                    <option value="month">/month</option>
                    <option value="year">/year</option>
                  </NativeSelect>
                  <Input
                    type="number"
                    value={plan.weightPct}
                    title="Weight %"
                    onChange={(e) => {
                      const next = [...draft.planDistribution];
                      next[i] = { ...plan, weightPct: num(e.target.value) };
                      setDraft({ ...draft, planDistribution: next });
                    }}
                  />
                  <button
                    className="cursor-pointer rounded-sm text-muted hover:text-error"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        planDistribution: draft.planDistribution.filter(
                          (_, j) => j !== i,
                        ),
                      })
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <Button
                size="sm"
                variant="ghost"
                className="self-start"
                onClick={() =>
                  setDraft({
                    ...draft,
                    planDistribution: [
                      ...draft.planDistribution,
                      { name: "New plan", amount: 4900, interval: "month", weightPct: 10 },
                    ],
                  })
                }
              >
                <Plus className="h-3.5 w-3.5" /> Add plan
              </Button>
            </div>
          </Section>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Section title="Countries (weight %)">
              <div className="flex flex-col gap-2">
                {draft.countries.map((c, i) => (
                  <div key={i} className="grid grid-cols-[80px_1fr_32px] gap-2">
                    <Input
                      maxLength={2}
                      value={c.code}
                      onChange={(e) => {
                        const next = [...draft.countries];
                        next[i] = { ...c, code: e.target.value.toUpperCase() };
                        setDraft({ ...draft, countries: next });
                      }}
                    />
                    <Input
                      type="number"
                      value={c.weightPct}
                      onChange={(e) => {
                        const next = [...draft.countries];
                        next[i] = { ...c, weightPct: num(e.target.value) };
                        setDraft({ ...draft, countries: next });
                      }}
                    />
                    <button
                      className="cursor-pointer text-muted hover:text-error"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          countries: draft.countries.filter((_, j) => j !== i),
                        })
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="ghost"
                  className="self-start"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      countries: [...draft.countries, { code: "US", weightPct: 10 }],
                    })
                  }
                >
                  <Plus className="h-3.5 w-3.5" /> Add country
                </Button>
              </div>
            </Section>

            <Section title="Payment methods (weight %)">
              <div className="flex flex-col gap-2">
                {draft.paymentMethods.map((m, i) => (
                  <div key={i} className="grid grid-cols-[1fr_90px_32px] gap-2">
                    <NativeSelect
                      value={m.type}
                      onChange={(e) => {
                        const next = [...draft.paymentMethods];
                        next[i] = {
                          ...m,
                          type: e.target.value as PaymentMethodType,
                        };
                        setDraft({ ...draft, paymentMethods: next });
                      }}
                    >
                      {METHOD_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t.replaceAll("_", " ")}
                        </option>
                      ))}
                    </NativeSelect>
                    <Input
                      type="number"
                      value={m.weightPct}
                      onChange={(e) => {
                        const next = [...draft.paymentMethods];
                        next[i] = { ...m, weightPct: num(e.target.value) };
                        setDraft({ ...draft, paymentMethods: next });
                      }}
                    />
                    <button
                      className="cursor-pointer text-muted hover:text-error"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          paymentMethods: draft.paymentMethods.filter(
                            (_, j) => j !== i,
                          ),
                        })
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="ghost"
                  className="self-start"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      paymentMethods: [
                        ...draft.paymentMethods,
                        { type: "card", weightPct: 10 },
                      ],
                    })
                  }
                >
                  <Plus className="h-3.5 w-3.5" /> Add method
                </Button>
              </div>
            </Section>
          </div>

          <div className="sticky bottom-4 flex items-center gap-3 rounded-lg border border-border bg-white p-3 shadow-menu">
            <Button
              variant="primary"
              size="lg"
              disabled={!dirty || isGenerating}
              data-testid="apply-config"
              onClick={() => void apply()}
            >
              {isGenerating
                ? "Generating…"
                : savedFlash
                  ? "Regenerated ✓"
                  : "Apply & regenerate"}
            </Button>
            <Button
              variant="ghost"
              disabled={!dirty}
              onClick={() => setDraft(structuredClone(account.config))}
            >
              Discard changes
            </Button>
            {error && <span className="caption text-error">{error}</span>}
            {!error && dirty && (
              <span className="caption text-muted">
                Unsaved changes — applying regenerates the whole dataset.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
