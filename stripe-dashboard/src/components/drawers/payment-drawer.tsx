"use client";

import { useMemo, useState } from "react";
import type { Payment } from "@/lib/schemas";
import { useActiveAccount, useAppStore } from "@/lib/store/app-store";
import { computeFee } from "@/lib/engine/fees";
import { formatCurrency, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input, Label, NativeSelect } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { DetailDrawer, DrawerSection, KV } from "./detail-drawer";

export function PaymentDrawer({
  payment: paymentProp,
  onOpenChange,
}: {
  payment: Payment | null;
  onOpenChange: (open: boolean) => void;
}) {
  const dataset = useAppStore((s) => s.dataset);
  // always show the live object from the recomputed dataset, not the
  // snapshot captured when the row was clicked
  const payment = useMemo(
    () =>
      paymentProp && dataset
        ? (dataset.payments.find((p) => p.id === paymentProp.id) ?? paymentProp)
        : paymentProp,
    [dataset, paymentProp],
  );
  const account = useActiveAccount();
  const applyEdit = useAppStore((s) => s.applyEdit);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<{
    amount: string;
    createdAt: string;
    status: string;
    currency: string;
    methodType: string;
    customerId: string;
    feeOverride: string;
  } | null>(null);

  const customer = useMemo(
    () =>
      dataset && payment
        ? dataset.customers.find((c) => c.id === payment.customerId)
        : undefined,
    [dataset, payment],
  );
  const refunds = useMemo(
    () =>
      dataset && payment
        ? dataset.refunds.filter((r) => r.paymentId === payment.id)
        : [],
    [dataset, payment],
  );
  const dispute = useMemo(
    () =>
      dataset && payment
        ? dataset.disputes.find((d) => d.paymentId === payment.id)
        : undefined,
    [dataset, payment],
  );

  if (!payment || !account || !dataset) return null;
  const fee = computeFee(payment, account.config);

  const startEdit = () => {
    setForm({
      amount: (payment.amount / 100).toFixed(2),
      createdAt: payment.createdAt.slice(0, 10),
      status: payment.status,
      currency: payment.currency,
      methodType: payment.paymentMethod.type,
      customerId: payment.customerId,
      feeOverride:
        payment.feeOverride !== undefined
          ? (payment.feeOverride / 100).toFixed(2)
          : "",
    });
    setEditing(true);
  };

  const save = async () => {
    if (!form) return;
    await applyEdit("payment", payment.id, {
      amount: Math.round(parseFloat(form.amount || "0") * 100),
      createdAt: form.createdAt,
      status: form.status,
      currency: form.currency,
      customerId: form.customerId,
      paymentMethod: { ...payment.paymentMethod, type: form.methodType },
      feeOverride:
        form.feeOverride.trim() === ""
          ? null
          : Math.round(parseFloat(form.feeOverride) * 100),
    });
    setEditing(false);
  };

  return (
    <DetailDrawer
      open={!!payment}
      onOpenChange={(o) => {
        if (!o) setEditing(false);
        onOpenChange(o);
      }}
      title="Payment"
      headline={formatCurrency(payment.amount, payment.currency)}
      badge={
        <StatusBadge
          status={
            dispute
              ? "disputed"
              : refunds.length > 0
                ? "refunded"
                : payment.status
          }
        />
      }
      subtitle={payment.id}
    >
      {!editing ? (
        <>
          <DrawerSection
            title="Details"
            actions={
              <Button
                size="sm"
                variant="secondary"
                data-testid="edit-payment"
                onClick={startEdit}
              >
                Edit
              </Button>
            }
          >
            <KV label="Date" value={formatDate(payment.createdAt)} />
            <KV label="Customer" value={customer?.name ?? payment.customerId} />
            <KV label="Email" value={customer?.email ?? "—"} />
            <KV
              label="Payment method"
              value={`${payment.paymentMethod.type.replaceAll("_", " ")}${
                payment.paymentMethod.last4
                  ? ` •••• ${payment.paymentMethod.last4}`
                  : ""
              }`}
            />
            <KV label="Description" value={payment.description} />
            <KV label="Country" value={payment.country} />
            {payment.failureCode && (
              <KV label="Failure code" value={payment.failureCode} mono />
            )}
          </DrawerSection>
          <DrawerSection title="Fees & net">
            <KV label="Amount" value={formatCurrency(payment.amount, payment.currency)} />
            <KV
              label={`Fee${payment.feeOverride !== undefined ? " (manual)" : ""}`}
              value={formatCurrency(fee, payment.currency)}
            />
            <KV
              label="Net"
              value={formatCurrency(payment.amount - fee, payment.currency)}
            />
          </DrawerSection>
          {refunds.length > 0 && (
            <DrawerSection title="Refunds">
              {refunds.map((r) => (
                <KV
                  key={r.id}
                  label={formatDate(r.createdAt)}
                  value={`−${formatCurrency(r.amount, payment.currency)} · ${r.reason.replaceAll("_", " ")}`}
                />
              ))}
            </DrawerSection>
          )}
          {dispute && (
            <DrawerSection title="Dispute">
              <KV label="Status" value={<StatusBadge status={dispute.status} />} />
              <KV label="Reason" value={dispute.reason.replaceAll("_", " ")} />
              <KV label="Evidence due" value={formatDate(dispute.evidenceDueBy)} />
            </DrawerSection>
          )}
          <DrawerSection title="Timeline">
            <KV label={formatDate(payment.createdAt)} value="Payment created" />
            {payment.status === "succeeded" && (
              <KV label={formatDate(payment.createdAt)} value="Payment succeeded" />
            )}
            {refunds.map((r) => (
              <KV key={r.id} label={formatDate(r.createdAt)} value="Refund issued" />
            ))}
          </DrawerSection>
        </>
      ) : (
        form && (
          <DrawerSection title="Edit payment">
            <div className="flex flex-col gap-3" data-testid="payment-edit-form">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Amount</Label>
                  <Input
                    data-testid="edit-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Currency</Label>
                  <NativeSelect
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  >
                    <option value="eur">EUR</option>
                    <option value="usd">USD</option>
                    <option value="gbp">GBP</option>
                  </NativeSelect>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={form.createdAt}
                    onChange={(e) => setForm({ ...form, createdAt: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <NativeSelect
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="succeeded">Succeeded</option>
                    <option value="failed">Failed</option>
                  </NativeSelect>
                </div>
              </div>
              <div>
                <Label>Customer</Label>
                <NativeSelect
                  value={form.customerId}
                  onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                >
                  {dataset.customers.slice(0, 400).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.email}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Payment method</Label>
                  <NativeSelect
                    value={form.methodType}
                    onChange={(e) => setForm({ ...form, methodType: e.target.value })}
                  >
                    {["card", "sepa_debit", "link", "apple_pay", "google_pay", "paypal", "bank_transfer"].map(
                      (m) => (
                        <option key={m} value={m}>
                          {m.replaceAll("_", " ")}
                        </option>
                      ),
                    )}
                  </NativeSelect>
                </div>
                <div>
                  <Label>Fee override (blank = auto)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.feeOverride}
                    placeholder={(fee / 100).toFixed(2)}
                    onChange={(e) => setForm({ ...form, feeOverride: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-2 flex gap-2">
                <Button
                  variant="primary"
                  data-testid="save-payment"
                  onClick={() => void save()}
                >
                  Save changes
                </Button>
                <Button variant="ghost" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
              <p className="caption text-muted">
                Saving recomputes every dependent total, chart, balance, fee and
                payout.
              </p>
            </div>
          </DrawerSection>
        )
      )}
    </DetailDrawer>
  );
}
