import type { Account, ScenarioConfig } from "@/lib/schemas";
import { hashSeed } from "./prng";

/** The simulated "today" used when creating accounts (fixed for determinism in tests). */
export const DEFAULT_PERIOD_END = "2026-07-14";

export type PresetId =
  | "saas-10k-mrr"
  | "saas-50k-mrr"
  | "saas-100k-mrr"
  | "saas-high-growth"
  | "saas-declining"
  | "launch-7-days"
  | "refund-heavy-month"
  | "failed-payment-incident"
  | "ecommerce-high-volume"
  | "agency-irregular";

export interface Preset {
  id: PresetId;
  name: string;
  accountName: string;
  description: string;
  businessType: Account["businessType"];
  country: string;
  config: ScenarioConfig;
}

const EU_COUNTRIES = [
  { code: "FR", weightPct: 38 },
  { code: "US", weightPct: 18 },
  { code: "DE", weightPct: 12 },
  { code: "GB", weightPct: 10 },
  { code: "ES", weightPct: 8 },
  { code: "IT", weightPct: 6 },
  { code: "NL", weightPct: 5 },
  { code: "BE", weightPct: 3 },
];

const SAAS_METHODS = [
  { type: "card" as const, weightPct: 72 },
  { type: "sepa_debit" as const, weightPct: 12 },
  { type: "link" as const, weightPct: 8 },
  { type: "apple_pay" as const, weightPct: 5 },
  { type: "google_pay" as const, weightPct: 3 },
];

const ECOM_METHODS = [
  { type: "card" as const, weightPct: 56 },
  { type: "apple_pay" as const, weightPct: 16 },
  { type: "paypal" as const, weightPct: 12 },
  { type: "google_pay" as const, weightPct: 8 },
  { type: "link" as const, weightPct: 8 },
];

function saasPlans(scale: number) {
  return [
    { name: "Starter", amount: 2900 * scale, interval: "month" as const, weightPct: 55 },
    { name: "Pro", amount: 7900 * scale, interval: "month" as const, weightPct: 33 },
    { name: "Scale", amount: 19900 * scale, interval: "month" as const, weightPct: 9 },
    { name: "Pro (annual)", amount: 79000 * scale, interval: "year" as const, weightPct: 3 },
  ];
}

const BASE: Omit<ScenarioConfig, "monthlyRevenueTarget" | "mrrTarget" | "customerCount"> = {
  currency: "eur",
  periodEnd: DEFAULT_PERIOD_END,
  periodMonths: 3,
  avgOrderValue: 4900,
  growthRatePctMonthly: 4,
  churnRatePctMonthly: 3,
  refundRatePct: 1.2,
  failureRatePct: 4,
  feePercent: 2.9,
  feeFixed: 30,
  payoutDelayDays: 7,
  payoutSchedule: "daily",
  seasonality: { weekendDipPct: 35, monthlyAmplitudePct: 8 },
  planDistribution: saasPlans(1),
  countries: EU_COUNTRIES,
  paymentMethods: SAAS_METHODS,
  txFrequency: "medium",
  overlays: [],
};

export const PRESETS: Preset[] = [
  {
    id: "saas-10k-mrr",
    name: "SaaS — 10K MRR",
    accountName: "Northwind Labs",
    description: "Early-stage SaaS around €10K MRR with steady growth.",
    businessType: "saas",
    country: "FR",
    config: {
      ...BASE,
      monthlyRevenueTarget: 1_080_000,
      mrrTarget: 1_000_000,
      customerCount: 340,
    },
  },
  {
    id: "saas-50k-mrr",
    name: "SaaS — 50K MRR",
    accountName: "Corely",
    description: "Growing SaaS at €50K MRR, healthy retention.",
    businessType: "saas",
    country: "FR",
    config: {
      ...BASE,
      monthlyRevenueTarget: 5_400_000,
      mrrTarget: 5_000_000,
      customerCount: 1_450,
      growthRatePctMonthly: 6,
      churnRatePctMonthly: 2.6,
    },
  },
  {
    id: "saas-100k-mrr",
    name: "SaaS — 100K MRR",
    accountName: "Statmix",
    description: "Scale-up SaaS at €100K MRR with enterprise plans.",
    businessType: "saas",
    country: "FR",
    config: {
      ...BASE,
      monthlyRevenueTarget: 10_800_000,
      mrrTarget: 10_000_000,
      customerCount: 2_700,
      growthRatePctMonthly: 5,
      churnRatePctMonthly: 2.2,
      planDistribution: saasPlans(2),
    },
  },
  {
    id: "saas-high-growth",
    name: "SaaS — high growth",
    accountName: "Skyloop",
    description: "Hypergrowth SaaS, +22% MoM, noisy but climbing fast.",
    businessType: "saas",
    country: "US",
    config: {
      ...BASE,
      currency: "usd",
      monthlyRevenueTarget: 3_300_000,
      mrrTarget: 3_000_000,
      customerCount: 980,
      growthRatePctMonthly: 22,
      churnRatePctMonthly: 4.5,
      failureRatePct: 5,
    },
  },
  {
    id: "saas-declining",
    name: "SaaS — declining",
    accountName: "Fadeout Systems",
    description: "SaaS losing steam: −9% MoM and rising churn.",
    businessType: "saas",
    country: "FR",
    config: {
      ...BASE,
      monthlyRevenueTarget: 2_900_000,
      mrrTarget: 2_800_000,
      customerCount: 860,
      growthRatePctMonthly: -9,
      churnRatePctMonthly: 7.5,
      refundRatePct: 1.8,
    },
  },
  {
    id: "launch-7-days",
    name: "Launch — 7 days",
    accountName: "Dropdate",
    description: "A one-month-old product with a 7-day launch spike.",
    businessType: "saas",
    country: "FR",
    config: {
      ...BASE,
      periodMonths: 1,
      monthlyRevenueTarget: 2_400_000,
      mrrTarget: 350_000,
      customerCount: 620,
      avgOrderValue: 14_900,
      growthRatePctMonthly: 30,
      txFrequency: "high",
      overlays: [
        {
          id: "ovl_launch_1",
          type: "launch_spike",
          startDate: "2026-07-08",
          days: 7,
          multiplier: 6,
        },
      ],
    },
  },
  {
    id: "refund-heavy-month",
    name: "Refund-heavy month",
    accountName: "Refundo Corp",
    description: "A €25K MRR SaaS hit by a three-week refund wave.",
    businessType: "saas",
    country: "FR",
    config: {
      ...BASE,
      monthlyRevenueTarget: 2_700_000,
      mrrTarget: 2_500_000,
      customerCount: 750,
      refundRatePct: 2.5,
      overlays: [
        {
          id: "ovl_refund_1",
          type: "refund_wave",
          startDate: "2026-06-24",
          days: 21,
          multiplier: 6,
        },
      ],
    },
  },
  {
    id: "failed-payment-incident",
    name: "Failed payment incident",
    accountName: "Uptimely",
    description: "A €30K MRR SaaS with a 5-day payment failure incident.",
    businessType: "saas",
    country: "FR",
    config: {
      ...BASE,
      monthlyRevenueTarget: 3_200_000,
      mrrTarget: 3_000_000,
      customerCount: 900,
      overlays: [
        {
          id: "ovl_failure_1",
          type: "failure_incident",
          startDate: "2026-07-06",
          days: 5,
          multiplier: 8,
        },
      ],
    },
  },
  {
    id: "ecommerce-high-volume",
    name: "E-commerce — high volume",
    accountName: "Maison Verne",
    description: "High-volume e-commerce store, thousands of small orders.",
    businessType: "ecommerce",
    country: "FR",
    config: {
      ...BASE,
      monthlyRevenueTarget: 38_000_000,
      mrrTarget: 0,
      customerCount: 22_000,
      avgOrderValue: 6_800,
      growthRatePctMonthly: 3,
      churnRatePctMonthly: 0,
      refundRatePct: 3.5,
      failureRatePct: 6,
      payoutDelayDays: 3,
      seasonality: { weekendDipPct: 10, monthlyAmplitudePct: 12 },
      planDistribution: [],
      paymentMethods: ECOM_METHODS,
      txFrequency: "high",
    },
  },
  {
    id: "agency-irregular",
    name: "Agency — irregular payments",
    accountName: "Studio Meridian",
    description: "An agency with a handful of large, irregular invoices.",
    businessType: "agency",
    country: "FR",
    config: {
      ...BASE,
      monthlyRevenueTarget: 7_500_000,
      mrrTarget: 0,
      customerCount: 26,
      avgOrderValue: 380_000,
      growthRatePctMonthly: 1,
      churnRatePctMonthly: 0,
      refundRatePct: 0.4,
      failureRatePct: 2,
      payoutSchedule: "weekly",
      seasonality: { weekendDipPct: 80, monthlyAmplitudePct: 30 },
      planDistribution: [],
      txFrequency: "low",
    },
  },
];

export function getPreset(id: string): Preset | undefined {
  return PRESETS.find((p) => p.id === id);
}

/** Deterministic default seed for a preset account. */
export function presetSeed(presetId: string): number {
  return hashSeed(`preset:${presetId}`);
}
