import {
  addDays,
  addMonths,
  addYears,
  differenceInCalendarDays,
  isAfter,
  isBefore,
  parseISO,
  subDays,
} from "date-fns";
import type {
  Account,
  Customer,
  Dataset,
  Dispute,
  Payment,
  Plan,
  Product,
  Refund,
  ScenarioConfig,
  Subscription,
} from "@/lib/schemas";
import { stableStringify } from "@/lib/schemas";
import { Rng } from "./prng";
import {
  fakeCardBrand,
  fakeFailureCode,
  fakeLast4,
  fakePersonName,
} from "./naming";
import {
  buildDailyVolumeCurve,
  isoDay,
  overlayFactor,
  periodStartOf,
  type DayVolume,
} from "./volume-curve";
import { deriveBalanceAndPayouts } from "./payouts";

const ONE_OFF_PRODUCT_NAMES = [
  "Lifetime access", "Starter kit", "Premium bundle", "Pro upgrade",
  "Annual pass", "Gift card", "Add-on pack", "Onboarding session",
  "Priority support", "Custom setup", "Design pack", "Template library",
] as const;

const TX_FREQUENCY_FACTOR = { low: 0.55, medium: 1, high: 1.7 } as const;

interface PaymentMethodInfo {
  type: Customer["paymentMethod"]["type"];
  brand?: string;
  last4?: string;
}

function drawPaymentMethod(config: ScenarioConfig, rng: Rng): PaymentMethodInfo {
  const type = rng.weighted(config.paymentMethods, (m) => m.weightPct).type;
  if (type === "card" || type === "apple_pay" || type === "google_pay") {
    return { type, brand: fakeCardBrand(rng), last4: fakeLast4(rng) };
  }
  if (type === "sepa_debit" || type === "bank_transfer") {
    return { type, last4: fakeLast4(rng) };
  }
  return { type };
}

/* ------------------------------------------------------------------ */
/* Customers                                                           */
/* ------------------------------------------------------------------ */

function generateCustomers(
  config: ScenarioConfig,
  curve: DayVolume[],
  rng: Rng,
): Customer[] {
  const start = periodStartOf(config);
  const weights = curve.map((d, i) => ({ index: i, w: d.oneOffRevenue + 1 }));
  const totalW = weights.reduce((s, x) => s + x.w, 0);

  const customers: Customer[] = [];
  for (let i = 0; i < config.customerCount; i++) {
    const person = fakePersonName(rng);
    let createdAt: string;
    if (rng.chance(0.3)) {
      // long-standing customer, signed up before the visible period
      createdAt = isoDay(subDays(start, rng.int(1, 365)));
    } else {
      let roll = rng.next() * totalW;
      let index = 0;
      for (const x of weights) {
        roll -= x.w;
        if (roll <= 0) {
          index = x.index;
          break;
        }
      }
      createdAt = curve[index].date;
    }
    customers.push({
      id: rng.id("cus", 14),
      name: person.name,
      email: person.email,
      country: rng.weighted(config.countries, (c) => c.weightPct).code,
      createdAt,
      paymentMethod: drawPaymentMethod(config, rng),
    });
  }
  customers.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return customers;
}

/* ------------------------------------------------------------------ */
/* Catalog                                                             */
/* ------------------------------------------------------------------ */

function generateCatalog(
  config: ScenarioConfig,
  rng: Rng,
): { products: Product[]; plans: Plan[] } {
  const products: Product[] = [];
  const plans: Plan[] = [];

  for (const item of config.planDistribution) {
    const product: Product = {
      id: rng.id("prod", 14),
      name: item.name,
      description: `${item.name} subscription plan`,
    };
    products.push(product);
    plans.push({
      id: rng.id("price", 14),
      productId: product.id,
      nickname: item.name,
      amount: item.amount,
      currency: config.currency,
      interval: item.interval,
    });
  }

  if (config.monthlyRevenueTarget > config.mrrTarget) {
    const count = 8;
    for (let i = 0; i < count; i++) {
      products.push({
        id: rng.id("prod", 14),
        name: ONE_OFF_PRODUCT_NAMES[i],
        description: "One-time purchase",
      });
    }
  }
  return { products, plans };
}

/* ------------------------------------------------------------------ */
/* Subscriptions                                                       */
/* ------------------------------------------------------------------ */

function monthlyAmountOf(plan: { amount: number; interval: "month" | "year" }) {
  return plan.interval === "year" ? Math.round(plan.amount / 12) : plan.amount;
}

function generateSubscriptions(
  config: ScenarioConfig,
  customers: Customer[],
  plans: Plan[],
  rng: Rng,
): Subscription[] {
  if (config.mrrTarget <= 0 || plans.length === 0) return [];
  const end = parseISO(config.periodEnd);
  const weightByPlanId = new Map(
    config.planDistribution.map((item, i) => [plans[i]?.id, item.weightPct]),
  );

  const subs: Subscription[] = [];
  let activeMrr = 0;
  for (const customer of customers) {
    if (activeMrr >= config.mrrTarget) break;
    const plan = rng.weighted(plans, (p) => weightByPlanId.get(p.id) ?? 1);
    const startDate = parseISO(customer.createdAt);
    if (isAfter(startDate, end)) continue;

    // survival draws, one per elapsed month
    const monthsElapsed = Math.max(
      0,
      Math.floor(differenceInCalendarDays(end, startDate) / 30.44),
    );
    let canceledAt: string | undefined;
    for (let m = 1; m <= monthsElapsed; m++) {
      if (rng.chance(config.churnRatePctMonthly / 100)) {
        canceledAt = isoDay(addMonths(startDate, m));
        break;
      }
    }
    if (canceledAt && isAfter(parseISO(canceledAt), end)) canceledAt = undefined;

    const isTrial =
      !canceledAt &&
      differenceInCalendarDays(end, startDate) < 14 &&
      rng.chance(0.35);

    let currentPeriodEnd =
      plan.interval === "year" ? addYears(startDate, 1) : addMonths(startDate, 1);
    while (isBefore(currentPeriodEnd, end)) {
      currentPeriodEnd =
        plan.interval === "year"
          ? addYears(currentPeriodEnd, 1)
          : addMonths(currentPeriodEnd, 1);
    }

    subs.push({
      id: rng.id("sub", 14),
      customerId: customer.id,
      planId: plan.id,
      status: canceledAt ? "canceled" : isTrial ? "trialing" : "active",
      startDate: customer.createdAt,
      canceledAt,
      currentPeriodEnd: isoDay(currentPeriodEnd),
    });
    if (!canceledAt && !isTrial) activeMrr += monthlyAmountOf(plan);
  }
  return subs;
}

/* ------------------------------------------------------------------ */
/* Payments                                                            */
/* ------------------------------------------------------------------ */

function generatePayments(
  config: ScenarioConfig,
  customers: Customer[],
  subscriptions: Subscription[],
  plans: Plan[],
  curve: DayVolume[],
  rng: Rng,
): { payments: Payment[]; pastDueSubIds: Set<string> } {
  const start = periodStartOf(config);
  const end = parseISO(config.periodEnd);
  const customerById = new Map(customers.map((c) => [c.id, c]));
  const planById = new Map(plans.map((p) => [p.id, p]));
  const payments: Payment[] = [];
  const pastDueSubIds = new Set<string>();

  const failureProb = (date: Date) =>
    Math.min(
      0.95,
      (config.failureRatePct / 100) *
        overlayFactor(config.overlays, "failure_incident", date),
    );

  // 1. Subscription invoices at each billing anniversary inside the period.
  let invoiceNo = 1000;
  for (const sub of subscriptions) {
    const plan = planById.get(sub.planId);
    const customer = customerById.get(sub.customerId);
    if (!plan || !customer || sub.status === "trialing") continue;
    const cancelDate = sub.canceledAt ? parseISO(sub.canceledAt) : undefined;

    let cycle = parseISO(sub.startDate);
    let lastFailed = false;
    while (!isAfter(cycle, end)) {
      if (cancelDate && !isBefore(cycle, cancelDate)) break;
      const date = cycle;
      if (!isBefore(date, start)) {
        const failed = rng.chance(failureProb(date));
        invoiceNo++;
        const base: Omit<Payment, "id" | "status" | "failureCode"> = {
          customerId: customer.id,
          subscriptionId: sub.id,
          amount: plan.amount,
          currency: config.currency,
          createdAt: isoDay(date),
          paymentMethod: customer.paymentMethod,
          country: customer.country,
          description: `Invoice ${String(invoiceNo).padStart(4, "0")} — ${plan.nickname}`,
        };
        if (failed) {
          payments.push({
            ...base,
            id: rng.id("py", 16),
            status: "failed",
            failureCode: fakeFailureCode(rng),
          });
          // most failed invoices are retried successfully a couple days later
          const retryDate = addDays(date, 2);
          if (!isAfter(retryDate, end) && rng.chance(0.7)) {
            payments.push({
              ...base,
              id: rng.id("py", 16),
              createdAt: isoDay(retryDate),
              status: "succeeded",
            });
            lastFailed = false;
          } else {
            lastFailed = true;
          }
        } else {
          payments.push({ ...base, id: rng.id("py", 16), status: "succeeded" });
          lastFailed = false;
        }
      }
      cycle =
        plan.interval === "year" ? addYears(cycle, 1) : addMonths(cycle, 1);
    }
    if (lastFailed && sub.status === "active") pastDueSubIds.add(sub.id);
  }

  // 2. One-off payments filling the daily curve.
  const freqFactor = TX_FREQUENCY_FACTOR[config.txFrequency];
  for (const day of curve) {
    if (day.oneOffRevenue <= 0) continue;
    const date = parseISO(day.date);
    const targetCount = Math.max(
      1,
      Math.round((day.oneOffRevenue / config.avgOrderValue) * freqFactor),
    );
    const avg = day.oneOffRevenue / targetCount;
    for (let i = 0; i < targetCount; i++) {
      const customer = rng.pick(customers);
      const amount = Math.max(100, Math.round(rng.normal(avg, avg * 0.35)));
      const failed = rng.chance(failureProb(date));
      payments.push({
        id: rng.id("py", 16),
        customerId: customer.id,
        amount,
        currency: config.currency,
        status: failed ? "failed" : "succeeded",
        failureCode: failed ? fakeFailureCode(rng) : undefined,
        createdAt: day.date,
        paymentMethod: customer.paymentMethod,
        country: customer.country,
        description: rng.pick(ONE_OFF_PRODUCT_NAMES),
      });
    }
  }

  payments.sort((a, b) =>
    a.createdAt === b.createdAt
      ? a.id.localeCompare(b.id)
      : a.createdAt.localeCompare(b.createdAt),
  );
  return { payments, pastDueSubIds };
}

/* ------------------------------------------------------------------ */
/* Refunds & disputes                                                  */
/* ------------------------------------------------------------------ */

function generateRefunds(
  config: ScenarioConfig,
  payments: Payment[],
  rng: Rng,
): Refund[] {
  const end = parseISO(config.periodEnd);
  const refunds: Refund[] = [];
  for (const p of payments) {
    if (p.status !== "succeeded") continue;
    const delay = 1 + rng.geometricDays(0.25, 21);
    const refundDate = addDays(parseISO(p.createdAt), delay);
    if (isAfter(refundDate, end)) continue;
    const prob =
      (config.refundRatePct / 100) *
      overlayFactor(config.overlays, "refund_wave", refundDate);
    if (!rng.chance(Math.min(prob, 0.9))) continue;
    const partial = rng.chance(0.15);
    refunds.push({
      id: rng.id("re", 16),
      paymentId: p.id,
      amount: partial
        ? Math.max(100, Math.round(p.amount * (0.3 + rng.next() * 0.6)))
        : p.amount,
      reason: rng.weighted(
        [
          { r: "requested_by_customer" as const, w: 80 },
          { r: "duplicate" as const, w: 12 },
          { r: "fraudulent" as const, w: 8 },
        ],
        (x) => x.w,
      ).r,
      status: "succeeded" as const,
      createdAt: isoDay(refundDate),
    });
  }
  return refunds;
}

function generateDisputes(
  config: ScenarioConfig,
  payments: Payment[],
  rng: Rng,
): Dispute[] {
  const end = parseISO(config.periodEnd);
  const disputes: Dispute[] = [];
  for (const p of payments) {
    if (p.status !== "succeeded") continue;
    const delay = 5 + rng.geometricDays(0.12, 40);
    const disputeDate = addDays(parseISO(p.createdAt), delay);
    if (isAfter(disputeDate, end)) continue;
    const prob =
      0.0015 *
      Math.max(1, overlayFactor(config.overlays, "refund_wave", disputeDate) / 2);
    if (!rng.chance(prob)) continue;
    const ageDays = differenceInCalendarDays(end, disputeDate);
    const status =
      ageDays < 10
        ? rng.pick(["needs_response", "under_review"] as const)
        : rng.weighted(
            [
              { s: "won" as const, w: 45 },
              { s: "lost" as const, w: 35 },
              { s: "under_review" as const, w: 20 },
            ],
            (x) => x.w,
          ).s;
    disputes.push({
      id: rng.id("dp", 16),
      paymentId: p.id,
      amount: p.amount,
      reason: rng.weighted(
        [
          { r: "fraudulent" as const, w: 45 },
          { r: "product_not_received" as const, w: 30 },
          { r: "credit_not_processed" as const, w: 15 },
          { r: "general" as const, w: 10 },
        ],
        (x) => x.w,
      ).r,
      status,
      createdAt: isoDay(disputeDate),
      evidenceDueBy: isoDay(addDays(disputeDate, 14)),
    });
  }
  return disputes;
}

/* ------------------------------------------------------------------ */
/* Pipeline                                                            */
/* ------------------------------------------------------------------ */

/**
 * Deterministic generation pipeline: same (config, seed) always produces a
 * byte-identical dataset. Each stage draws from its own forked stream so a
 * config change only reshuffles the stages it affects.
 */
export function generateDataset(
  account: Pick<Account, "id" | "config" | "seed">,
): Dataset {
  const { config, seed } = account;
  const root = new Rng(seed);

  const curve = buildDailyVolumeCurve(config, root.fork("curve"));
  const customers = generateCustomers(config, curve, root.fork("customers"));
  const { products, plans } = generateCatalog(config, root.fork("catalog"));
  const subscriptions = generateSubscriptions(
    config,
    customers,
    plans,
    root.fork("subscriptions"),
  );
  const { payments, pastDueSubIds } = generatePayments(
    config,
    customers,
    subscriptions,
    plans,
    curve,
    root.fork("payments"),
  );
  for (const sub of subscriptions) {
    if (pastDueSubIds.has(sub.id)) sub.status = "past_due";
  }
  const refunds = generateRefunds(config, payments, root.fork("refunds"));
  const disputes = generateDisputes(config, payments, root.fork("disputes"));
  const { balanceTransactions, payouts } = deriveBalanceAndPayouts(
    { payments, refunds, disputes },
    config,
    seed,
  );

  return {
    accountId: account.id,
    seed,
    generatedAt: config.periodEnd,
    configHash: stableStringify(config),
    customers,
    products,
    plans,
    subscriptions,
    payments,
    refunds,
    disputes,
    payouts,
    balanceTransactions,
  };
}
