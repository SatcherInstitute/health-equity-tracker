import { Button, CircularProgress } from '@mui/material'
import { useAtom, useAtomValue } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import type { DataTypeConfig } from '../../data/config/MetricConfigTypes'
import type { DemographicType } from '../../data/query/Breakdowns'
import type { MetricQueryResponse } from '../../data/query/MetricQuery'
import { ALL, type DemographicGroup } from '../../data/utils/Constants'
import type { Fips } from '../../data/utils/Fips'
import { SHOW_INSIGHT_GENERATION } from '../../featureFlags'
import { generateCardInsight } from '../../utils/generateVisualizationInsight'
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
}: InsightVisualizationCardProps) {
  const [cardInsights, setCardInsights] = useAtom(cardInsightsAtom)
  const openKey = `${scrollToHash}${isCompareCard ? '-2' : ''}`
  const isOpen = useAtomValue(cardInsightOpenAtom)[openKey] ?? false
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // The exact server cache key used, captured so the flag button targets this insight.
  const [serverCacheKey, setServerCacheKey] = useState<string | null>(null)

  // A stable suffix so the insight regenerates when the user changes which
  // group(s) the chart is focused on (highlighted map group / selected trend
  // legend lines) — those change the data the model sees.
  const focusSuffix = [
    activeDemographicGroup && activeDemographicGroup !== ALL
      ? activeDemographicGroup
      : '',
    selectedGroups && selectedGroups.length > 0
      ? [...selectedGroups].sort().join(',')
      : '',
  ]
    .filter(Boolean)
    .join('|')
  const cacheKey = `${scrollToHash}-${dataTypeConfig.dataTypeId}-${fips.code}-${demographicType}${isCompareCard ? '-2' : ''}${focusSuffix ? `-${focusSuffix}` : ''}`
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
        { activeDemographicGroup, selectedGroups },
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
  // flagging) re-fires this effect and regenerates.
  useEffect(() => {
    if (!isOpen || insight || error || isGenerating) return
    void handleGenerate()
  }, [isOpen, insight, error, isGenerating, cacheKey, handleGenerate])

  if (!SHOW_INSIGHT_GENERATION || !isOpen) return null

  return (
    <div
      role='status'
      className='mb-3 animate-expand-down rounded-md bg-footer-color p-3'
    >
      {isGenerating ? (
        <div className='flex items-center gap-2 py-1'>
          <CircularProgress size={14} className='shrink-0' />
          <p className='m-0 text-alt-dark text-small'>
            Analyzing health equity data with AI...
          </p>
        </div>
      ) : error ? (
        <div className='flex flex-col gap-1'>
          <p className='m-0 text-red-orange text-small'>{error}</p>
          <Button size='small' onClick={handleGenerate}>
            Try again
          </Button>
        </div>
      ) : (
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
      )}
    </div>
  )
}
