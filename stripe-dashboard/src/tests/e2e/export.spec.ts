import { expect, test } from "@playwright/test";

async function downloadPng(
  page: import("@playwright/test").Page,
  trigger: () => Promise<void>,
): Promise<{ width: number; height: number }> {
  const downloadPromise = page.waitForEvent("download");
  await trigger();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(chunk as Buffer);
  const png = Buffer.concat(chunks);
  // PNG header: width/height at bytes 16-23 of the IHDR chunk
  expect(png.subarray(1, 4).toString()).toBe("PNG");
  return {
    width: png.readUInt32BE(16),
    height: png.readUInt32BE(20),
  };
}

test.describe("exports", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/overview");
    await page.waitForSelector("[data-testid=page-title]", { timeout: 30_000 });
  });

  test("PNG 2x doubles the pixel dimensions of 1x", async ({ page }) => {
    const one = await downloadPng(page, async () => {
      await page.getByTestId("export-menu").click();
      await page.getByTestId("export-png-1x").click();
    });
    const two = await downloadPng(page, async () => {
      await page.getByTestId("export-menu").click();
      await page.getByTestId("export-png-2x").click();
    });
    expect(Math.abs(two.width - one.width * 2)).toBeLessThanOrEqual(4);
    expect(Math.abs(two.height - one.height * 2)).toBeLessThanOrEqual(4);
  });

  test("16:9 export is exactly 1920×1080", async ({ page }) => {
    const dims = await downloadPng(page, async () => {
      await page.getByTestId("export-menu").click();
      await page.getByTestId("export-youtube").click();
    });
    expect(dims.width).toBe(1920);
    expect(dims.height).toBe(1080);
  });
});
