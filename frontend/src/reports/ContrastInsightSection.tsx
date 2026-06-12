import CompareArrows from '@mui/icons-material/CompareArrows'
import { Button, CircularProgress, Tooltip } from '@mui/material'
import { useAtom, useAtomValue } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import type { DemographicType } from '../data/query/Breakdowns'
import type { Fips } from '../data/utils/Fips'
import { SHOW_INSIGHT_GENERATION } from '../featureFlags'
import { generateContrastInsight } from '../utils/generateContrastInsight'
import type { ScrollableHashId } from '../utils/hooks/useStepObserver'
import {
  cardQueryResponsesAtom,
  contrastInsightsAtom,
} from '../utils/sharedSettingsState'

interface ContrastInsightSectionProps {
  hashId: ScrollableHashId
  dataTypeConfig1: DataTypeConfig
  dataTypeConfig2: DataTypeConfig
  fips1: Fips
  fips2: Fips
  demographicType: DemographicType
}

export default function ContrastInsightSection({
  hashId,
  dataTypeConfig1,
  dataTypeConfig2,
  fips1,
  fips2,
  demographicType,
}: ContrastInsightSectionProps) {
  const cardQueryResponses = useAtomValue(cardQueryResponsesAtom)
  const [contrastInsights, setContrastInsights] = useAtom(contrastInsightsAtom)
  // Local open state — same click-to-open pattern as per-card insights.
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Keys match what CardWrapper writes to cardQueryResponsesAtom: card 1 has
  // no suffix, card 2 ('compare' card) appends '-2'.
  const card1Key = `${hashId}-${dataTypeConfig1.dataTypeId}-${fips1.code}-${demographicType}`
  const card2Key = `${hashId}-${dataTypeConfig2.dataTypeId}-${fips2.code}-${demographicType}-2`
  const queryResponses1 = cardQueryResponses[card1Key]
  const queryResponses2 = cardQueryResponses[card2Key]
  const bothDataLoaded = Boolean(queryResponses1 && queryResponses2)

  const contrastCacheKey = `${hashId}-${dataTypeConfig1.dataTypeId}-${fips1.code}-${dataTypeConfig2.dataTypeId}-${fips2.code}-${demographicType}`
  const contrastInsight = contrastInsights[contrastCacheKey]

  const handleGenerate = useCallback(async () => {
    if (!queryResponses1 || !queryResponses2) return
    setIsGenerating(true)
    setError(null)
    try {
      const result = await generateContrastInsight(
        hashId,
        dataTypeConfig1,
        dataTypeConfig2,
        fips1,
        fips2,
        demographicType,
        queryResponses1,
        queryResponses2,
      )
      if (result.rateLimited) {
        setError('Too many requests. Please wait a moment and try again.')
      } else if (result.error) {
        setError('Unable to generate contrast insight. Please try again.')
      } else {
        setContrastInsights((prev) => ({
          ...prev,
          [contrastCacheKey]: result.content,
        }))
      }
    } finally {
      setIsGenerating(false)
    }
  }, [
    contrastCacheKey,
    dataTypeConfig1,
    dataTypeConfig2,
    demographicType,
    fips1,
    fips2,
    hashId,
    queryResponses1,
    queryResponses2,
    setContrastInsights,
  ])

  // Reset error when the cacheKey changes (user switched demographic, fips,
  // etc.) — otherwise a stale error from old params would block generation
  // for the new ones.
  useEffect(() => {
    setError(null)
  }, [contrastCacheKey])

  // Generate on open if we don't have a cached result. `error` is in the guard
  // so a failed call doesn't get auto-retried — user must click Try again.
  useEffect(() => {
    if (!isOpen) return
    if (contrastInsight) return
    if (isGenerating) return
    if (error) return
    if (!bothDataLoaded) return
    void handleGenerate()
  }, [
    isOpen,
    contrastInsight,
    isGenerating,
    error,
    bothDataLoaded,
    handleGenerate,
  ])

  if (!SHOW_INSIGHT_GENERATION) return null

  const buttonLabel = bothDataLoaded
    ? 'Compare these views with AI'
    : 'Loading card data…'

  if (!isOpen) {
    return (
      <div className='mx-2 mb-2'>
        <Tooltip title={buttonLabel}>
          <span>
            <Button
              size='small'
              startIcon={<CompareArrows />}
              disabled={!bothDataLoaded}
              onClick={() => setIsOpen(true)}
            >
              Compare these views
            </Button>
          </span>
        </Tooltip>
      </div>
    )
  }

  return (
    <article className='relative m-2 animate-expand-down rounded-sm bg-alt-white p-3 shadow-raised'>
      <div className='mb-2 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <CompareArrows className='text-alt-dark' />
          <span className='font-bold text-alt-dark'>
            Comparing these two views
          </span>
        </div>
        <Button size='small' onClick={() => setIsOpen(false)}>
          Clear
        </Button>
      </div>
      {isGenerating ? (
        <div className='flex items-center gap-2 py-1'>
          <CircularProgress size={14} className='shrink-0' />
          <p className='m-0 text-alt-dark text-small'>
            Analyzing the contrast with AI...
          </p>
        </div>
      ) : error ? (
        <div className='flex flex-col gap-1'>
          <p className='m-0 text-red-500 text-small'>{error}</p>
          <Button size='small' onClick={handleGenerate}>
            Try again
          </Button>
        </div>
      ) : contrastInsight ? (
        <>
          <p className='m-0 font-bold text-alt-dark leading-snug'>
            {contrastInsight}
          </p>
          <p className='m-0 mt-2 text-alt-dark text-smallest'>
            AI-generated. Verify with chart data.
          </p>
        </>
      ) : null}
    </article>
  )
}
