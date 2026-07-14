import { z } from "zod";

/* ------------------------------------------------------------------ */
/* Scenario configuration                                              */
/* ------------------------------------------------------------------ */

export const CurrencySchema = z.enum(["usd", "eur", "gbp"]);
export type Currency = z.infer<typeof CurrencySchema>;

export const PaymentMethodTypeSchema = z.enum([
  "card",
  "sepa_debit",
  "link",
  "apple_pay",
  "google_pay",
  "paypal",
  "bank_transfer",
]);
export type PaymentMethodType = z.infer<typeof PaymentMethodTypeSchema>;

export const OverlayTypeSchema = z.enum([
  "launch_spike",
  "refund_wave",
  "failure_incident",
]);
export type OverlayType = z.infer<typeof OverlayTypeSchema>;

export const ScenarioOverlaySchema = z.object({
  id: z.string(),
  type: OverlayTypeSchema,
  /** ISO date, first day affected */
  startDate: z.string(),
  /** number of days affected */
  days: z.number().int().min(1).max(90),
  /** multiplier applied to the affected quantity (volume, refund rate, failure rate) */
  multiplier: z.number().min(1).max(50),
});
export type ScenarioOverlay = z.infer<typeof ScenarioOverlaySchema>;

export const PlanDistributionItemSchema = z.object({
  name: z.string().min(1),
  /** minor units (cents) per interval */
  amount: z.number().int().min(0),
  interval: z.enum(["month", "year"]),
  weightPct: z.number().min(0).max(100),
});
export type PlanDistributionItem = z.infer<typeof PlanDistributionItemSchema>;

export const CountryWeightSchema = z.object({
  code: z.string().length(2),
  weightPct: z.number().min(0).max(100),
});

export const PaymentMethodWeightSchema = z.object({
  type: PaymentMethodTypeSchema,
  weightPct: z.number().min(0).max(100),
});

export const ScenarioConfigSchema = z.object({
  currency: CurrencySchema,
  /** ISO date — the simulated "today". Fixed so datasets are reproducible. */
  periodEnd: z.string(),
  /** number of months of history to generate before periodEnd */
  periodMonths: z.number().int().min(1).max(24),
  /** total revenue target for the final month, minor units */
  monthlyRevenueTarget: z.number().int().min(0),
  /** subscription MRR target at periodEnd, minor units (0 = no subscriptions) */
  mrrTarget: z.number().int().min(0),
  /** total customers at periodEnd */
  customerCount: z.number().int().min(1).max(100_000),
  /** average one-off order value, minor units */
  avgOrderValue: z.number().int().min(50),
  /** compound monthly growth of activity, percent (negative = decline) */
  growthRatePctMonthly: z.number().min(-80).max(400),
  /** monthly subscription churn, percent */
  churnRatePctMonthly: z.number().min(0).max(80),
  /** share of succeeded payments that get refunded, percent */
  refundRatePct: z.number().min(0).max(100),
  /** share of attempted payments that fail, percent */
  failureRatePct: z.number().min(0).max(90),
  /** processing fee: percent part */
  feePercent: z.number().min(0).max(15),
  /** processing fee: fixed part, minor units */
  feeFixed: z.number().int().min(0),
  /** days before a charge becomes available for payout */
  payoutDelayDays: z.number().int().min(0).max(30),
  payoutSchedule: z.enum(["daily", "weekly", "monthly"]),
  seasonality: z.object({
    /** percent drop of volume on week-ends (0–90) */
    weekendDipPct: z.number().min(0).max(90),
    /** amplitude of the monthly sinusoid, percent (0 = flat) */
    monthlyAmplitudePct: z.number().min(0).max(90),
  }),
  planDistribution: z.array(PlanDistributionItemSchema),
  countries: z.array(CountryWeightSchema).min(1),
  paymentMethods: z.array(PaymentMethodWeightSchema).min(1),
  txFrequency: z.enum(["low", "medium", "high"]),
  overlays: z.array(ScenarioOverlaySchema),
});
export type ScenarioConfig = z.infer<typeof ScenarioConfigSchema>;

/* ------------------------------------------------------------------ */
/* Account                                                             */
/* ------------------------------------------------------------------ */

export const AccountSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  businessType: z.enum(["saas", "ecommerce", "agency"]),
  country: z.string().length(2),
  seed: z.number().int(),
  /** seed the account was created with, restored by "Reset scenario" */
  initialSeed: z.number().int(),
  presetId: z.string().optional(),
  config: ScenarioConfigSchema,
  createdAt: z.string(),
});
export type Account = z.infer<typeof AccountSchema>;

/* ------------------------------------------------------------------ */
/* Entities                                                            */
/* ------------------------------------------------------------------ */

export const CustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  country: z.string(),
  createdAt: z.string(),
  paymentMethod: z.object({
    type: PaymentMethodTypeSchema,
    brand: z.string().optional(),
    last4: z.string().optional(),
  }),
});
export type Customer = z.infer<typeof CustomerSchema>;

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
});
export type Product = z.infer<typeof ProductSchema>;

export const PlanSchema = z.object({
  id: z.string(),
  productId: z.string(),
  nickname: z.string(),
  amount: z.number().int(),
  currency: CurrencySchema,
  interval: z.enum(["month", "year"]),
});
export type Plan = z.infer<typeof PlanSchema>;

export const SubscriptionStatusSchema = z.enum([
  "active",
  "canceled",
  "past_due",
  "trialing",
]);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;

export const SubscriptionSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  planId: z.string(),
  status: SubscriptionStatusSchema,
  startDate: z.string(),
  canceledAt: z.string().optional(),
  currentPeriodEnd: z.string(),
});
export type Subscription = z.infer<typeof SubscriptionSchema>;

export const PaymentStatusSchema = z.enum(["succeeded", "failed"]);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const PaymentSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  subscriptionId: z.string().optional(),
  amount: z.number().int().min(0),
  currency: CurrencySchema,
  status: PaymentStatusSchema,
  failureCode: z.string().optional(),
  createdAt: z.string(),
  paymentMethod: z.object({
    type: PaymentMethodTypeSchema,
    brand: z.string().optional(),
    last4: z.string().optional(),
  }),
  country: z.string(),
  description: z.string(),
  /** manual fee override (minor units); when absent the fee is computed from config */
  feeOverride: z.number().int().min(0).optional(),
});
export type Payment = z.infer<typeof PaymentSchema>;

export const RefundSchema = z.object({
  id: z.string(),
  paymentId: z.string(),
  amount: z.number().int().min(0),
  reason: z.enum(["requested_by_customer", "duplicate", "fraudulent"]),
  status: z.literal("succeeded"),
  createdAt: z.string(),
});
export type Refund = z.infer<typeof RefundSchema>;

export const DisputeStatusSchema = z.enum([
  "needs_response",
  "under_review",
  "won",
  "lost",
]);
export type DisputeStatus = z.infer<typeof DisputeStatusSchema>;

export const DisputeSchema = z.object({
  id: z.string(),
  paymentId: z.string(),
  amount: z.number().int().min(0),
  reason: z.enum([
    "fraudulent",
    "product_not_received",
    "credit_not_processed",
    "general",
  ]),
  status: DisputeStatusSchema,
  createdAt: z.string(),
  evidenceDueBy: z.string(),
});
export type Dispute = z.infer<typeof DisputeSchema>;

export const PayoutSchema = z.object({
  id: z.string(),
  amount: z.number().int().min(0),
  currency: CurrencySchema,
  createdAt: z.string(),
  arrivalDate: z.string(),
  status: z.enum(["paid", "in_transit", "pending"]),
  method: z.literal("standard"),
});
export type Payout = z.infer<typeof PayoutSchema>;

export const BalanceTransactionSchema = z.object({
  id: z.string(),
  type: z.enum(["charge", "refund", "dispute", "payout"]),
  /** id of the payment / refund / dispute / payout that produced this entry */
  sourceId: z.string(),
  /** gross amount, signed, minor units */
  amount: z.number().int(),
  /** fee taken on this entry, minor units (>= 0) */
  fee: z.number().int(),
  /** amount − fee, signed */
  net: z.number().int(),
  currency: CurrencySchema,
  createdAt: z.string(),
  availableOn: z.string(),
  status: z.enum(["available", "pending"]),
  /** id of the payout that swept this entry, if any */
  payoutId: z.string().optional(),
});
export type BalanceTransaction = z.infer<typeof BalanceTransactionSchema>;

/* ------------------------------------------------------------------ */
/* Dataset                                                             */
/* ------------------------------------------------------------------ */

export const DatasetSchema = z.object({
  accountId: z.string(),
  seed: z.number().int(),
  generatedAt: z.string(),
  configHash: z.string(),
  customers: z.array(CustomerSchema),
  products: z.array(ProductSchema),
  plans: z.array(PlanSchema),
  subscriptions: z.array(SubscriptionSchema),
  payments: z.array(PaymentSchema),
  refunds: z.array(RefundSchema),
  disputes: z.array(DisputeSchema),
  payouts: z.array(PayoutSchema),
  balanceTransactions: z.array(BalanceTransactionSchema),
});
export type Dataset = z.infer<typeof DatasetSchema>;

/** Stable stringify (sorted keys) used to detect config drift. */
export function stableStringify(value: unknown): string {
  return JSON.stringify(value, (_key, val) => {
    if (val && typeof val === "object" && !Array.isArray(val)) {
      return Object.keys(val as Record<string, unknown>)
        .sort()
        .reduce<Record<string, unknown>>((acc, k) => {
          acc[k] = (val as Record<string, unknown>)[k];
          return acc;
        }, {});
    }
    return val as unknown;
  });
}
