import AutoAwesome from '@mui/icons-material/AutoAwesome'
import DeleteForever from '@mui/icons-material/DeleteForever'
import { Button, CircularProgress, IconButton, Tooltip } from '@mui/material'
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
  contrastInsightOpenAtom,
  contrastInsightsAtom,
} from '../utils/sharedSettingsState'
import { reportProviderSteps } from './ReportProviderSteps'

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
  const [contrastInsightOpen, setContrastInsightOpen] = useAtom(
    contrastInsightOpenAtom,
  )
  const isOpen = contrastInsightOpen[hashId] ?? false

  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const card1Key = `${hashId}-${dataTypeConfig1.dataTypeId}-${fips1.code}-${demographicType}`
  const card2Key = `${hashId}-${dataTypeConfig2.dataTypeId}-${fips2.code}-${demographicType}-2`
  const queryResponses1 = cardQueryResponses[card1Key]
  const queryResponses2 = cardQueryResponses[card2Key]
  const bothDataLoaded = Boolean(queryResponses1 && queryResponses2)

  const contrastCacheKey = `${hashId}-${dataTypeConfig1.dataTypeId}-${fips1.code}-${dataTypeConfig2.dataTypeId}-${fips2.code}-${demographicType}`
  const contrastInsight = contrastInsights[contrastCacheKey]

  const sectionLabel = reportProviderSteps[hashId]?.label ?? hashId

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
        setError('Unable to generate comparison insights. Please try again.')
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

  useEffect(() => {
    setError(null)
  }, [contrastCacheKey])

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

  if (!SHOW_INSIGHT_GENERATION || !isOpen) return null

  const handleClose = () =>
    setContrastInsightOpen((prev) => ({ ...prev, [hashId]: false }))

  return (
    <article className='relative m-2 animate-expand-down rounded-sm bg-alt-white p-3 shadow-raised'>
      <div className='mb-2 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <AutoAwesome fontSize='small' className='text-alt-green' />
          <span className='font-bold text-alt-dark'>
            {sectionLabel} insights
          </span>
        </div>
        <Tooltip title='Clear comparison insights'>
          <IconButton
            size='small'
            onClick={handleClose}
            aria-label='Clear comparison insights'
          >
            <DeleteForever fontSize='small' />
          </IconButton>
        </Tooltip>
      </div>
      {isGenerating ? (
        <div className='flex items-center gap-2 py-1'>
          <CircularProgress size={14} className='shrink-0' />
          <p className='m-0 text-alt-dark text-small'>
            Generating comparison insights...
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
