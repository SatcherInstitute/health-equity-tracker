import { expect, test } from './utils/fixtures'

// Regression for #4997 and #4999.
//
// AllsFallbackAlert renders when a topic has no dataset for the active
// demographic but does have an alls_ fallback. This only surfaces reliably in
// comparevars mode: when hiv_black_women (age-only) is compared with
// women_in_gov (race-only), both panels share demo=age from the URL. The
// women_in_gov panel has no age dataset so resolveDatasetId falls back to alls_
// and cards render AllsFallbackAlert.
//
// #4999: a label-transform bug caused the alls_ trend line to render blank even
// though the data was present. The second assertion guards against regression.

test('ALLs fallback alert visible in comparevars when demographic unavailable', async ({
  page,
}) => {
  await page.goto(
    '/exploredata?mls=1.hiv_black_women-3.women_in_gov-5.00&mlp=comparevars&dt1=hiv_prevalence_black_women&dt2=women_in_us_congress',
    { waitUntil: 'domcontentloaded' },
  )

  await expect(
    page.getByText(/isn't available for/i).first(),
  ).toBeVisible({ timeout: 40000 })

  // The alls_ trend line must actually render (not just the alert with an empty
  // chart). Use .last() to target the women_in_gov rates-over-time panel.
  const womenGovTrend = page.locator('#rates-over-time').last()
  await womenGovTrend.scrollIntoViewIfNeeded()
  await expect(womenGovTrend.locator('svg').first()).toBeVisible({
    timeout: 20000,
  })
  await expect(womenGovTrend.getByText(/Graph unavailable/i)).toHaveCount(0)
})
