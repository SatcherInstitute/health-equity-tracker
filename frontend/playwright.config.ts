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
    reuseExistingServer: !process.env.CI,
  },
  testDir: './playwright-tests',
  /* Maximum time one test can run for. */
  timeout: 120 * 1000,

  /* run all tests, even those within a shared file, in parallel  */
  fullyParallel: true,
  retries: process.env.CI ? 2 : 1,
  reporter: [
    [process.env.CI ? 'github' : 'list'],
    ['html']
  ],

  workers: 2,// process.env.CI ? 2 : 4,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    browserName: 'chromium',
    headless: true,
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    baseURL: 'http://localhost:3000',
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
      name: 'E2E',
      testIgnore: /.*externalUrls.spec.ts/,
    },
  ],

};

export default config;


