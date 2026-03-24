import { AutoAwesome, Info, LocationOn, People } from '@mui/icons-material'
import { Button, CircularProgress, Divider } from '@mui/material'
import { useAtom, useAtomValue } from 'jotai'
import type React from 'react'
import { useEffect, useState } from 'react'
import InsightCardOptionsMenu from '../../cards/ui/InsightCardOptionsMenu'
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

  useEffect(() => {
    if (!cachedEntry) void handleGenerate()
  }, [])

  async function handleGenerate() {
    if (!dataTypeConfig || !fips || !demographicType) return
    setIsGenerating(true)
    setError(null)
    try {
      const result = await generateReportInsight(dataTypeConfig, demographicType, fips)
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
  }

  const handleDownload = async () => {
    if (!sections) return
    try {
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

      const locationSlug =
        fips?.getDisplayName().toLowerCase().replace(/\s+/g, '_') ?? 'unknown'
      const filename = `${dataTypeConfig?.dataTypeId ?? 'report'}_${locationSlug}_${demographicType}_insight.pdf`
      doc.save(filename)
    } catch {
      setError('Unable to download PDF. Please try again.')
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setError(null)
    props.setTrackerMode?.('disparity')
  }

  return (
    <div className='sticky' style={{ top: props.headerScrollMargin ?? 0 }}>
      <div className='flex flex-col gap-3 rounded-sm bg-white p-4 text-left shadow-raised md:m-card-gutter'>

        {/* Header */}
        <div className='flex items-center justify-between gap-2'>
          <span className='flex items-center gap-2 font-semibold text-alt-dark'>
            <AutoAwesome fontSize='small' className='text-alt-green' />
            AI Report Summary
          </span>
          <InsightCardOptionsMenu
            onClose={handleClose}
            onDownload={sections ? handleDownload : undefined}
          />
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
                  className={`flex flex-col gap-1 ${key === 'keyFindings' ? 'rounded-md bg-green-50' : ''}`}
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
              AI-generated synthesis powered by the Claude API. Always verify
              findings with the source data shown in the charts above.
            </p>
          </>
        )}

      </div>
    </div>
  )
}
