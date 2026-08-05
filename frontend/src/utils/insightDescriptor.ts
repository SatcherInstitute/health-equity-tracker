import type { MetricConfig } from '../data/config/MetricConfigTypes'
import type { DemographicType } from '../data/query/Breakdowns'
import type { HetRow } from '../data/utils/DatasetTypes'
import type {
  InsightContext,
  PeerComparison,
} from './generateVisualizationInsight'
import type { ScrollableHashId } from './hooks/useStepObserver'

const API_ENDPOINT = '/insight'

export type InsightResult = {
  content: string
  rateLimited: boolean
  error?: boolean
  // Generation is turned off or has hit its usage ceiling. Not an error: callers
  // render no insight section rather than surfacing anything to the reader.
  unavailable?: boolean
  // The key the insight was stored under, minted by the server and echoed back
  // so a reader can flag this exact insight.
  cacheKey?: string
}

// The two fields of a MetricConfig that reach the prompt, plus the nested
// population share the population-vs-distribution chart hangs off its rate
// config. Sending the whole MetricConfig would put chart-rendering concerns on
// the wire and make every unrelated config edit look like a prompt change.
export interface InsightMetric {
  metricId: string
  shortLabel: string
  populationComparisonMetric?: InsightMetric
}

export function toInsightMetric(config: MetricConfig): InsightMetric
export function toInsightMetric(
  config: MetricConfig | undefined,
): InsightMetric | undefined
export function toInsightMetric(
  config?: MetricConfig,
): InsightMetric | undefined {
  if (!config) return undefined
  const population = config.populationComparisonMetric
  return {
    metricId: config.metricId,
    shortLabel: config.shortLabel,
    populationComparisonMetric: population && {
      metricId: population.metricId,
      shortLabel: population.shortLabel,
    },
  }
}

// The data table's share columns, already resolved the way TableCard resolves
// them. Carried on the descriptor rather than re-derived server-side, since the
// insight describes the table the reader is looking at.
interface ShareColumns {
  shareConfig?: InsightMetric
  populationConfig?: InsightMetric
  generalPopulationLabel?: string
}

// Where the view lives. The server derives the cache key from these, so the
// params have to reach it as opaque text: URLSearchParams preserves insertion
// order where Go's url.Values encoder sorts, so a reparse on that side would
// mint a different key for the same view. stripReportInsightParam
// (server/insight_descriptor.go) splits on "&" and rejoins for exactly that
// reason, never parsing.
//
// The toString() round-trip below is not that reparse, and it is deliberate.
// buildInsightCacheKey did the same round-trip before this PR, so keeping it is
// what holds the warm cache in place; sending window.location.search raw would
// move the key of every URL whose escaping the round-trip normalizes.
interface ViewLocation {
  urlPathname: string
  urlParams: string
}

// The `report-insight` param is left in on purpose. The server strips it, and
// doing it in one place is what keeps the two implementations from drifting.
function currentViewLocation(): ViewLocation {
  return {
    urlPathname: window.location.pathname,
    urlParams: new URLSearchParams(window.location.search).toString(),
  }
}

interface CardDescriptor extends ShareColumns {
  kind: 'card'
  hashId: ScrollableHashId
  demographicType: DemographicType
  topic: string
  location: string
  metricConfig: InsightMetric
  rows: HetRow[]
  context?: InsightContext
  // Compare mode renders the same chart twice under one URL, so the second copy
  // needs its own scope or the two would share a cache entry.
  isCompareCard?: boolean
}

interface ContrastView {
  topic: string
  location: string
  metricConfig: InsightMetric
  rows: HetRow[]
}

interface ContrastDescriptor {
  kind: 'contrast'
  hashId: ScrollableHashId
  demographicType: DemographicType
  viewA: ContrastView
  viewB: ContrastView
}

export interface ReportSectionDescriptor extends ShareColumns {
  rows: HetRow[]
  // Overrides the report's own metric. The age-adjusted and unknown sections
  // read different metrics than the rate the rest of the report uses.
  metricConfig?: InsightMetric
  // Only the geographic section sets this. A county has no child places to
  // spread across, so a county report ranks the place against its siblings.
  peerComparison?: PeerComparison
}

interface ReportDescriptor {
  kind: 'report'
  demographicType: DemographicType
  topic: string
  location: string
  placeNoun: string
  metricConfig: InsightMetric
  sections: {
    demographic: ReportSectionDescriptor
    geographic: ReportSectionDescriptor
    temporal: ReportSectionDescriptor
    ageAdjusted: ReportSectionDescriptor
    unknown: ReportSectionDescriptor
  }
}

export type InsightDescriptor =
  | CardDescriptor
  | ContrastDescriptor
  | ReportDescriptor

// Posts what the view is showing and lets the server render the prompt, derive
// the key, and generate. The prompt never crosses the wire in either direction:
// wording lives in the server templates, so an edit takes effect without a
// client deploy, and a client cannot mint a key that disagrees with the prompt
// it is for.
export async function fetchInsight(
  descriptor: InsightDescriptor,
): Promise<InsightResult> {
  const baseApiUrl = import.meta.env.VITE_BASE_API_URL
  const url = baseApiUrl ? `${baseApiUrl}${API_ENDPOINT}` : API_ENDPOINT

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...descriptor, ...currentViewLocation() }),
    })

    if (response.status === 429) {
      return { content: '', rateLimited: true }
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch AI insight: ${response.statusText}`)
    }

    const insight = await response.json()
    if (insight.unavailable) {
      return { content: '', rateLimited: false, unavailable: true }
    }
    if (!insight.content) {
      throw new Error('No content returned from AI service')
    }

    return {
      content: insight.content.trim(),
      rateLimited: false,
      cacheKey: insight.cacheKey,
    }
  } catch (error) {
    console.error('Error fetching AI insight:', error)
    return { content: '', rateLimited: false, error: true }
  }
}
