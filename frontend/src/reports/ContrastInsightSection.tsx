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
  cardInsightsAtom,
  contrastInsightOpenAtom,
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
  const cardInsights = useAtomValue(cardInsightsAtom)
  const [contrastInsights, setContrastInsights] = useAtom(contrastInsightsAtom)
  const [contrastInsightOpen, setContrastInsightOpen] = useAtom(
    contrastInsightOpenAtom,
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isOpen = contrastInsightOpen[hashId] ?? false

  // The per-card insight keys built by InsightVisualizationCard. Card 1 has no
  // suffix; card 2 (the "compare" card) appends '-2'.
  const card1Key = `${hashId}-${dataTypeConfig1.dataTypeId}-${fips1.code}-${demographicType}`
  const card2Key = `${hashId}-${dataTypeConfig2.dataTypeId}-${fips2.code}-${demographicType}-2`
  const insight1 = cardInsights[card1Key]
  const insight2 = cardInsights[card2Key]
  const bothInsightsExist = Boolean(insight1 && insight2)

  const contrastCacheKey = `${hashId}-${dataTypeConfig1.dataTypeId}-${fips1.code}-${dataTypeConfig2.dataTypeId}-${fips2.code}-${demographicType}`
  const contrastInsight = contrastInsights[contrastCacheKey]

  const handleGenerate = useCallback(async () => {
    if (!insight1 || !insight2) return
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
        insight1,
        insight2,
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
    insight1,
    insight2,
    setContrastInsights,
  ])

  useEffect(() => {
    if (!isOpen || contrastInsight || !bothInsightsExist || isGenerating) return
    void handleGenerate()
  }, [
    isOpen,
    contrastCacheKey,
    handleGenerate,
    contrastInsight,
    bothInsightsExist,
    isGenerating,
  ])

  if (!SHOW_INSIGHT_GENERATION) return null

  const buttonLabel = bothInsightsExist
    ? 'Compare these views with AI'
    : 'Generate both card insights below first to enable comparison'

  return (
    <div className='mx-2 mb-4'>
      {!isOpen ? (
        <Tooltip title={buttonLabel}>
          <span>
            <Button
              size='small'
              startIcon={<CompareArrows />}
              disabled={!bothInsightsExist}
              onClick={() =>
                setContrastInsightOpen((prev) => ({ ...prev, [hashId]: true }))
              }
            >
              Compare these views
            </Button>
          </span>
        </Tooltip>
      ) : (
        <div className='animate-expand-down rounded-md bg-footer-color p-4'>
          <div className='mb-2 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <CompareArrows className='text-alt-dark' />
              <span className='font-bold text-alt-dark'>
                Comparing these two views
              </span>
            </div>
            <Button
              size='small'
              onClick={() =>
                setContrastInsightOpen((prev) => ({
                  ...prev,
                  [hashId]: false,
                }))
              }
            >
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
                AI-generated synthesis powered by the Claude API. Always verify
                findings with the source data shown in the charts above.
              </p>
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}
