# Stripe Dashboard Simulator

A pixel-faithful replica of a modern Stripe-style payments dashboard, driven by a
**deterministic fake-data engine**. Built for screenshots, demos and videos —
every page and every export carries a non-removable watermark:
**SIMULATION — DONNÉES FICTIVES**.

## Stack

Next.js 16 (App Router, static export) · TypeScript strict · Tailwind CSS v4 ·
Radix UI primitives · Zustand · Zod · date-fns · Recharts · Dexie (IndexedDB) ·
html-to-image · Vitest · Playwright.

## Run

```bash
npm install
npm run dev            # http://localhost:3000 → redirects to /overview
npm run build          # static export in out/
npm run test           # 26 unit tests (engine, coherence, determinism)
PLAYWRIGHT_CHROMIUM_PATH=/opt/pw-browsers/chromium npm run test:e2e   # 30 e2e tests
```

(`PLAYWRIGHT_CHROMIUM_PATH` is only needed when the Playwright-managed browser
download is unavailable; omit it if `npx playwright install` works.)

## What's inside

- **12 dashboard pages** — Overview, Payments, Balances, Payouts, Customers,
  Subscriptions, Products, Refunds, Disputes, Reports, Developers, Settings —
  with dense tables, filter tabs, ⌘K search, detail drawers, hover states.
- **Multi-account switcher** (up to 10 accounts, like Stripe's org switcher).
  Each account is one SaaS/e-commerce scenario persisted in IndexedDB.
- **Data studio (`/admin`)** — configure currency, period, monthly revenue,
  MRR, customers, AOV, growth, churn, refund/failure rates, fees, payout delay
  and schedule, seasonality, plan distribution, countries, payment methods,
  transaction frequency. 10 presets (SaaS 10K/50K/100K MRR, high growth,
  declining, 7-day launch, refund wave, failure incident, e-commerce, agency).
- **8 scenario actions** — generate, regenerate, growth, decline, launch
  spike, refund wave, failed-payment incident, reset — all as declarative
  config overlays.
- **Deterministic engine** — seeded PRNG (xmur3 + mulberry32) with forked
  streams per stage; the same seed + config always produces byte-identical
  data.
- **Single source of truth** — payments/refunds/disputes are the only stored
  facts. Fees, balance ledger, payouts, totals, MRR, churn, daily series and
  previous-period comparisons are all derived; every manual edit triggers a
  full recompute (`rebuildDerived`).
- **Exports** — PNG 1x/2x/4x, per-card capture, full page, 1920×1080 16:9
  frame, fullscreen presentation mode (`/present`). The watermark is stamped
  into the bitmap of every export (`download()` only accepts the branded
  `StampedCanvas` type) and the DOM overlay is unconditional — no flag, route
  or query param can hide it.

## Coherence invariants (tested)

- gross = Σ succeeded payments · net = gross − refunds − fees − disputes
- Σ payouts + available + pending = Σ net ledger entries
- every payout = Σ of the ledger entries it swept
- MRR = normalized monthly sum of active subscriptions
- churn = canceled during period / active at period start
