import AutoAwesome from '@mui/icons-material/AutoAwesome'
import DeleteForever from '@mui/icons-material/DeleteForever'
import { Button, CircularProgress, IconButton, Tooltip } from '@mui/material'
import { useAtom, useAtomValue } from 'jotai'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import FlagInsightButton from '../cards/ui/FlagInsightButton'
import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import type { DemographicType } from '../data/query/Breakdowns'
import { ALL } from '../data/utils/Constants'
import type { Fips } from '../data/utils/Fips'
import { flag } from '../featureFlags'
import HetHighlightedText from '../styles/HetComponents/HetHighlightedText'
import {
  generateContrastInsight,
  previewContrastInsight,
} from '../utils/generateContrastInsight'
import type { ScrollableHashId } from '../utils/hooks/useStepObserver'
import { parseSingleInsight } from '../utils/insightPayload'
import {
  cardQueryResponsesAtom,
  contrastInsightOpenAtom,
  contrastInsightsAtom,
  urlParamAtom,
} from '../utils/sharedSettingsState'
import {
  getDemographicGroupFromGroupParam,
  MAP1_GROUP_PARAM,
  MAP2_GROUP_PARAM,
} from '../utils/urlutils'
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
  const [unavailable, setUnavailable] = useState(false)
  const [serverCacheKey, setServerCacheKey] = useState<string | null>(null)

  const card1Key = `${hashId}-${dataTypeConfig1.dataTypeId}-${fips1.code}-${demographicType}`
  const card2Key = `${hashId}-${dataTypeConfig2.dataTypeId}-${fips2.code}-${demographicType}-2`
  const queryResponses1 = cardQueryResponses[card1Key]
  const queryResponses2 = cardQueryResponses[card2Key]
  const bothDataLoaded = Boolean(queryResponses1 && queryResponses2)

  // The highlighted group on each side of the compare. When both sides
  // highlight the same non-All group we send it as the contrast's active group;
  // when they differ we send nothing and let the model reason across both.
  const group1Param = useAtomValue(urlParamAtom(MAP1_GROUP_PARAM))
  const group2Param = useAtomValue(urlParamAtom(MAP2_GROUP_PARAM))
  const group1 = group1Param
    ? getDemographicGroupFromGroupParam(group1Param)
    : undefined
  const group2 = group2Param
    ? getDemographicGroupFromGroupParam(group2Param)
    : undefined
  const highlightedGroup =
    group1 && group1 === group2 && group1 !== ALL ? group1 : undefined

  // The decoder passes an unrecognized code straight through, so the param
  // alone cannot vouch for the value that ends up in the prompt. The loaded
  // rows are the allowlist: a group the response never returned is dropped.
  const activeDemographicGroup = useMemo(() => {
    if (!highlightedGroup) return undefined
    const appearsInData = [
      ...(queryResponses1 ?? []),
      ...(queryResponses2 ?? []),
    ].some((response) =>
      response
        .getValidRowsForField(demographicType)
        .some((row) => row[demographicType] === highlightedGroup),
    )
    return appearsInData ? highlightedGroup : undefined
  }, [highlightedGroup, queryResponses1, queryResponses2, demographicType])

  const contrastCacheKey = `${hashId}-${dataTypeConfig1.dataTypeId}-${fips1.code}-${dataTypeConfig2.dataTypeId}-${fips2.code}-${demographicType}-${activeDemographicGroup ?? ''}`
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
        activeDemographicGroup,
      )
      setServerCacheKey(result.cacheKey ?? null)
      if (result.rateLimited) {
        setError('Too many requests. Please wait a moment and try again.')
      } else if (result.unavailable) {
        setUnavailable(true)
      } else if (result.error) {
        setError('Unable to generate comparison insights. Please try again.')
      } else {
        setContrastInsights((prev) => ({
          ...prev,
          [contrastCacheKey]: parseSingleInsight(result.content),
        }))
      }
    } finally {
      setIsGenerating(false)
    }
  }, [
    activeDemographicGroup,
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
    setUnavailable(false)
  }, [contrastCacheKey])

  useEffect(() => {
    if (
      !isOpen ||
      contrastInsight ||
      error ||
      unavailable ||
      isGenerating ||
      !bothDataLoaded
    )
      return
    void handleGenerate()
  }, [
    isOpen,
    contrastInsight,
    error,
    unavailable,
    isGenerating,
    bothDataLoaded,
    handleGenerate,
  ])

  useEffect(() => {
    if (!isOpen) return
    articleRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [isOpen])

  // When generation is unavailable the section renders nothing at all, rather
  // than an empty container or an error the reader can do nothing about.
  if (!flag('VITE_SHOW_INSIGHT_GENERATION') || !isOpen || unavailable)
    return null

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
        <Tooltip title='Close' disableTouchListener>
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
          <p
            data-testid='insight-text'
            className='m-0 font-bold text-alt-dark leading-snug'
          >
            <HetHighlightedText section={contrastInsight} />
          </p>
          <p className='m-0 mt-2 text-alt-dark text-smallest'>
            <FlagInsightButton
              cacheKey={serverCacheKey ?? undefined}
              content={contrastInsight.text}
              topic={dataTypeConfig1.dataTypeId}
              onFlagged={handleFlagged}
              onFetchPrompt={
                queryResponses1 && queryResponses2
                  ? () =>
                      previewContrastInsight(
                        hashId,
                        dataTypeConfig1,
                        dataTypeConfig2,
                        fips1,
                        fips2,
                        demographicType,
                        queryResponses1,
                        queryResponses2,
                        activeDemographicGroup,
                      )
                  : undefined
              }
            />
          </p>
        </div>
      ) : null}
    </div>
  )
}
