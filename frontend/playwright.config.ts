import type { PlaywrightTestConfig } from '@playwright/test';

// For AXE a11y
import { expect } from '@playwright/test'
import matchers from 'expect-axe-playwright'
expect.extend(matchers)


/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  webServer: {
    command: 'npm run start',
    port: 3000,
    timeout: 120 * 1000,
    reuseExistingServer: true,
  },
  testDir: './playwright-tests',
  /* Maximum time one test can run for. */
  timeout: 240 * 1000,
  expect: {
    timeout: 240 * 1000
  },
  /* run all tests, even those within a shared file, in parallel  */
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  workers: 8,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    browserName: 'chromium',
    headless: true,
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    baseURL: 'http://localhost:3000',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on',

    axeOptions: {
      rules: {
        // TODO: figure out how to ignore React Dev overlay that was triggering failure
        "frame-title": { enabled: false },
      },
    },

  },

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: 'test-results/',

  projects: [
    {
      name: 'URL',
      testMatch: /.*externalUrls.spec.ts/,
    },
    {
      name: 'E2E',
      testIgnore: /.*externalUrls.spec.ts/,
    },
  ],

};

export default config;


