// cSpell:ignore unstub
import type { MetricConfig } from '../data/config/MetricConfigTypes'
import {
  fetchInsight,
  type InsightDescriptor,
  toInsightMetric,
} from './insightDescriptor'

const CARD: InsightDescriptor = {
  kind: 'card',
  hashId: 'rate-map',
  demographicType: 'race_and_ethnicity',
  topic: 'HIV diagnoses',
  location: 'Georgia',
  metricConfig: { metricId: 'rate', shortLabel: 'per 100k' },
  rows: [],
}

function respondWith(body: unknown, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: String(status),
    json: async () => body,
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('toInsightMetric', () => {
  test('carries only the two fields that reach the prompt', () => {
    const config = {
      metricId: 'rate',
      shortLabel: 'per 100k',
      chartTitle: 'not sent',
      type: 'per100k',
    } as unknown as MetricConfig

    expect(toInsightMetric(config)).toEqual({
      metricId: 'rate',
      shortLabel: 'per 100k',
      populationComparisonMetric: undefined,
    })
  })

  test('flattens the nested population comparison metric', () => {
    const config = {
      metricId: 'share_pct',
      shortLabel: '% of cases',
      populationComparisonMetric: {
        metricId: 'pop_pct',
        shortLabel: '% of population',
        chartTitle: 'not sent',
      },
    } as unknown as MetricConfig

    expect(toInsightMetric(config).populationComparisonMetric).toEqual({
      metricId: 'pop_pct',
      shortLabel: '% of population',
    })
  })

  test('passes undefined through so callers can forward an absent config', () => {
    expect(toInsightMetric(undefined)).toBeUndefined()
  })
})

describe('fetchInsight', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  test('returns the content and the server-minted cache key', async () => {
    respondWith({ content: '  Rates are highest in Fulton.  ', cacheKey: 'k1' })

    expect(await fetchInsight(CARD)).toEqual({
      content: 'Rates are highest in Fulton.',
      rateLimited: false,
      cacheKey: 'k1',
    })
  })

  // The server derives the cache key from these, so they have to be the
  // browser's own strings rather than anything reconstructed.
  test('posts the descriptor alongside the current pathname and params', async () => {
    const fetchMock = respondWith({ content: 'text', cacheKey: 'k1' })
    window.history.pushState(
      {},
      '',
      '/exploredata?mls=1.hiv-3.00&mlp=disparity',
    )

    await fetchInsight(CARD)

    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.kind).toBe('card')
    expect(body.urlPathname).toBe('/exploredata')
    expect(body.urlParams).toBe('mls=1.hiv-3.00&mlp=disparity')
  })

  // report-insight is sent un-stripped on purpose: the server strips it before
  // keying, and doing that in one place is what keeps the two from drifting.
  test('leaves report-insight in the params it sends', async () => {
    const fetchMock = respondWith({ content: 'text', cacheKey: 'k1' })
    window.history.pushState(
      {},
      '',
      '/exploredata?mls=1.hiv-3.00&report-insight=true',
    )

    await fetchInsight(CARD)

    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.urlParams).toContain('report-insight=true')
  })

  test('reports a 429 as rate limited rather than an error', async () => {
    respondWith({}, 429)

    expect(await fetchInsight(CARD)).toEqual({ content: '', rateLimited: true })
  })

  // Generation is off or at its usage ceiling. Callers render no insight
  // section rather than surfacing anything to the reader, so this is not an error.
  test('passes an unavailable response through as its own state', async () => {
    respondWith({ unavailable: true })

    expect(await fetchInsight(CARD)).toEqual({
      content: '',
      rateLimited: false,
      unavailable: true,
    })
  })

  test('reports an error for a non-ok response', async () => {
    respondWith({}, 500)

    expect(await fetchInsight(CARD)).toEqual({
      content: '',
      rateLimited: false,
      error: true,
    })
  })

  test('reports an error when the response carries no content', async () => {
    respondWith({ cacheKey: 'k1' })

    expect(await fetchInsight(CARD)).toEqual({
      content: '',
      rateLimited: false,
      error: true,
    })
  })

  test('reports an error when the request itself fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))

    expect(await fetchInsight(CARD)).toEqual({
      content: '',
      rateLimited: false,
      error: true,
    })
  })
})
