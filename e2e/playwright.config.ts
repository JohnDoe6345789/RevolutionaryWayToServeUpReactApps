import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 2 * 60 * 1000,
  expect: {
    timeout: 2 * 60 * 1000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: "http://127.0.0.1:4173",
    actionTimeout: 15 * 1000,
    navigationTimeout: 2 * 60 * 1000,
    viewport: {
      width: 1280,
      height: 720,
    },
    trace: "on-first-retry",
  },
});
