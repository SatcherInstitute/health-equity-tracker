import { test } from '@playwright/test'

test('HIV conditions and medication adherence', async ({ page }) => {
    await page.goto('/exploredata?mls=1.medicare_hiv-3.00&group1=All&dt1=medicare_hiv')

    await page.getByText('Investigate rates of', { exact: true }).click()

    await page.locator('#rate-map').getByText('Race and Ethnicity:').click()
    await page.locator('.MuiBackdrop-root').click()
    await page.locator('#rate-map').getByRole('heading', { name: 'Rates of HIV cases in the United States' }).click()
    await page.locator('#rate-map').getByRole('heading', { name: 'Medicare beneficiaries' }).click()


    await page.locator('#rate-chart').getByRole('heading', { name: 'Rates of HIV cases in the United States' }).click()
    await page.locator('#rate-chart').getByRole('heading', { name: 'Medicare beneficiaries' }).click()
    await page.locator('#rate-chart').getByText('Sources: Medication').click()

    await page.locator('#unknown-demographic-map').getByRole('heading', { name: 'Share of total beneficiaries living with HIV with unknown race and ethnicity in the United States' }).click()
    await page.locator('#unknown-demographic-map').getByRole('heading', { name: 'Medicare beneficiaries' }).click()
    await page.locator('#unknown-demographic-map').getByText('% of beneficiary pop. living with HIV reported an unknown race or ethnicity in the United States overall. This map displays data for cases where either race or ethnicity was unknown.').click()

    await page.locator('#population-vs-distribution').getByRole('heading', { name: 'Share of beneficiary population vs. share of total HIV cases in the United States' }).click()
    await page.locator('#population-vs-distribution').getByRole('heading', { name: 'Medicare beneficiaries' }).click()
    await page.locator('#population-vs-distribution').getByText('View methodology.').click()

    await page.locator('#data-table').getByRole('heading', { name: 'Breakdown summary for HIV cases in the United States' }).click()
    await page.locator('#data-table').getByRole('heading', { name: 'Medicare beneficiaries' }).click()
    await page.locator('#data-table').getByLabel('Card export options').click()
})