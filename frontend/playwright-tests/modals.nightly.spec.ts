import { test, expect } from '@playwright/test'

test('Topic Info Modal from Sidebar', async ({ page }) => {
  // Compare Topics Page Loads
  await page.goto(
    'https://healthequitytracker.org/exploredata?mls=1.incarceration-3.poverty-5.13&mlp=comparevars&dt1=prison',
    { waitUntil: 'commit' }
  )

  // Clicking topic info modal button launched modal
  await page.getByRole('button', { name: 'open the topic info modal' }).click()
  await expect(page).toHaveURL(/.*topic-info=true/)

  // clicking methodology link takes directly to #hiv section
  await page.getByRole('link', { name: 'methodology' }).click()
  const IncarcerationSubheading = page.getByRole('heading', {
    name: 'Incarceration',
    exact: true,
  })
  await expect(IncarcerationSubheading).toBeInViewport()
  await expect(page).toHaveURL(/.*methodology#incarceration/)

  // browser back button takes you back to the open topic modal
  page.goBack()

  // CLOSE modal
  await page.getByRole('button', { name: 'close topic info modal' }).click()
  await expect(page).not.toHaveURL(/.*topic-info=true/)
})
