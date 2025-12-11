import { test as base } from '@playwright/test'

// Extend the base test to include our performance optimizations
export const test = base.extend({
  page: async ({ page }, use) => {
    // 1. Block heavy network requests (Images, Fonts, SVGs)
    await page.route('**/*.{png,jpg,jpeg,svg,woff,woff2}', (route) =>
      route.abort(),
    )

    // 2. Kill all animations and transitions
    await page.addStyleTag({
      content: `*, *::before, *::after { animation: none !important; transition: none !important; }`,
    })

    // 3. Use the optimized page in the test
    await use(page)
  },
})

// Re-export expect so you only need one import in your test files
export { expect } from '@playwright/test'