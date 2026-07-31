import { describe, expect, it } from 'vitest'
import type { PeerComparison } from '../../utils/generateVisualizationInsight'
import {
  type InsightState,
  initialInsightState,
  insightReducer,
} from './InsightVisualizationCard'

const fakePeers: PeerComparison = {
  regionLabel: 'Bartow County',
  regionValue: 12,
  peerNoun: 'Georgia counties',
  peerValues: [8, 10, 14],
  shortLabel: 'per 100k',
}

describe('insightReducer reset', () => {
  it('clears the server cache key so the flag button cannot submit the previous insight', () => {
    const state: InsightState = {
      ...initialInsightState,
      serverCacheKey: 'previous-key',
    }
    expect(insightReducer(state, { type: 'reset' }).serverCacheKey).toBeNull()
  })

  it('keeps peerComparison, which is scoped to the region rather than the cache key', () => {
    const state: InsightState = {
      ...initialInsightState,
      peerComparison: fakePeers,
    }
    expect(insightReducer(state, { type: 'reset' }).peerComparison).toBe(
      fakePeers,
    )
  })

  it('returns terminal statuses to idle so generation can run for the new cache key', () => {
    for (const status of ['errored', 'unavailable'] as const) {
      const state: InsightState = {
        ...initialInsightState,
        status,
        error: 'boom',
      }
      const next = insightReducer(state, { type: 'reset' })
      expect(next.status).toBe('idle')
      expect(next.error).toBeNull()
    }
  })

  it('leaves in-flight statuses alone', () => {
    for (const status of ['generating', 'loadingPeers'] as const) {
      const state: InsightState = { ...initialInsightState, status }
      expect(insightReducer(state, { type: 'reset' }).status).toBe(status)
    }
  })
})

describe('insightReducer peer transitions', () => {
  it('drops any stale ranking when a new peer fetch starts', () => {
    const state: InsightState = {
      ...initialInsightState,
      peerComparison: fakePeers,
    }
    const next = insightReducer(state, { type: 'peersRequested' })
    expect(next.status).toBe('loadingPeers')
    expect(next.peerComparison).toBeNull()
  })

  it('returns to idle with the ranking attached once peers load', () => {
    const next = insightReducer(
      { ...initialInsightState, status: 'loadingPeers' },
      { type: 'peersLoaded', peerComparison: fakePeers },
    )
    expect(next.status).toBe('idle')
    expect(next.peerComparison).toBe(fakePeers)
  })
})

describe('insightReducer generation transitions', () => {
  it('clears a prior error when generation starts', () => {
    const state: InsightState = {
      ...initialInsightState,
      status: 'errored',
      error: 'boom',
    }
    const next = insightReducer(state, { type: 'generationStarted' })
    expect(next.status).toBe('generating')
    expect(next.error).toBeNull()
  })

  it('captures the server cache key on both success and failure', () => {
    expect(
      insightReducer(initialInsightState, {
        type: 'generationSucceeded',
        serverCacheKey: 'abc',
      }),
    ).toMatchObject({ status: 'idle', serverCacheKey: 'abc' })

    expect(
      insightReducer(initialInsightState, {
        type: 'generationFailed',
        serverCacheKey: 'abc',
        error: 'boom',
      }),
    ).toMatchObject({ status: 'errored', serverCacheKey: 'abc', error: 'boom' })
  })
})
