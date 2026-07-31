import { describe, expect, it } from 'vitest'
import { buildInsightCacheKey } from './insightCacheKey'

const PROMPT = 'Rate map of HIV in Georgia\n- Fulton (All): 41.2 per 100k'

describe('buildInsightCacheKey', () => {
  it('returns the same key for the same prompt, so an unchanged pipeline run keeps the cache warm', () => {
    expect(buildInsightCacheKey('#rate-map', PROMPT)).toBe(
      buildInsightCacheKey('#rate-map', PROMPT),
    )
  })

  it('changes the key when the data rows change, invalidating without a version bump', () => {
    const refreshed = PROMPT.replace('41.2', '43.8')
    expect(buildInsightCacheKey('#rate-map', refreshed)).not.toBe(
      buildInsightCacheKey('#rate-map', PROMPT),
    )
  })

  it('changes the key when only the template wording changes', () => {
    expect(
      buildInsightCacheKey('#rate-map', `Write one sentence.\n${PROMPT}`),
    ).not.toBe(buildInsightCacheKey('#rate-map', PROMPT))
  })

  it('separates insights that share a URL but not a view scope', () => {
    const card = buildInsightCacheKey('#rate-map', PROMPT)
    const compareCard = buildInsightCacheKey('#rate-map-2', PROMPT)
    const contrast = buildInsightCacheKey('#rate-map-contrast', PROMPT)
    const report = buildInsightCacheKey('', PROMPT)
    expect(new Set([card, compareCard, contrast, report]).size).toBe(4)
  })

  it('keeps the URL readable so a flagged key identifies its report', () => {
    expect(buildInsightCacheKey('#rate-map', PROMPT)).toContain(
      `${window.location.pathname}?`,
    )
  })

  it('ends in an 8-char hex hash', () => {
    expect(buildInsightCacheKey('#rate-map', PROMPT)).toMatch(/-[0-9a-f]{8}$/)
  })

  it('hashes non-ASCII prompt text without collapsing distinct prompts', () => {
    const enDash = 'range 3.1–61.0 per 100k'
    const hyphen = 'range 3.1-61.0 per 100k'
    expect(buildInsightCacheKey('', enDash)).not.toBe(
      buildInsightCacheKey('', hyphen),
    )
  })
})
