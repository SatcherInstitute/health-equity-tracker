import { expect, test } from './utils/fixtures'

test('Methodology layout: left nav not truncated at narrow viewport', async ({
  page,
}) => {
  // Simulate a viewport narrowed by docked dev tools
  await page.setViewportSize({ width: 900, height: 800 })
  await page.goto('/methodology/ai-insights', {
    waitUntil: 'domcontentloaded',
  })

  const nav = page.getByRole('navigation', { name: 'methodology sections' })
  await expect(nav).toBeVisible()

  const navBox = await nav.boundingBox()
  expect(navBox).not.toBeNull()
  // Left edge of the nav should be within the viewport (not hidden off the left side)
  expect(navBox!.x).toBeGreaterThanOrEqual(0)

  // No horizontal overflow: scroll width should not exceed viewport width
  const scrollWidth = await page.evaluate(
    () => document.documentElement.scrollWidth,
  )
  const viewportWidth = await page.evaluate(() => window.innerWidth)
  expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 1)
})
