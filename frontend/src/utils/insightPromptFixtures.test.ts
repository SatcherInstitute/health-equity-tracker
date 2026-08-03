import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  type InsightPromptFixture,
  renderFixturePrompt,
} from './insightPromptFixtures'

// Fixtures live under server/ because the prompt templates are moving there in
// #5045. The Go implementation asserts against these same files, which is what
// makes the port checkable rather than trusted. This relative path is the
// temporary side of that arrangement.
const FIXTURE_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../server/testdata/insight_prompts',
)

const fixtureNames = readdirSync(FIXTURE_DIR)
  .filter((file) => file.endsWith('.json'))
  .map((file) => file.replace(/\.json$/, ''))
  .sort()

const load = (name: string): InsightPromptFixture =>
  JSON.parse(readFileSync(path.join(FIXTURE_DIR, `${name}.json`), 'utf8'))

const expectedPath = (name: string) =>
  path.join(FIXTURE_DIR, `${name}.prompt.txt`)

// Set when a prompt change is intentional. The resulting diff is the artifact to
// review: it shows every fixture the edit moved, which is also every cached
// insight it will displace.
const isUpdating = process.env.UPDATE_INSIGHT_PROMPTS === '1'

describe('insight prompt fixtures', () => {
  it('has fixtures to check', () => {
    expect(fixtureNames.length).toBeGreaterThan(0)
  })

  describe.each(fixtureNames)('%s', (name) => {
    const rendered = renderFixturePrompt(load(name))

    it('matches its committed prompt', () => {
      if (isUpdating) {
        writeFileSync(expectedPath(name), rendered, 'utf8')
        return
      }
      expect(rendered).toEqual(readFileSync(expectedPath(name), 'utf8'))
    })

    // The prompt is instructions, so its own reading level means nothing. What
    // is checkable offline is that the instruction survives: an edit that drops
    // it would raise the reading level of every insight users see, with nothing
    // else failing. Both spellings are in use across the templates.
    it('still asks for an 8th grade reading level', () => {
      expect(rendered).toMatch(/8th[- ]grade reading level/)
    })

    it('carries its data rather than asking for numbers it was never given', () => {
      expect(rendered.length).toBeGreaterThan(0)
      const hasDataBlock = /\n- |\bView [AB]\b|Current rates by/.test(rendered)
      expect(hasDataBlock).toBe(true)
    })
  })
})
