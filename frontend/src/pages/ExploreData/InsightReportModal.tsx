import { AutoAwesome, Info, LocationOn, People } from '@mui/icons-material'
import {
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@mui/material'
import { useAtomValue } from 'jotai'
import type React from 'react'
import { useEffect, useState } from 'react'
import HetCloseButton from '../../styles/HetComponents/HetCloseButton'
import {
  generateReportInsight,
  type ReportInsightSections,
} from '../../utils/generateReportInsight'
import { useParamState } from '../../utils/hooks/useParamState'
import {
  selectedDataTypeConfig1Atom,
  selectedDemographicTypeAtom,
  selectedFipsAtom,
} from '../../utils/sharedSettingsState'
import { REPORT_INSIGHT_PARAM_KEY } from '../../utils/urlutils'

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

export default function AIInsightModal() {
  const [modalIsOpen, setModalIsOpen] = useParamState(REPORT_INSIGHT_PARAM_KEY)

  const dataTypeConfig = useAtomValue(selectedDataTypeConfig1Atom)
  const fips = useAtomValue(selectedFipsAtom)
  const demographicType = useAtomValue(selectedDemographicTypeAtom)

  const [sections, setSections] = useState<ReportInsightSections | null>(null)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [rateLimitReached, setRateLimitReached] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Clear sections whenever topic, fips, or demographicType changes so stale
  // content never persists when the user navigates to a new report
  useEffect(() => {
    setSections(null)
    setError(null)
    setRateLimitReached(false)
  }, [dataTypeConfig?.dataTypeId, fips?.code, demographicType])

  // Auto-generate when modal opens
  useEffect(() => {
    if (modalIsOpen && !sections && !isGenerating) {
      void handleGenerate()
    }
  }, [modalIsOpen])

  async function handleGenerate() {
    if (!dataTypeConfig || !fips || !demographicType) return
    setIsGenerating(true)
    setError(null)
    try {
      const result = await generateReportInsight(
        dataTypeConfig,
        demographicType,
        fips,
      )
      if (result.rateLimited) {
        setRateLimitReached(true)
      } else if (result.error || !result.sections) {
        setError('Unable to generate insight. Please try again.')
      } else {
        setSections(result.sections)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerate = () => {
    setSections(null)
    void handleGenerate()
  }

  // Clear sections on close so reopening always starts fresh
  const handleClose = () => {
    setModalIsOpen(false)
    setSections(null)
    setError(null)
    setRateLimitReached(false)
  }

  return (
    <Dialog
      open={Boolean(modalIsOpen)}
      onClose={handleClose}
      maxWidth='md'
      fullWidth
      scroll='paper'
    >
      <DialogTitle className='flex items-center justify-between gap-2 pb-2'>
        <span className='flex items-center gap-2 font-semibold text-alt-dark'>
          <AutoAwesome fontSize='small' className='text-alt-green' />
          AI Report Summary
        </span>
        <HetCloseButton
          onClick={handleClose}
          ariaLabel='close AI report insight modal'
        />
      </DialogTitle>

      <DialogContent dividers>
        {/* Loading */}
        {isGenerating && (
          <div className='flex flex-col items-center gap-3 py-8'>
            <CircularProgress size={28} />
            <p className='text-alt-dark text-small'>
              Synthesizing data across all charts with AI...
            </p>
          </div>
        )}

        {/* Rate limited */}
        {rateLimitReached && !isGenerating && (
          <p className='py-4 text-center text-red-500 text-small'>
            Too many requests. Please wait a moment and try again.
          </p>
        )}

        {/* Error */}
        {error && !isGenerating && (
          <p className='py-4 text-center text-red-500 text-small'>{error}</p>
        )}

        {/* Sections */}
        {sections && !isGenerating && (
          <div className='flex flex-col gap-5'>
            {SECTIONS.map(({ key, label, icon }) => (
              <div key={key} className='flex flex-col gap-1'>
                <span className='flex items-center gap-1 font-semibold text-alt-green text-smallest uppercase tracking-wide'>
                  {icon}
                  {label}
                </span>
                <p className='m-0 text-alt-dark text-text leading-relaxed'>
                  {sections[key]}
                </p>
              </div>
            ))}

            <button
              type='button'
              onClick={handleRegenerate}
              className='self-end text-alt-green text-smallest underline'
            >
              Regenerate
            </button>
          </div>
        )}
      </DialogContent>

      <DialogContent dividers className='text-alt-dark text-smallest'>
        AI-generated synthesis based on report context. Always verify findings
        with the source data shown in the charts above.
      </DialogContent>
    </Dialog>
  )
}
