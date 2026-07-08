/// <reference types="node" />
import { devices, type PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
  webServer: {
    // CI: serve the already-built dist (starts in ~2s, same bundle the build step just produced).
    // Locally: use the dev server so developers don't need to build first.
    command: process.env.CI
      ? 'npx vite preview --port 3000'
      : 'npm run start:deploy_preview',
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
    permissions: ['clipboard-read', 'clipboard-write'],
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
    // Nightly matrix: mobile/tablet viewports and cross-browser smoke tests.
    // None of these run on PR CI — they are invoked only by e2eScheduled.yml.
    {
      name: 'MOBILE_NIGHTLY',
      testMatch: /.*mobile\.spec\.ts/,
      use: { ...devices['iPhone 13'] },
    },
    {
      name: 'TABLET_NIGHTLY',
      testMatch: /.*mobile\.spec\.ts/,
      use: { ...devices['iPad (gen 7)'] },
    },
    // Firefox and WebKit reject clipboard-* permissions at context/page
    // creation, and no .ci spec uses the clipboard, so grant none here.
    {
      name: 'FIREFOX_NIGHTLY',
      testMatch: /.*\.ci\.spec\.ts/,
      use: { browserName: 'firefox', permissions: [] },
    },
    {
      name: 'WEBKIT_NIGHTLY',
      testMatch: /.*\.ci\.spec\.ts/,
      use: { browserName: 'webkit', permissions: [] },
    },
  ],
}

export default config
