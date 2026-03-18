import { AutoAwesome, FileDownload, Info, LocationOn, People } from '@mui/icons-material'
import { CircularProgress, Divider } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import { useAtomValue } from 'jotai'
import type React from 'react'
import { useEffect, useState } from 'react'
import HetCloseButton from '../../styles/HetComponents/HetCloseButton'
import {
  generateReportInsight,
  type ReportInsightSections,
} from '../../utils/generateReportInsight'
import { useParamState } from '../../utils/hooks/useParamState'
import type { MadLibId } from '../../utils/MadLibs'
import {
  selectedDataTypeConfig1Atom,
  selectedDemographicTypeAtom,
  selectedFipsAtom,
} from '../../utils/sharedSettingsState'
import { REPORT_INSIGHT_PARAM_KEY } from '../../utils/urlutils'

interface InsightReportCardProps {
  setTrackerMode?: React.Dispatch<React.SetStateAction<MadLibId>>
  headerScrollMargin?: number
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

  const [sections, setSections] = useState<ReportInsightSections | null>(null)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [rateLimitReached, setRateLimitReached] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Clear sections whenever topic, fips, or demographicType changes
  useEffect(() => {
    setSections(null)
    setError(null)
    setRateLimitReached(false)
  }, [dataTypeConfig?.dataTypeId, fips?.code, demographicType])

  // Auto-generate on mount
  useEffect(() => {
    void handleGenerate()
  }, [])

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

  const handleDownload = async () => {
    if (!sections) return
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 16
    const maxWidth = pageWidth - margin * 2
    let y = 20

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('AI Report Summary', margin, y)
    y += 12

    for (const { key, label } of SECTIONS) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text(label.toUpperCase(), margin, y)
      y += 6

      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      const lines = doc.splitTextToSize(sections[key], maxWidth)
      for (const line of lines) {
        if (y > 275) {
          doc.addPage()
          y = 20
        }
        doc.text(line, margin, y)
        y += 6
      }
      y += 6
    }

    const locationSlug = fips?.getDisplayName().toLowerCase().replace(/\s+/g, '_') ?? 'unknown'
    const filename = `${dataTypeConfig?.dataTypeId ?? 'report'}_${locationSlug}_${demographicType ?? 'all'}_insight.pdf`
    doc.save(filename)
  }

  const handleClose = () => {
    setIsOpen(false)
    setSections(null)
    setError(null)
    setRateLimitReached(false)
    props.setTrackerMode?.('disparity')
  }

  const topOffset = props.headerScrollMargin ?? 0

  return (
    <div
      className='sticky overflow-y-auto'
      style={{
        top: topOffset,
        maxHeight: `calc(100vh - ${topOffset + 16}px)`,
      }}
    >
      <div className='flex flex-col gap-3 rounded-sm bg-white p-4 shadow-raised md:m-card-gutter'>
        {/* Header */}
        <div className='flex items-center justify-between gap-2'>
          <span className='flex items-center gap-2 font-semibold text-alt-dark'>
            <AutoAwesome fontSize='small' className='text-alt-green' />
            AI Report Summary
          </span>
          <div className='flex items-center'>
            {sections && (
              <IconButton
                aria-label='export AI report as PDF'
                onClick={handleDownload}
                size='small'
              >
                <FileDownload fontSize='small' />
              </IconButton>
            )}
            <HetCloseButton
              onClick={handleClose}
              ariaLabel='close AI report insight'
            />
          </div>
        </div>

        <Divider />

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

        <Divider />

        <p className='m-0 text-alt-dark text-smallest'>
          AI-generated synthesis based on report context. Always verify findings
          with the source data shown in the charts above.
        </p>
      </div>
    </div>
  )
}
