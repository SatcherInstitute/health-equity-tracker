import test, { expect } from '@playwright/test'

test('Verify CAWP denominators from external data source', async ({ page }) => {
  await page.goto(
    'https://www.ncsl.org/resources/details/number-of-legislators-and-length-of-terms-in-years',
  )

  try {
    const rowAS = await page.locator('tr', {
      has: page.locator('td:first-child:text("American Samoa Fono")'), // FIPS 60
    })
    const lastCellAS = await rowAS.locator('td:last-child').textContent()
    expect(lastCellAS?.trim()).toBe('39')

    const rowDC = await page.locator('tr', {
      has: page.locator('td:first-child:text("D.C. Council*")'), // FIPS 11
    })
    const lastCellDC = await rowDC.locator('td:last-child').textContent()
    expect(lastCellDC?.trim()).toBe('13')

    const rowGU = await page.locator('tr', {
      has: page.locator('td:first-child:text("Guam Senate*")'), // FIPS 66
    })
    const lastCellGU = await rowGU.locator('td:last-child').textContent()
    expect(lastCellGU?.trim()).toBe('15')

    const rowMP = await page.locator('tr', {
      has: page.locator('td:first-child:text("Northern Mariana Islands")'), // FIPS 69
    })
    const lastCellMP = await rowMP.locator('td:last-child').textContent()
    expect(lastCellMP?.trim()).toBe('29')

    const rowPR = await page.locator('tr', {
      has: page.locator('td:first-child:text("Puerto Rico")'), // FIPS 72
    })
    const lastCellPR = await rowPR.locator('td:last-child').textContent()
    expect(lastCellPR?.trim()).toBe('78')

    const rowVI = await page.locator('tr', {
      has: page.locator('td:first-child:text("U.S. Virgin Islands Senate*")'), // FIPS 78
    })
    const lastCellVI = await rowVI.locator('td:last-child').textContent()
    expect(lastCellVI?.trim()).toBe('15')
  } catch (e) {
    throw new Error(`❌ If this test fails, it means the data on the NCSL page has changed, meaning one or more territories have a new number of territorial legislators (counting both the local senate and house equivalents where applicable). We need to verify the new number and manually update our data/cawp territory files.

    Original error: ${e.message}`)
  }
})
