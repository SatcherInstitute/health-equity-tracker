import { Button, CircularProgress } from '@mui/material'
import { useAtom, useAtomValue } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import type { DataTypeConfig } from '../../data/config/MetricConfigTypes'
import type { DemographicType } from '../../data/query/Breakdowns'
import type { MetricQueryResponse } from '../../data/query/MetricQuery'
import { useMetrics } from '../../data/react/useResources'
import type { DemographicGroup } from '../../data/utils/Constants'
import type { Fips } from '../../data/utils/Fips'
import { SHOW_INSIGHT_GENERATION } from '../../featureFlags'
import type {
  InsightDataStatus,
  InsightPeerConfig,
  PeerComparison,
} from '../../utils/generateVisualizationInsight'
import {
  buildInsightFocusSuffix,
  generateCardInsight,
  INSIGHT_CACHE_VERSION,
  summarizePeerComparison,
} from '../../utils/generateVisualizationInsight'
import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'
import {
  cardInsightOpenAtom,
  cardInsightsAtom,
} from '../../utils/sharedSettingsState'
import FlagInsightButton from './FlagInsightButton'

interface InsightVisualizationCardProps {
  scrollToHash: ScrollableHashId
  queryResponses: MetricQueryResponse[]
  fips: Fips
  dataTypeConfig: DataTypeConfig
  demographicType: DemographicType
  isCompareCard?: boolean
  activeDemographicGroup?: DemographicGroup
  selectedGroups?: DemographicGroup[]
  // How much comparison this insight has to work with (see getInsightDataStatus).
  dataStatus: InsightDataStatus
  // Supplied for single-region maps: lets this card lazily fetch the region's
  // same-level peers and rank against them instead of hiding.
  peerConfig?: InsightPeerConfig
  // The selected region's own overall rate, resolved by CardWrapper.
  regionRate?: { label: string; value: number; shortLabel: string }
}

export default function InsightVisualizationCard({
  scrollToHash,
  queryResponses,
  fips,
  dataTypeConfig,
  demographicType,
  isCompareCard,
  activeDemographicGroup,
  selectedGroups,
  dataStatus,
  peerConfig,
  regionRate,
}: InsightVisualizationCardProps) {
  const [cardInsights, setCardInsights] = useAtom(cardInsightsAtom)
  const openKey = `${scrollToHash}${isCompareCard ? '-2' : ''}`
  const isOpen = useAtomValue(cardInsightOpenAtom)[openKey] ?? false
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // The exact server cache key used, captured so the flag button targets this insight.
  const [serverCacheKey, setServerCacheKey] = useState<string | null>(null)

  // Single-region maps rank the region against its same-level peers. The peer
  // file is fetched here, lazily, and only once the insight is actually opened —
  // so multi-region maps and unopened insights never trigger the extra load.
  const peerMode =
    dataStatus === 'single-region' && Boolean(peerConfig) && Boolean(regionRate)
  const peerResponses = useMetrics(
    peerMode && isOpen && peerConfig ? [peerConfig.peerQuery] : [],
  )
  // Require the peer query to have actually resolved — not just any array.
  // useMetrics keeps its prior value (the empty [] from before the insight was
  // opened) until the new fetch lands, so `Array.isArray` alone is true during
  // that window and would let the insight generate before peers arrive.
  const peersReady = Array.isArray(peerResponses) && peerResponses.length > 0
  const peersLoading = peerMode && isOpen && peerResponses === 'loading'
  const peersErrored = peerMode && isOpen && peerResponses === 'error'
  const peerComparison: PeerComparison | undefined =
    peerMode &&
    peerConfig &&
    regionRate &&
    peersReady &&
    peerResponses.length > 0
      ? {
          regionLabel: regionRate.label,
          regionValue: regionRate.value,
          peerNoun: peerConfig.peerNoun,
          peerValues: peerConfig.getPeerValues(peerResponses),
          shortLabel: regionRate.shortLabel,
        }
      : undefined
  // Peers loaded, but too few report the measure to rank against honestly.
  const peerInsufficient =
    peerMode &&
    peersReady &&
    peerResponses.length > 0 &&
    (!peerComparison || summarizePeerComparison(peerComparison) === null)

  // A stable suffix so the insight regenerates when the user changes which
  // group(s) the chart is focused on (highlighted map group / selected trend
  // legend lines) — those change the data the model sees. Shared with the server
  // cache key in generateCardInsight so both caches key on focus identically.
  const focusSuffix = buildInsightFocusSuffix({
    activeDemographicGroup,
    selectedGroups,
  })
  const cacheKey = `${scrollToHash}-${dataTypeConfig.dataTypeId}-${fips.code}-${demographicType}${isCompareCard ? '-2' : ''}${focusSuffix ? `-${focusSuffix}` : ''}-${INSIGHT_CACHE_VERSION}`
  const insight = cardInsights[cacheKey]

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true)
    setError(null)
    try {
      const result = await generateCardInsight(
        scrollToHash,
        dataTypeConfig,
        demographicType,
        fips,
        queryResponses,
        isCompareCard,
        { activeDemographicGroup, selectedGroups, peerComparison },
      )
      setServerCacheKey(result.cacheKey ?? null)
      if (result.rateLimited) {
        setError('Too many requests. Please wait a moment and try again.')
      } else if (result.error) {
        setError('Unable to generate insight. Please try again.')
      } else {
        setCardInsights((prev) => ({ ...prev, [cacheKey]: result.content }))
      }
    } finally {
      setIsGenerating(false)
    }
  }, [
    cacheKey,
    dataTypeConfig,
    demographicType,
    fips,
    isCompareCard,
    queryResponses,
    scrollToHash,
    setCardInsights,
    activeDemographicGroup,
    selectedGroups,
    peerComparison,
  ])

  const handleFlagged = () => {
    // Drop the cached insight so a fresh one regenerates in its place. Flagging records
    // the bad output for review but does not hide this data combination — clearing the
    // entry makes the auto-generate effect below fire again for a new insight.
    setCardInsights((prev) => {
      const next = { ...prev }
      delete next[cacheKey]
      return next
    })
  }

  // Reset error and flag state when the cacheKey changes (user switched
  // demographic, fips, etc.) — otherwise stale state from old params would
  // block generation for the new ones.
  useEffect(() => {
    setError(null)
  }, [cacheKey])

  // `error` is in the guard so a failed call doesn't get auto-retried on the
  // next render — the user must click Try again. Clearing the insight (e.g. after
  // flagging) re-fires this effect and regenerates. In peer mode we also wait for
  // the peer fetch to resolve and skip generation when too few peers report.
  useEffect(() => {
    if (!isOpen || insight || error || isGenerating) return
    if (peerMode && (!peersReady || peerInsufficient)) return
    void handleGenerate()
  }, [
    isOpen,
    insight,
    error,
    isGenerating,
    cacheKey,
    handleGenerate,
    peerMode,
    peersReady,
    peerInsufficient,
  ])

  if (!SHOW_INSIGHT_GENERATION || !isOpen) return null

  return (
    <div
      role='status'
      className='mb-3 animate-expand-down rounded-md bg-footer-color p-3'
    >
      {isGenerating || peersLoading ? (
        <div className='flex items-center gap-2 py-1'>
          <CircularProgress size={14} className='shrink-0' />
          <p className='m-0 text-alt-dark text-small'>
            Analyzing health equity data with AI...
          </p>
        </div>
      ) : peersErrored ? (
        <p className='m-0 text-red-orange text-small'>
          Unable to load comparison data. Please try again later.
        </p>
      ) : peerInsufficient ? (
        <p className='m-0 text-alt-dark text-small'>
          Not enough comparable places report this measure to generate an
          insight.
        </p>
      ) : error ? (
        <div className='flex flex-col gap-1'>
          <p className='m-0 text-red-orange text-small'>{error}</p>
          <Button size='small' onClick={handleGenerate}>
            Try again
          </Button>
        </div>
      ) : insight ? (
        <>
          <p className='m-0 font-bold text-alt-dark leading-snug'>{insight}</p>
          <p className='m-0 mt-2 text-alt-dark text-smallest'>
            AI-generated. Verify with chart data.{' '}
            <FlagInsightButton
              cacheKey={serverCacheKey ?? undefined}
              content={insight}
              topic={dataTypeConfig.dataTypeId}
              onFlagged={handleFlagged}
            />
          </p>
        </>
      ) : null}
    </div>
  )
}
