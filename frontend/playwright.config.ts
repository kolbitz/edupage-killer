import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;
const externalServers = !!process.env.E2E_EXTERNAL_SERVERS;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI
    ? [["github"], ["html", { outputFolder: "playwright-report", open: "never" }]]
    : "list",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: externalServers
    ? undefined
    : {
        // In CI use the production preview build for stability; locally use the dev server
        command: isCI
          ? "pnpm run build && npx vite preview --port 5173"
          : "pnpm run dev",
        url: "http://localhost:5173",
        reuseExistingServer: !isCI,
        timeout: 120_000,
      },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
