import { expect, test } from './utils/fixtures'

// Regression for #4997.
//
// AllsFallbackAlert renders when a topic has no dataset for the active
// demographic but does have an alls_ fallback. This only surfaces reliably in
// comparevars mode: when hiv_black_women (age-only) is compared with
// women_in_gov (race-only), both panels share demo=age from the URL. The
// women_in_gov panel has no age dataset so resolveDatasetId falls back to alls_
// and cards render AllsFallbackAlert.

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
})
