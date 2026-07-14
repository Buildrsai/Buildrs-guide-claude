import { expect, test } from "@playwright/test";

test("editing a payment recomputes totals and persists across reloads", async ({
  page,
}) => {
  await page.goto("/payments");
  await page.waitForSelector("[data-testid=page-title]", { timeout: 30_000 });

  // open the first succeeded payment
  await page.getByRole("button", { name: /^Succeeded/ }).click();
  const firstRow = page.locator("[data-testid=data-table] tbody tr").first();
  await firstRow.waitFor();
  await firstRow.click();

  const drawer = page.getByTestId("detail-drawer");
  await expect(drawer).toBeVisible();
  await page.getByTestId("edit-payment").click();

  // set a distinctive amount
  const target = "123456.78";
  await page.getByTestId("edit-amount").fill(target);
  await page.getByTestId("save-payment").click();
  await expect(page.getByTestId("payment-edit-form")).toBeHidden({
    timeout: 10_000,
  });
  // drawer headline shows the new amount
  await expect(drawer.getByText(/123,456\.78/).first()).toBeVisible();
  await page.keyboard.press("Escape");

  // the edited amount appears in the table (recomputed view)
  await expect(
    page.locator("[data-testid=data-table]").getByText(/123,456\.78/).first(),
  ).toBeVisible();

  // persists after reload (IndexedDB)
  await page.reload();
  await page.waitForSelector("[data-testid=page-title]", { timeout: 30_000 });
  await expect(
    page.locator("[data-testid=data-table]").getByText(/123,456\.78/).first(),
  ).toBeVisible();
});
