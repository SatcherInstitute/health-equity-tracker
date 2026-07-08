#!/usr/bin/env tsx
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { parseArgs } from 'node:util'

const VIEWPORTS = [
  { width: 375, label: 'Mobile' },
  { width: 768, label: 'Tablet' },
  { width: 1280, label: 'Desktop' },
]

function pathToSlug(route: string): string {
  return (
    route.split('?')[0].replace(/\/+$/, '').replace(/^\//, '').replace(/\//g, '-') || 'home'
  )
}

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    'base-url': { type: 'string' },
    'output-dir': { type: 'string' },
    routes: { type: 'string', multiple: true },
  },
})

const baseUrl = values['base-url']
const outputDir = values['output-dir']
const routes = values['routes'] ?? ['/']

if (!baseUrl || !outputDir) {
  console.error(
    'Usage: take-screenshots.ts --base-url <url> --output-dir <path> [--routes <path> ...]',
  )
  process.exit(1)
}

mkdirSync(outputDir, { recursive: true })

const browser = await chromium.launch()
const context = await browser.newContext()
const page = await context.newPage()

for (const route of routes) {
  try {
    const slug = pathToSlug(route)
    const url = `${baseUrl}${route}`

    for (const { width, label } of VIEWPORTS) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(url, { waitUntil: 'networkidle' })
      await page.addStyleTag({
        content:
          '*, *::before, *::after { animation: none !important; transition: none !important; }',
      })
      await page.waitForTimeout(1000)

      const filename = `${slug}-${width}px.png`
      const filepath = join(outputDir, filename)
      await page.screenshot({ fullPage: true, path: filepath })
      console.info(`  [${label} ${width}px] ${filename}`)
    }
  } catch (error) {
    console.error(`  [Error] Failed to capture ${route}:`, error)
  }
}

await browser.close()
console.info(
  `\nDone — ${routes.length * VIEWPORTS.length} screenshots saved to ${outputDir}`,
)
