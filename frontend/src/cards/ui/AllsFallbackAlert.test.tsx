import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import AllsFallbackAlert from './AllsFallbackAlert'

// Regression for #4997: the AllsFallbackAlert cannot be triggered reliably via
// URL params (MadLib normalizes invalid demo values before data fetching), so
// this unit test verifies the component renders the correct message text.

test('renders fallback notice for age demographic', () => {
  render(
    <AllsFallbackAlert
      dataName='Preventable Hospitalizations'
      demographicType='age'
    />,
  )
  const notice = screen.getByRole('note')
  expect(notice.textContent).toMatch(/isn't available for/i)
  expect(notice.textContent).toContain('age')
  expect(notice.textContent).toContain('Preventable Hospitalizations')
})

test('renders fallback notice for sex demographic', () => {
  render(
    <AllsFallbackAlert dataName='Non-Medical Drug Use' demographicType='sex' />,
  )
  const notice = screen.getByRole('note')
  expect(notice.textContent).toMatch(/isn't available for/i)
  expect(notice.textContent).toContain('sex')
  expect(notice.textContent).toContain('Non-Medical Drug Use')
})
