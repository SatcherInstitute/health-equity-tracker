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
    command: 'npm run start:deploy_preview',
    port: 3000,
    timeout: 60 * 1000,
    reuseExistingServer: true,
  },
  testDir: './playwright-tests',
  /* Maximum time one test can run for, default was 30s. */
  timeout: 120 * 1000,
  /* Maximum time one "expect" can run for, default was 5 seconds and was too quick */
  expect: {
    timeout: 60 * 1000
  },
  /* run all tests, even those within a shared file, in parallel  */
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    [process.env.CI ? 'github' : 'list'],
    ['html']
  ],


  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    browserName: 'chromium',
    headless: true,
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    axeOptions: {
      rules: {
        // TODO: figure out how to ignore React Dev overlay that was triggering failure
        "frame-title": { enabled: false },
      },
    },

  },

  projects: [
    {
      name: 'URL',
      testMatch: /.*externalUrls.spec.ts/,
    },
    {

      name: 'E2E_NIGHTLY',
      testMatch: /.*nightly.spec.ts/,
    },
  ],

};

export default config;


