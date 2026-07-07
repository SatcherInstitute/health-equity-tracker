import AutoAwesome from '@mui/icons-material/AutoAwesome'
import CloseIcon from '@mui/icons-material/Close'
import Info from '@mui/icons-material/Info'
import LocationOn from '@mui/icons-material/LocationOn'
import People from '@mui/icons-material/People'
import {
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material'
import { useAtom, useAtomValue } from 'jotai'
import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import FlagInsightButton from '../../cards/ui/FlagInsightButton'
import {
  generateReportInsight,
  type ReportInsightSections,
} from '../../utils/generateReportInsight'
import { useParamState } from '../../utils/hooks/useParamState'
import type { MadLibId } from '../../utils/MadLibs'
import {
  reportInsightsAtom,
  selectedDataTypeConfig1Atom,
  selectedDemographicTypeAtom,
  selectedFipsAtom,
} from '../../utils/sharedSettingsState'
import { REPORT_INSIGHT_PARAM_KEY } from '../../utils/urlutils'

interface InsightReportCardProps {
  setTrackerMode?: React.Dispatch<React.SetStateAction<MadLibId>>
  headerScrollMargin?: number
  isFlat?: boolean
}

type SectionConfig = {
  key: keyof ReportInsightSections
  label: string
  icon: React.ReactNode
}

const SECTIONS: SectionConfig[] = [
  {
    key: 'keyFindings',
    label: 'Key Findings',
    icon: <AutoAwesome fontSize='small' />,
  },
  {
    key: 'locationComparison',
    label: 'Location Comparison',
    icon: <LocationOn fontSize='small' />,
  },
  {
    key: 'demographicInsights',
    label: 'Demographic Insights',
    icon: <People fontSize='small' />,
  },
  {
    key: 'whatThisMeans',
    label: 'What This Means',
    icon: <Info fontSize='small' />,
  },
]

export default function InsightReportCard(props: InsightReportCardProps) {
  const [, setIsOpen] = useParamState(REPORT_INSIGHT_PARAM_KEY)

  const dataTypeConfig = useAtomValue(selectedDataTypeConfig1Atom)
  const fips = useAtomValue(selectedFipsAtom)
  const demographicType = useAtomValue(selectedDemographicTypeAtom)

  const [reportInsights, setReportInsights] = useAtom(reportInsightsAtom)
  const cacheKey = `${dataTypeConfig?.dataTypeId ?? ''}-${fips?.code ?? ''}-${demographicType ?? ''}`
  const cachedEntry = reportInsights[cacheKey]
  const sections: ReportInsightSections | null = cachedEntry?.sections ?? null

  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // The exact server cache key used, captured so the flag button targets this insight.
  const [serverCacheKey, setServerCacheKey] = useState<string | null>(null)

  const handleGenerate = useCallback(async () => {
    if (!dataTypeConfig || !fips || !demographicType) return
    setIsGenerating(true)
    setError(null)
    try {
      const result = await generateReportInsight(
        dataTypeConfig,
        demographicType,
        fips,
      )
      setServerCacheKey(result.cacheKey ?? null)
      if (result.rateLimited) {
        setError('Too many requests. Please wait a moment and try again.')
      } else if (result.error || !result.sections) {
        setError('Unable to generate insight. Please try again.')
      } else {
        setReportInsights((prev) => ({
          ...prev,
          [cacheKey]: { sections: result.sections! },
        }))
      }
    } finally {
      setIsGenerating(false)
    }
  }, [cacheKey, dataTypeConfig, demographicType, fips, setReportInsights])

  useEffect(() => {
    if (!cachedEntry) void handleGenerate()
  }, [cacheKey, handleGenerate])

  const handleFlagged = () => {
    // Drop the cached insight and regenerate a fresh one in its place. Flagging records
    // the bad output for review but does not hide this data combination.
    setReportInsights((prev) => {
      const next = { ...prev }
      delete next[cacheKey]
      return next
    })
    void handleGenerate()
  }

  const insightText = sections
    ? SECTIONS.map(({ key }) => sections[key]).join(' ')
    : ''

  const handleClose = () => {
    setIsOpen(false)
    setError(null)
    props.setTrackerMode?.('disparity')
  }

  return (
    <div className='md:sticky' style={{ top: props.headerScrollMargin ?? 0 }}>
      <div
        className={`flex flex-col gap-3 bg-alt-white p-4 text-left ${props.isFlat ? '' : 'rounded-sm shadow-raised md:m-card-gutter'}`}
      >
        {/* Header */}
        <div className='flex items-center justify-between gap-2'>
          <span className='flex items-center gap-2 font-semibold text-alt-dark'>
            <AutoAwesome fontSize='small' className='text-alt-green' />
            AI Report Summary
          </span>
          {/* Close button */}
          <Tooltip title='Close' disableTouchListener>
            <IconButton onClick={handleClose} aria-label='close report'>
              <CloseIcon fontSize='small' />
            </IconButton>
          </Tooltip>
        </div>

        <Divider />

        {/* Loading */}
        {isGenerating && (
          <div className='flex flex-col items-center gap-3 py-8'>
            <CircularProgress size={28} />
            <p className='text-alt-dark text-small'>
              Reviewing all charts with AI...
            </p>
          </div>
        )}

        {/* Error with retry */}
        {error && !isGenerating && (
          <div className='flex flex-col items-center gap-2 py-4'>
            <p className='m-0 text-center text-red-500 text-small'>{error}</p>
            <Button size='small' onClick={handleGenerate}>
              Try again
            </Button>
          </div>
        )}

        {/* Sections, disclaimer — only when content is ready */}
        {sections && !isGenerating && (
          <>
            <div className='flex flex-col gap-5'>
              {SECTIONS.map(({ key, label, icon }) => (
                <div
                  key={key}
                  className={`flex flex-col gap-1 px-4 ${key === 'keyFindings' ? 'rounded-md bg-footer-color py-4 text-alt-black' : 'py-2'}`}
                >
                  <span className='flex items-center gap-1 font-semibold text-alt-green text-smallest uppercase tracking-wide'>
                    {icon}
                    {label}
                  </span>
                  <p
                    className={`m-0 text-alt-dark leading-snug ${key === 'keyFindings' ? 'font-bold text-title' : 'text-text leading-relaxed'}`}
                  >
                    {sections[key]}
                  </p>
                </div>
              ))}
            </div>

            <Divider />

            <p className='m-0 text-alt-dark text-smallest'>
              AI-generated. Verify with chart data.{' '}
              <FlagInsightButton
                cacheKey={serverCacheKey ?? undefined}
                content={insightText}
                topic={dataTypeConfig?.dataTypeId}
                onFlagged={handleFlagged}
              />
            </p>
          </>
        )}
      </div>
    </div>
  )
}
