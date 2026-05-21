/// <reference types="node" />
import type { PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
  webServer: {
    command: 'npm run start:deploy_preview',
    port: 3000,
    timeout: 60 * 1000,
    reuseExistingServer: true,
  },
  testDir: './playwright-tests',
  timeout: process.env.CI ? 5 * 60 * 1000 : 60 * 1000,
  expect: {
    timeout: process.env.CI ? 30 * 1000 : 10 * 1000,
  },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  maxFailures: process.env.CI ? 2 : 0,
  reporter: [[process.env.CI ? 'github' : 'list'], ['html']],

  use: {
    browserName: 'chromium',
    headless: true,
    actionTimeout: 20 * 1000,
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'URL',
      testMatch: /.*externalUrls.spec.ts/,
    },
    {
      name: 'E2E_NIGHTLY',
      testIgnore: /.*externalUrls.spec.ts/,
    },
    {
      name: 'E2E_CI',
      testMatch: /.*ci.spec.ts/,
    },
  ],
}

export default config
