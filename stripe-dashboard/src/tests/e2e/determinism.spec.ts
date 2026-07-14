import { expect, test } from "@playwright/test";

test("regenerating with the same seed reproduces identical data", async ({
  page,
}) => {
  await page.goto("/overview");
  await page.waitForSelector("[data-testid=page-title]", { timeout: 30_000 });
  const metric = page.locator("[data-export-target=gross-volume]");
  const before = await metric.innerText();

  // apply the SAME seed through the admin studio → full regeneration
  await page.goto("/admin");
  await page.waitForSelector("[data-testid=seed-input]", { timeout: 30_000 });
  const seed = await page.getByTestId("seed-input").inputValue();
  await page.getByTestId("seed-input").fill(String(Number(seed) + 1));
  await page
    .getByRole("button", { name: "Apply seed" })
    .click();
  await page.waitForTimeout(1500);
  await page.getByTestId("seed-input").fill(seed);
  await page.getByRole("button", { name: "Apply seed" }).click();
  await page.waitForTimeout(1500);

  await page.goto("/overview");
  await page.waitForSelector("[data-testid=page-title]", { timeout: 30_000 });
  const after = await metric.innerText();
  expect(after).toEqual(before);
});
