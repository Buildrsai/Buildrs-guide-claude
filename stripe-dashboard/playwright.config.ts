import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src/tests/e2e",
  fullyParallel: true,
  retries: 0,
  workers: 4,
  reporter: "list",
  timeout: 60_000,
  use: {
    baseURL: "http://127.0.0.1:4517",
    trace: "off",
  },
  webServer: {
    command: "npx serve out -l 4517",
    url: "http://127.0.0.1:4517",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
        // use the environment's preinstalled Chromium when present
        launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH
          ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
          : undefined,
      },
    },
  ],
});
