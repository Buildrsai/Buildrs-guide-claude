import { format, parseISO } from "date-fns";
import type { Currency } from "@/lib/schemas";

const CURRENCY_CODE: Record<Currency, string> = {
  usd: "USD",
  eur: "EUR",
  gbp: "GBP",
};

/** Formats minor units as a currency amount, Stripe-style (e.g. €1,234.56). */
export function formatCurrency(
  minorUnits: number,
  currency: Currency,
  opts?: { compact?: boolean },
): string {
  const value = minorUnits / 100;
  if (opts?.compact && Math.abs(value) >= 10_000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: CURRENCY_CODE[currency],
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: CURRENCY_CODE[currency],
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(iso: string): string {
  return format(parseISO(iso), "MMM d, yyyy");
}

export function formatDateShort(iso: string): string {
  return format(parseISO(iso), "MMM d");
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export function formatPct(value: number, digits = 1): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}%`;
}
