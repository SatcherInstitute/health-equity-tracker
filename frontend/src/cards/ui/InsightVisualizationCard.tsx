import { Button, CircularProgress } from '@mui/material'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import type { MetricQueryResponse } from '../../data/query/MetricQuery'
import { SHOW_INSIGHT_GENERATION } from '../../featureFlags'
import { generateCardInsight } from '../../utils/generateVisualizationInsight'
import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'
import {
  cardInsightOpenAtom,
  cardInsightsAtom,
  selectedDataTypeConfig1Atom,
  selectedDemographicTypeAtom,
  selectedFipsAtom,
} from '../../utils/sharedSettingsState'

interface InsightVisualizationCardProps {
  scrollToHash: ScrollableHashId
  queryResponses: MetricQueryResponse[]
}

export default function InsightVisualizationCard({
  scrollToHash,
  queryResponses,
}: InsightVisualizationCardProps) {
  const dataTypeConfig = useAtomValue(selectedDataTypeConfig1Atom)
  const fips = useAtomValue(selectedFipsAtom)
  const demographicType = useAtomValue(selectedDemographicTypeAtom)
  const [cardInsights, setCardInsights] = useAtom(cardInsightsAtom)
  const isOpen = useAtomValue(cardInsightOpenAtom)[scrollToHash] ?? false
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cacheKey = `${scrollToHash}-${dataTypeConfig?.dataTypeId ?? ''}-${fips?.code ?? ''}-${demographicType ?? ''}`
  const insight = cardInsights[cacheKey]

  useEffect(() => {
    if (!isOpen || insight || !dataTypeConfig || !demographicType) return
    void handleGenerate()
  }, [isOpen, cacheKey])

  async function handleGenerate() {
    if (!dataTypeConfig || !demographicType) return
    setIsGenerating(true)
    setError(null)
    try {
      const result = await generateCardInsight(
        scrollToHash,
        dataTypeConfig,
        demographicType,
        fips ?? undefined,
        queryResponses,
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
  }

  if (!SHOW_INSIGHT_GENERATION || !dataTypeConfig || !isOpen) return null

  return (
    <div className='mb-3 rounded-md bg-green-50 p-3'>
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
