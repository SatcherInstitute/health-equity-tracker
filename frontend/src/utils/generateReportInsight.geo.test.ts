import { beforeEach, describe, expect, test, vi } from 'vitest'
import { INCARCERATION_METRICS } from '../data/config/MetricConfigPDOH'
import type { MetricQuery } from '../data/query/MetricQuery'
import { RACE } from '../data/utils/Constants'
import { Fips } from '../data/utils/Fips'
import { previewReportInsight } from './generateReportInsight'

const queries: MetricQuery[] = []

vi.mock('./globals', () => ({
  getDataManager: () => ({
    loadMetrics: async (query: MetricQuery) => {
      queries.push(query)
      return { data: [], consumedDatasetIds: [], dataIsMissing: () => true }
    },
  }),
}))

vi.mock('./insightDescriptor', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./insightDescriptor')>()),
  fetchInsightPreview: vi.fn(async () => 'preview'),
}))

const prison = INCARCERATION_METRICS.find((c) => c.dataTypeId === 'prison')!

describe('report insight respects geoOverrides', () => {
  beforeEach(() => {
    queries.length = 0
  })

  test.each([
    ['national', '00'],
    ['state', '13'],
  ])('%s incarceration never queries a historical dataset', async (_geo, code) => {
    await previewReportInsight(prison, RACE, new Fips(code))
    expect(queries.length).toBeGreaterThan(0)
    expect(queries.filter((q) => q.timeView === 'historical')).toHaveLength(0)
  })

  test('county incarceration still queries its Vera history', async () => {
    await previewReportInsight(prison, RACE, new Fips('13001'))
    expect(queries.some((q) => q.timeView === 'historical')).toBe(true)
  })
})
