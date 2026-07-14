import { z } from "zod";
import {
  CurrencySchema,
  DisputeStatusSchema,
  PaymentMethodTypeSchema,
  PaymentStatusSchema,
  SubscriptionStatusSchema,
  type Dataset,
  type ScenarioConfig,
} from "@/lib/schemas";
import { rebuildDerived } from "@/lib/selectors/recompute";

export type EditableEntity =
  | "payment"
  | "refund"
  | "dispute"
  | "subscription"
  | "customer"
  | "plan"
  | "payout";

const PaymentPatchSchema = z
  .object({
    amount: z.number().int().min(0),
    createdAt: z.string(),
    customerId: z.string(),
    status: PaymentStatusSchema,
    currency: CurrencySchema,
    paymentMethod: z.object({
      type: PaymentMethodTypeSchema,
      brand: z.string().optional(),
      last4: z.string().optional(),
    }),
    description: z.string(),
    feeOverride: z.number().int().min(0).nullable(),
  })
  .partial();

const RefundPatchSchema = z
  .object({
    amount: z.number().int().min(0),
    createdAt: z.string(),
    reason: z.enum(["requested_by_customer", "duplicate", "fraudulent"]),
  })
  .partial();

const DisputePatchSchema = z
  .object({ status: DisputeStatusSchema, amount: z.number().int().min(0) })
  .partial();

const SubscriptionPatchSchema = z
  .object({
    planId: z.string(),
    status: SubscriptionStatusSchema,
    startDate: z.string(),
    canceledAt: z.string().nullable(),
  })
  .partial();

const CustomerPatchSchema = z
  .object({ name: z.string().min(1), email: z.string(), country: z.string() })
  .partial();

const PlanPatchSchema = z
  .object({
    nickname: z.string().min(1),
    amount: z.number().int().min(0),
    interval: z.enum(["month", "year"]),
  })
  .partial();

const PayoutPatchSchema = z
  .object({
    status: z.enum(["paid", "in_transit", "pending"]),
    arrivalDate: z.string(),
  })
  .partial();

/**
 * Applies a validated patch to the source-of-truth entities, then rebuilds
 * every derived artifact (fees, ledger, payouts) so all totals, charts,
 * balances and comparisons stay coherent. Pure function — no persistence.
 */
export function applyEntityEdit(
  dataset: Dataset,
  config: ScenarioConfig,
  entity: EditableEntity,
  id: string,
  rawPatch: Record<string, unknown>,
): Dataset {
  switch (entity) {
    case "payment": {
      const patch = PaymentPatchSchema.parse(rawPatch);
      const payments = dataset.payments.map((p) => {
        if (p.id !== id) return p;
        const { feeOverride, ...rest } = patch;
        return {
          ...p,
          ...rest,
          feeOverride:
            feeOverride === null ? undefined : (feeOverride ?? p.feeOverride),
          failureCode:
            patch.status === "succeeded" ? undefined : p.failureCode,
        };
      });
      const edited = payments.find((p) => p.id === id);
      // keep attached refunds/disputes consistent with the edited payment
      const refunds = dataset.refunds
        .map((r) =>
          r.paymentId === id && edited
            ? {
                ...r,
                amount: Math.min(r.amount, edited.amount),
                createdAt:
                  r.createdAt < edited.createdAt ? edited.createdAt : r.createdAt,
              }
            : r,
        )
        .filter((r) => !(r.paymentId === id && edited?.status === "failed"));
      const disputes = dataset.disputes.filter(
        (d) => !(d.paymentId === id && edited?.status === "failed"),
      );
      return rebuildDerived({ ...dataset, payments, refunds, disputes }, config);
    }
    case "refund": {
      const patch = RefundPatchSchema.parse(rawPatch);
      const paymentById = new Map(dataset.payments.map((p) => [p.id, p]));
      const refunds = dataset.refunds.map((r) => {
        if (r.id !== id) return r;
        const payment = paymentById.get(r.paymentId);
        const next = { ...r, ...patch };
        if (payment) {
          next.amount = Math.min(next.amount, payment.amount);
          if (next.createdAt < payment.createdAt) next.createdAt = payment.createdAt;
        }
        return next;
      });
      return rebuildDerived({ ...dataset, refunds }, config);
    }
    case "dispute": {
      const patch = DisputePatchSchema.parse(rawPatch);
      const disputes = dataset.disputes.map((d) =>
        d.id === id ? { ...d, ...patch } : d,
      );
      return rebuildDerived({ ...dataset, disputes }, config);
    }
    case "subscription": {
      const patch = SubscriptionPatchSchema.parse(rawPatch);
      const subscriptions = dataset.subscriptions.map((s) => {
        if (s.id !== id) return s;
        const { canceledAt, ...rest } = patch;
        const next = {
          ...s,
          ...rest,
          canceledAt:
            canceledAt === null ? undefined : (canceledAt ?? s.canceledAt),
        };
        if (next.status === "canceled" && !next.canceledAt) {
          next.canceledAt = config.periodEnd;
        }
        if (next.status !== "canceled" && patch.status) {
          next.canceledAt = undefined;
        }
        return next;
      });
      return { ...dataset, subscriptions };
    }
    case "customer": {
      const patch = CustomerPatchSchema.parse(rawPatch);
      const customers = dataset.customers.map((c) =>
        c.id === id ? { ...c, ...patch } : c,
      );
      return { ...dataset, customers };
    }
    case "plan": {
      const patch = PlanPatchSchema.parse(rawPatch);
      const plans = dataset.plans.map((p) =>
        p.id === id ? { ...p, ...patch } : p,
      );
      return { ...dataset, plans };
    }
    case "payout": {
      // payouts are derived; only presentation fields (status, arrival) are
      // editable and the edit survives until the next regeneration
      const patch = PayoutPatchSchema.parse(rawPatch);
      const payouts = dataset.payouts.map((p) =>
        p.id === id ? { ...p, ...patch } : p,
      );
      return { ...dataset, payouts };
    }
  }
}
