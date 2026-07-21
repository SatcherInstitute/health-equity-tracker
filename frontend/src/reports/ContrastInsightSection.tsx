import AutoAwesome from '@mui/icons-material/AutoAwesome'
import DeleteForever from '@mui/icons-material/DeleteForever'
import { Button, CircularProgress, IconButton, Tooltip } from '@mui/material'
import { useAtom, useAtomValue } from 'jotai'
import { useCallback, useEffect, useRef, useState } from 'react'
import FlagInsightButton from '../cards/ui/FlagInsightButton'
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
  headerScrollMargin?: number
}

export default function ContrastInsightSection({
  hashId,
  dataTypeConfig1,
  dataTypeConfig2,
  fips1,
  fips2,
  demographicType,
  headerScrollMargin,
}: ContrastInsightSectionProps) {
  const cardQueryResponses = useAtomValue(cardQueryResponsesAtom)
  const [contrastInsights, setContrastInsights] = useAtom(contrastInsightsAtom)
  const [contrastInsightOpen, setContrastInsightOpen] = useAtom(
    contrastInsightOpenAtom,
  )
  const isOpen = contrastInsightOpen[hashId] ?? false
  const articleRef = useRef<HTMLDivElement>(null)

  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [serverCacheKey, setServerCacheKey] = useState<string | null>(null)

  const card1Key = `${hashId}-${dataTypeConfig1.dataTypeId}-${fips1.code}-${demographicType}`
  const card2Key = `${hashId}-${dataTypeConfig2.dataTypeId}-${fips2.code}-${demographicType}-2`
  const queryResponses1 = cardQueryResponses[card1Key]
  const queryResponses2 = cardQueryResponses[card2Key]
  const bothDataLoaded = Boolean(queryResponses1 && queryResponses2)

  const contrastCacheKey = `${hashId}-${dataTypeConfig1.dataTypeId}-${fips1.code}-${dataTypeConfig2.dataTypeId}-${fips2.code}-${demographicType}`
  const contrastInsight = contrastInsights[contrastCacheKey]

  const stepInfo = reportProviderSteps[hashId]
  const baseLabel = stepInfo?.label ?? hashId
  const sectionLabel =
    stepInfo?.pluralOnCompare && !baseLabel.endsWith('s')
      ? `${baseLabel}s`
      : baseLabel

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
      setServerCacheKey(result.cacheKey ?? null)
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

  const handleFlagged = () => {
    setContrastInsights((prev) => {
      const next = { ...prev }
      delete next[contrastCacheKey]
      return next
    })
  }

  const handleClose = () => {
    setContrastInsightOpen((prev) => ({ ...prev, [hashId]: false }))
    setTimeout(() => {
      document
        .querySelector<HTMLElement>('[aria-label="Comparison insights"]')
        ?.focus()
    }, 0)
  }

  useEffect(() => {
    setError(null)
  }, [contrastCacheKey])

  useEffect(() => {
    if (!isOpen || contrastInsight || error || isGenerating || !bothDataLoaded)
      return
    void handleGenerate()
  }, [
    isOpen,
    contrastInsight,
    error,
    isGenerating,
    bothDataLoaded,
    handleGenerate,
  ])

  useEffect(() => {
    if (!isOpen) return
    articleRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [isOpen])

  if (!SHOW_INSIGHT_GENERATION || !isOpen) return null

  return (
    <div
      ref={articleRef}
      role='status'
      aria-label={`${sectionLabel} comparison insight`}
      style={{ scrollMarginTop: headerScrollMargin }}
      className='relative m-2 animate-expand-down rounded-sm bg-alt-white p-3 shadow-raised'
    >
      <div className='mb-2 flex items-center justify-between'>
        <p className='m-0 flex items-center gap-1 text-alt-dark text-smallest'>
          <AutoAwesome sx={{ fontSize: 12 }} />
          {sectionLabel} comparison
        </p>
        <Tooltip title='Close'>
          <IconButton
            size='small'
            onClick={handleClose}
            aria-label='Close comparison insights'
          >
            <DeleteForever fontSize='small' />
          </IconButton>
        </Tooltip>
      </div>
      {isGenerating ? (
        <div className='flex items-center gap-2 rounded-md bg-footer-color p-3'>
          <CircularProgress size={14} className='shrink-0' />
          <p className='m-0 text-alt-dark text-small'>Analyzing with AI...</p>
        </div>
      ) : error ? (
        <div className='flex flex-col gap-1 rounded-md bg-footer-color p-3'>
          <p className='m-0 text-red-orange text-small'>{error}</p>
          <Button size='small' onClick={handleGenerate}>
            Try again
          </Button>
        </div>
      ) : contrastInsight ? (
        <div className='rounded-md bg-footer-color p-3'>
          <p className='m-0 font-bold text-alt-dark leading-snug'>
            {contrastInsight}
          </p>
          <p className='m-0 mt-2 text-alt-dark text-smallest'>
            AI-generated. Verify with chart data.{' '}
            <FlagInsightButton
              cacheKey={serverCacheKey ?? undefined}
              content={contrastInsight}
              topic={dataTypeConfig1.dataTypeId}
              onFlagged={handleFlagged}
            />
          </p>
        </div>
      ) : null}
    </div>
  )
}
