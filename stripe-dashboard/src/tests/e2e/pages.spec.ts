import { expect, test, type Page } from "@playwright/test";

async function waitData(page: Page) {
  await page.waitForSelector("[data-testid=page-title]", { timeout: 30_000 });
}

test("overview renders live metrics", async ({ page }) => {
  await page.goto("/overview");
  await waitData(page);
  await expect(page.getByText("Gross volume").first()).toBeVisible();
  // a currency amount is rendered somewhere in the metric cards
  await expect(
    page.locator("[data-export-target=gross-volume]").getByText(/[€$£]/),
  ).toBeVisible();
});

const TABLE_ROUTES = [
  "/payments",
  "/customers",
  "/subscriptions",
  "/products",
  "/refunds",
  "/balances",
  "/payouts",
];

for (const route of TABLE_ROUTES) {
  test(`${route} renders a populated table`, async ({ page }) => {
    await page.goto(route);
    await waitData(page);
    const rows = page.locator("[data-testid=data-table] tbody tr");
    await expect(rows.first()).toBeVisible({ timeout: 15_000 });
    expect(await rows.count()).toBeGreaterThan(0);
  });
}

test("account switcher swaps datasets", async ({ page }) => {
  await page.goto("/overview");
  await waitData(page);
  const metric = page.locator("[data-export-target=gross-volume]");
  const before = await metric.innerText();

  await page.getByTestId("account-switcher").click();
  // click the account option that is not currently active
  const options = page.locator("[data-testid^=account-option-]");
  const count = await options.count();
  expect(count).toBeGreaterThanOrEqual(2);
  for (let i = 0; i < count; i++) {
    const option = options.nth(i);
    const hasCheck = (await option.locator("svg.text-primary").count()) > 0;
    if (!hasCheck) {
      await option.click();
      break;
    }
  }
  await page.waitForTimeout(800);
  const after = await metric.innerText();
  expect(after).not.toEqual(before);
});

test("developers page shows only clearly fake keys", async ({ page }) => {
  await page.goto("/developers");
  await waitData(page);
  await expect(page.getByText(/pk_sim_/)).toBeVisible();
  await expect(page.getByText(/sk_sim_/)).toBeVisible();
  // no realistic-looking live Stripe key prefixes anywhere
  expect(await page.getByText(/pk_live_|sk_live_/).count()).toBe(0);
});
