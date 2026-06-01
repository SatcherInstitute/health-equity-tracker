import { Button, CircularProgress } from '@mui/material'
import { useAtom, useAtomValue } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import type { DataTypeConfig } from '../../data/config/MetricConfigTypes'
import type { DemographicType } from '../../data/query/Breakdowns'
import type { MetricQueryResponse } from '../../data/query/MetricQuery'
import type { Fips } from '../../data/utils/Fips'
import { SHOW_INSIGHT_GENERATION } from '../../featureFlags'
import { generateCardInsight } from '../../utils/generateVisualizationInsight'
import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'
import {
  cardInsightOpenAtom,
  cardInsightsAtom,
} from '../../utils/sharedSettingsState'

interface InsightVisualizationCardProps {
  scrollToHash: ScrollableHashId
  queryResponses: MetricQueryResponse[]
  fips: Fips
  dataTypeConfig: DataTypeConfig
  demographicType: DemographicType
  isCompareCard?: boolean
}

export default function InsightVisualizationCard({
  scrollToHash,
  queryResponses,
  fips,
  dataTypeConfig,
  demographicType,
  isCompareCard,
}: InsightVisualizationCardProps) {
  const [cardInsights, setCardInsights] = useAtom(cardInsightsAtom)
  const openKey = `${scrollToHash}${isCompareCard ? '-2' : ''}`
  const isOpen = useAtomValue(cardInsightOpenAtom)[openKey] ?? false
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cacheKey = `${scrollToHash}-${dataTypeConfig.dataTypeId}-${fips.code}-${demographicType}${isCompareCard ? '-2' : ''}`
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
      )
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
  ])

  // `error` is in the guard so a failed call doesn't get auto-retried on the
  // next render — the user must click Try again.
  useEffect(() => {
    if (!isOpen || insight || error || isGenerating) return
    void handleGenerate()
  }, [isOpen, insight, error, isGenerating, cacheKey, handleGenerate])

  if (!SHOW_INSIGHT_GENERATION || !isOpen) return null

  return (
    <div className='mb-3 animate-expand-down rounded-md bg-footer-color p-3'>
      {isGenerating ? (
        <div className='flex items-center gap-2 py-1'>
          <CircularProgress size={14} className='shrink-0' />
          <p className='m-0 text-alt-dark text-small'>
            Analyzing health equity data with AI...
          </p>
        </div>
      ) : error ? (
        <div className='flex flex-col gap-1'>
          <p className='m-0 text-red-500 text-small'>{error}</p>
          <Button size='small' onClick={handleGenerate}>
            Try again
          </Button>
        </div>
      ) : (
        <>
          <p className='m-0 font-bold text-alt-dark leading-snug'>{insight}</p>
          <p className='m-0 mt-2 text-alt-dark text-smallest'>
            AI-generated synthesis powered by the Claude API. Always verify
            findings with the source data shown in the charts above.
          </p>
        </>
      )}
    </div>
  )
}
