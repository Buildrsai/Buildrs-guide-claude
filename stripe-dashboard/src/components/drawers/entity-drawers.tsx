"use client";

import { useMemo, useState } from "react";
import type {
  Customer,
  Dispute,
  Payout,
  Plan,
  Refund,
  Subscription,
} from "@/lib/schemas";
import { useActiveAccount, useAppStore } from "@/lib/store/app-store";
import { formatCurrency, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input, Label, NativeSelect } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { DetailDrawer, DrawerSection, KV } from "./detail-drawer";

function EditFooter({
  onSave,
  onCancel,
}: {
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="mt-3 flex gap-2">
      <Button variant="primary" data-testid="drawer-save" onClick={onSave}>
        Save changes
      </Button>
      <Button variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function CustomerDrawer({
  customer: customerProp,
  onOpenChange,
}: {
  customer: Customer | null;
  onOpenChange: (open: boolean) => void;
}) {
  const dataset = useAppStore((s) => s.dataset);
  const customer = useMemo(
    () =>
      customerProp && dataset
        ? (dataset.customers.find((x) => x.id === customerProp.id) ?? customerProp)
        : customerProp,
    [dataset, customerProp],
  );
  const applyEdit = useAppStore((s) => s.applyEdit);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", country: "" });

  const stats = useMemo(() => {
    if (!dataset || !customer) return null;
    const payments = dataset.payments.filter(
      (p) => p.customerId === customer.id && p.status === "succeeded",
    );
    const subs = dataset.subscriptions.filter((s) => s.customerId === customer.id);
    return {
      spend: payments.reduce((s, p) => s + p.amount, 0),
      count: payments.length,
      subs,
      lastPayments: payments.slice(-5).reverse(),
    };
  }, [dataset, customer]);

  if (!customer || !dataset) return null;
  const currency = dataset.payments[0]?.currency ?? "eur";

  return (
    <DetailDrawer
      open={!!customer}
      onOpenChange={(o) => {
        if (!o) setEditing(false);
        onOpenChange(o);
      }}
      title="Customer"
      headline={customer.name}
      subtitle={customer.email}
    >
      {!editing ? (
        <>
          <DrawerSection
            title="Profile"
            actions={
              <Button
                size="sm"
                onClick={() => {
                  setForm({
                    name: customer.name,
                    email: customer.email,
                    country: customer.country,
                  });
                  setEditing(true);
                }}
              >
                Edit
              </Button>
            }
          >
            <KV label="Customer since" value={formatDate(customer.createdAt)} />
            <KV label="Country" value={customer.country} />
            <KV
              label="Default payment method"
              value={`${customer.paymentMethod.type.replaceAll("_", " ")}${
                customer.paymentMethod.last4
                  ? ` •••• ${customer.paymentMethod.last4}`
                  : ""
              }`}
            />
            <KV label="ID" value={customer.id} mono />
          </DrawerSection>
          {stats && (
            <>
              <DrawerSection title="Lifetime">
                <KV label="Total spend" value={formatCurrency(stats.spend, currency)} />
                <KV label="Payments" value={stats.count} />
                <KV label="Subscriptions" value={stats.subs.length} />
              </DrawerSection>
              <DrawerSection title="Recent payments">
                {stats.lastPayments.length === 0 && (
                  <p className="caption text-muted">No payments yet.</p>
                )}
                {stats.lastPayments.map((p) => (
                  <KV
                    key={p.id}
                    label={formatDate(p.createdAt)}
                    value={formatCurrency(p.amount, p.currency)}
                  />
                ))}
              </DrawerSection>
            </>
          )}
        </>
      ) : (
        <DrawerSection title="Edit customer">
          <div className="flex flex-col gap-3">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Country</Label>
              <Input
                maxLength={2}
                value={form.country}
                onChange={(e) =>
                  setForm({ ...form, country: e.target.value.toUpperCase() })
                }
              />
            </div>
            <EditFooter
              onSave={() => {
                void applyEdit("customer", customer.id, form).then(() =>
                  setEditing(false),
                );
              }}
              onCancel={() => setEditing(false)}
            />
          </div>
        </DrawerSection>
      )}
    </DetailDrawer>
  );
}

/* ------------------------------------------------------------------ */

export function SubscriptionDrawer({
  subscription: subscriptionProp,
  onOpenChange,
}: {
  subscription: Subscription | null;
  onOpenChange: (open: boolean) => void;
}) {
  const dataset = useAppStore((s) => s.dataset);
  const subscription = useMemo(
    () =>
      subscriptionProp && dataset
        ? (dataset.subscriptions.find((x) => x.id === subscriptionProp.id) ?? subscriptionProp)
        : subscriptionProp,
    [dataset, subscriptionProp],
  );
  const applyEdit = useAppStore((s) => s.applyEdit);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ planId: "", status: "", canceledAt: "" });

  if (!subscription || !dataset) return null;
  const plan = dataset.plans.find((p) => p.id === subscription.planId);
  const customer = dataset.customers.find((c) => c.id === subscription.customerId);
  const invoices = dataset.payments
    .filter((p) => p.subscriptionId === subscription.id)
    .slice(-6)
    .reverse();

  return (
    <DetailDrawer
      open={!!subscription}
      onOpenChange={(o) => {
        if (!o) setEditing(false);
        onOpenChange(o);
      }}
      title="Subscription"
      headline={
        plan ? `${formatCurrency(plan.amount, plan.currency)}/${plan.interval}` : "—"
      }
      badge={<StatusBadge status={subscription.status} />}
      subtitle={`${customer?.name ?? subscription.customerId} · ${plan?.nickname ?? ""}`}
    >
      {!editing ? (
        <DrawerSection
          title="Details"
          actions={
            <Button
              size="sm"
              onClick={() => {
                setForm({
                  planId: subscription.planId,
                  status: subscription.status,
                  canceledAt: subscription.canceledAt?.slice(0, 10) ?? "",
                });
                setEditing(true);
              }}
            >
              Edit
            </Button>
          }
        >
          <KV label="Started" value={formatDate(subscription.startDate)} />
          <KV
            label="Current period ends"
            value={formatDate(subscription.currentPeriodEnd)}
          />
          {subscription.canceledAt && (
            <KV label="Canceled" value={formatDate(subscription.canceledAt)} />
          )}
          <KV label="ID" value={subscription.id} mono />
          <div className="mt-4">
            <h5 className="label-md mb-1 text-secondary">Recent invoices</h5>
            {invoices.map((p) => (
              <KV
                key={p.id}
                label={formatDate(p.createdAt)}
                value={
                  <span className="inline-flex items-center gap-2">
                    {formatCurrency(p.amount, p.currency)}
                    <StatusBadge status={p.status} />
                  </span>
                }
              />
            ))}
          </div>
        </DrawerSection>
      ) : (
        <DrawerSection title="Edit subscription">
          <div className="flex flex-col gap-3">
            <div>
              <Label>Plan</Label>
              <NativeSelect
                value={form.planId}
                onChange={(e) => setForm({ ...form, planId: e.target.value })}
              >
                {dataset.plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nickname} — {formatCurrency(p.amount, p.currency)}/{p.interval}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div>
              <Label>Status</Label>
              <NativeSelect
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {["active", "trialing", "past_due", "canceled"].map((s) => (
                  <option key={s} value={s}>
                    {s.replaceAll("_", " ")}
                  </option>
                ))}
              </NativeSelect>
            </div>
            {form.status === "canceled" && (
              <div>
                <Label>Canceled at</Label>
                <Input
                  type="date"
                  value={form.canceledAt}
                  onChange={(e) => setForm({ ...form, canceledAt: e.target.value })}
                />
              </div>
            )}
            <EditFooter
              onSave={() => {
                void applyEdit("subscription", subscription.id, {
                  planId: form.planId,
                  status: form.status,
                  canceledAt:
                    form.status === "canceled" ? form.canceledAt || null : null,
                }).then(() => setEditing(false));
              }}
              onCancel={() => setEditing(false)}
            />
          </div>
        </DrawerSection>
      )}
    </DetailDrawer>
  );
}

/* ------------------------------------------------------------------ */

export function RefundDrawer({
  refund: refundProp,
  onOpenChange,
}: {
  refund: Refund | null;
  onOpenChange: (open: boolean) => void;
}) {
  const dataset = useAppStore((s) => s.dataset);
  const refund = useMemo(
    () =>
      refundProp && dataset
        ? (dataset.refunds.find((x) => x.id === refundProp.id) ?? refundProp)
        : refundProp,
    [dataset, refundProp],
  );
  const applyEdit = useAppStore((s) => s.applyEdit);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ amount: "", createdAt: "", reason: "" });

  if (!refund || !dataset) return null;
  const payment = dataset.payments.find((p) => p.id === refund.paymentId);
  const currency = payment?.currency ?? "eur";

  return (
    <DetailDrawer
      open={!!refund}
      onOpenChange={(o) => {
        if (!o) setEditing(false);
        onOpenChange(o);
      }}
      title="Refund"
      headline={`−${formatCurrency(refund.amount, currency)}`}
      badge={<StatusBadge status="refunded" />}
      subtitle={refund.id}
    >
      {!editing ? (
        <DrawerSection
          title="Details"
          actions={
            <Button
              size="sm"
              onClick={() => {
                setForm({
                  amount: (refund.amount / 100).toFixed(2),
                  createdAt: refund.createdAt.slice(0, 10),
                  reason: refund.reason,
                });
                setEditing(true);
              }}
            >
              Edit
            </Button>
          }
        >
          <KV label="Date" value={formatDate(refund.createdAt)} />
          <KV label="Reason" value={refund.reason.replaceAll("_", " ")} />
          <KV
            label="Original payment"
            value={payment ? formatCurrency(payment.amount, currency) : "—"}
          />
          <KV label="Payment ID" value={refund.paymentId} mono />
        </DrawerSection>
      ) : (
        <DrawerSection title="Edit refund">
          <div className="flex flex-col gap-3">
            <div>
              <Label>Amount (≤ original payment)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={form.createdAt}
                onChange={(e) => setForm({ ...form, createdAt: e.target.value })}
              />
            </div>
            <div>
              <Label>Reason</Label>
              <NativeSelect
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              >
                {["requested_by_customer", "duplicate", "fraudulent"].map((r) => (
                  <option key={r} value={r}>
                    {r.replaceAll("_", " ")}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <EditFooter
              onSave={() => {
                void applyEdit("refund", refund.id, {
                  amount: Math.round(parseFloat(form.amount || "0") * 100),
                  createdAt: form.createdAt,
                  reason: form.reason,
                }).then(() => setEditing(false));
              }}
              onCancel={() => setEditing(false)}
            />
          </div>
        </DrawerSection>
      )}
    </DetailDrawer>
  );
}

/* ------------------------------------------------------------------ */

export function DisputeDrawer({
  dispute: disputeProp,
  onOpenChange,
}: {
  dispute: Dispute | null;
  onOpenChange: (open: boolean) => void;
}) {
  const dataset = useAppStore((s) => s.dataset);
  const dispute = useMemo(
    () =>
      disputeProp && dataset
        ? (dataset.disputes.find((x) => x.id === disputeProp.id) ?? disputeProp)
        : disputeProp,
    [dataset, disputeProp],
  );
  const applyEdit = useAppStore((s) => s.applyEdit);
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState("");

  if (!dispute || !dataset) return null;
  const payment = dataset.payments.find((p) => p.id === dispute.paymentId);
  const currency = payment?.currency ?? "eur";

  return (
    <DetailDrawer
      open={!!dispute}
      onOpenChange={(o) => {
        if (!o) setEditing(false);
        onOpenChange(o);
      }}
      title="Dispute"
      headline={formatCurrency(dispute.amount, currency)}
      badge={<StatusBadge status={dispute.status} />}
      subtitle={dispute.id}
    >
      {!editing ? (
        <DrawerSection
          title="Details"
          actions={
            <Button
              size="sm"
              onClick={() => {
                setStatus(dispute.status);
                setEditing(true);
              }}
            >
              Edit
            </Button>
          }
        >
          <KV label="Opened" value={formatDate(dispute.createdAt)} />
          <KV label="Reason" value={dispute.reason.replaceAll("_", " ")} />
          <KV label="Evidence due by" value={formatDate(dispute.evidenceDueBy)} />
          <KV label="Payment ID" value={dispute.paymentId} mono />
        </DrawerSection>
      ) : (
        <DrawerSection title="Edit dispute">
          <div className="flex flex-col gap-3">
            <div>
              <Label>Status</Label>
              <NativeSelect value={status} onChange={(e) => setStatus(e.target.value)}>
                {["needs_response", "under_review", "won", "lost"].map((s) => (
                  <option key={s} value={s}>
                    {s.replaceAll("_", " ")}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <EditFooter
              onSave={() => {
                void applyEdit("dispute", dispute.id, { status }).then(() =>
                  setEditing(false),
                );
              }}
              onCancel={() => setEditing(false)}
            />
          </div>
        </DrawerSection>
      )}
    </DetailDrawer>
  );
}

/* ------------------------------------------------------------------ */

export function PayoutDrawer({
  payout: payoutProp,
  onOpenChange,
}: {
  payout: Payout | null;
  onOpenChange: (open: boolean) => void;
}) {
  const dataset = useAppStore((s) => s.dataset);
  const payout = useMemo(
    () =>
      payoutProp && dataset
        ? (dataset.payouts.find((x) => x.id === payoutProp.id) ?? payoutProp)
        : payoutProp,
    [dataset, payoutProp],
  );
  const applyEdit = useAppStore((s) => s.applyEdit);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ status: "", arrivalDate: "" });

  const swept = useMemo(() => {
    if (!dataset || !payout) return [];
    return dataset.balanceTransactions.filter(
      (t) => t.payoutId === payout.id && t.type !== "payout",
    );
  }, [dataset, payout]);

  if (!payout || !dataset) return null;

  return (
    <DetailDrawer
      open={!!payout}
      onOpenChange={(o) => {
        if (!o) setEditing(false);
        onOpenChange(o);
      }}
      title="Payout"
      headline={formatCurrency(payout.amount, payout.currency)}
      badge={<StatusBadge status={payout.status} />}
      subtitle={payout.id}
    >
      {!editing ? (
        <>
          <DrawerSection
            title="Details"
            actions={
              <Button
                size="sm"
                onClick={() => {
                  setForm({
                    status: payout.status,
                    arrivalDate: payout.arrivalDate.slice(0, 10),
                  });
                  setEditing(true);
                }}
              >
                Edit
              </Button>
            }
          >
            <KV label="Initiated" value={formatDate(payout.createdAt)} />
            <KV label="Expected arrival" value={formatDate(payout.arrivalDate)} />
            <KV label="Method" value="Standard (bank account)" />
            <KV label="Transactions" value={swept.length} />
          </DrawerSection>
          <DrawerSection title="Swept transactions">
            <div className="max-h-64 overflow-y-auto">
              {swept.slice(0, 30).map((t) => (
                <KV
                  key={t.id}
                  label={`${formatDate(t.createdAt)} · ${t.type}`}
                  value={formatCurrency(t.net, t.currency)}
                />
              ))}
              {swept.length > 30 && (
                <p className="caption mt-1 text-muted">
                  +{swept.length - 30} more transactions
                </p>
              )}
            </div>
          </DrawerSection>
        </>
      ) : (
        <DrawerSection title="Edit payout">
          <div className="flex flex-col gap-3">
            <div>
              <Label>Status</Label>
              <NativeSelect
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {["paid", "in_transit", "pending"].map((s) => (
                  <option key={s} value={s}>
                    {s.replaceAll("_", " ")}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div>
              <Label>Arrival date</Label>
              <Input
                type="date"
                value={form.arrivalDate}
                onChange={(e) => setForm({ ...form, arrivalDate: e.target.value })}
              />
            </div>
            <EditFooter
              onSave={() => {
                void applyEdit("payout", payout.id, form).then(() =>
                  setEditing(false),
                );
              }}
              onCancel={() => setEditing(false)}
            />
          </div>
        </DrawerSection>
      )}
    </DetailDrawer>
  );
}

/* ------------------------------------------------------------------ */

export function PlanDrawer({
  plan: planProp,
  onOpenChange,
}: {
  plan: Plan | null;
  onOpenChange: (open: boolean) => void;
}) {
  const dataset = useAppStore((s) => s.dataset);
  const plan = useMemo(
    () =>
      planProp && dataset
        ? (dataset.plans.find((x) => x.id === planProp.id) ?? planProp)
        : planProp,
    [dataset, planProp],
  );
  const account = useActiveAccount();
  const applyEdit = useAppStore((s) => s.applyEdit);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ nickname: "", amount: "", interval: "month" });

  const subCount = useMemo(
    () =>
      dataset && plan
        ? dataset.subscriptions.filter(
            (s) => s.planId === plan.id && s.status !== "canceled",
          ).length
        : 0,
    [dataset, plan],
  );

  if (!plan || !dataset || !account) return null;

  return (
    <DetailDrawer
      open={!!plan}
      onOpenChange={(o) => {
        if (!o) setEditing(false);
        onOpenChange(o);
      }}
      title="Price"
      headline={`${formatCurrency(plan.amount, plan.currency)}/${plan.interval}`}
      subtitle={plan.nickname}
    >
      {!editing ? (
        <DrawerSection
          title="Details"
          actions={
            <Button
              size="sm"
              onClick={() => {
                setForm({
                  nickname: plan.nickname,
                  amount: (plan.amount / 100).toFixed(2),
                  interval: plan.interval,
                });
                setEditing(true);
              }}
            >
              Edit
            </Button>
          }
        >
          <KV label="Active subscriptions" value={subCount} />
          <KV label="Product ID" value={plan.productId} mono />
          <KV label="Price ID" value={plan.id} mono />
        </DrawerSection>
      ) : (
        <DrawerSection title="Edit price">
          <div className="flex flex-col gap-3">
            <div>
              <Label>Name</Label>
              <Input
                value={form.nickname}
                onChange={(e) => setForm({ ...form, nickname: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
              <div>
                <Label>Interval</Label>
                <NativeSelect
                  value={form.interval}
                  onChange={(e) => setForm({ ...form, interval: e.target.value })}
                >
                  <option value="month">Monthly</option>
                  <option value="year">Yearly</option>
                </NativeSelect>
              </div>
            </div>
            <EditFooter
              onSave={() => {
                void applyEdit("plan", plan.id, {
                  nickname: form.nickname,
                  amount: Math.round(parseFloat(form.amount || "0") * 100),
                  interval: form.interval,
                }).then(() => setEditing(false));
              }}
              onCancel={() => setEditing(false)}
            />
          </div>
        </DrawerSection>
      )}
    </DetailDrawer>
  );
}
