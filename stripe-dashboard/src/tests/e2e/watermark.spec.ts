import { expect, test, type Page } from "@playwright/test";

const ROUTES = [
  "/overview",
  "/payments",
  "/balances",
  "/payouts",
  "/customers",
  "/subscriptions",
  "/products",
  "/refunds",
  "/disputes",
  "/reports",
  "/developers",
  "/settings",
  "/admin",
  "/present",
];

async function waitReady(page: Page) {
  await page.waitForSelector("[data-testid=watermark]", { timeout: 20_000 });
}

test.describe("watermark is present and non-removable", () => {
  for (const route of ROUTES) {
    test(`watermark visible on ${route}`, async ({ page }) => {
      await page.goto(route);
      await waitReady(page);
      const watermark = page.getByTestId("watermark");
      await expect(watermark).toBeAttached();
      const badge = page.getByTestId("watermark-badge");
      await expect(badge).toHaveText("SIMULATION — DONNÉES FICTIVES");
    });
  }

  test("no query param, storage flag or route disables the watermark", async ({
    page,
  }) => {
    await page.goto("/overview?watermark=off&simulation=false&debug=1");
    await waitReady(page);
    await expect(page.getByTestId("watermark")).toBeAttached();

    await page.evaluate(() => {
      localStorage.setItem("watermark", "off");
      localStorage.setItem("hideWatermark", "true");
    });
    await page.reload();
    await waitReady(page);
    await expect(page.getByTestId("watermark")).toBeAttached();
  });

  test("exported PNG still carries the watermark even if the DOM overlay is removed", async ({
    page,
  }) => {
    await page.goto("/overview");
    await waitReady(page);
    // wait for data to render
    await page.waitForSelector("[data-testid=page-title]");

    // adversarial: rip the DOM overlay out before exporting
    await page.evaluate(() => {
      document.querySelector("[data-testid=watermark]")?.remove();
    });

    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("export-menu").click();
    await page.getByTestId("export-png-1x").click();
    const download = await downloadPromise;
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(chunk as Buffer);
    const png = Buffer.concat(chunks);
    expect(png.length).toBeGreaterThan(10_000);

    // decode in the browser and check the badge region carries dark
    // navy pixels (the opaque stamped badge) in the bottom-right corner
    const badgeDetected = await page.evaluate(async (bytes: number[]) => {
      const blob = new Blob([new Uint8Array(bytes)], { type: "image/png" });
      const bitmap = await createImageBitmap(blob);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(bitmap, 0, 0);
      const region = ctx.getImageData(
        Math.floor(bitmap.width * 0.72),
        Math.floor(bitmap.height * 0.9),
        Math.floor(bitmap.width * 0.27),
        Math.floor(bitmap.height * 0.09),
      );
      let dark = 0;
      for (let i = 0; i < region.data.length; i += 4) {
        const [r, g, b] = [
          region.data[i],
          region.data[i + 1],
          region.data[i + 2],
        ];
        // stamped badge color #0a2540
        if (r < 40 && g < 70 && b < 100 && b > 30) dark++;
      }
      return dark > 200;
    }, Array.from(png));
    expect(badgeDetected).toBe(true);
  });
});
