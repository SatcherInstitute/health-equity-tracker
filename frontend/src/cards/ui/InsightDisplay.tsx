import { DeleteForever, TipsAndUpdatesOutlined } from '@mui/icons-material'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import type React from 'react'
import { useState } from 'react'
import type {
  MetricConfig,
  MetricId,
} from '../../data/config/MetricConfigTypes'
import type { DemographicType } from '../../data/query/Breakdowns'
import type { MetricQueryResponse } from '../../data/query/MetricQuery'
import { splitIntoKnownsAndUnknowns } from '../../data/utils/datasetutils'
import { generateInsight } from '../generateInsights'

export const SHOW_INSIGHT_GENERATION = import.meta.env
  .VITE_SHOW_INSIGHT_GENERATION

export interface ChartData {
  knownData: Readonly<Record<string, any>>[]
  metricIds: MetricId[]
}

type InsightDisplayProps = {
  demographicType: DemographicType
  metricIds: MetricId[]
  queryResponses: MetricQueryResponse[]
  shareConfig: MetricConfig
}

const InsightDisplay: React.FC<InsightDisplayProps> = ({
  queryResponses,
  shareConfig,
  demographicType,
  metricIds,
}) => {
  if (!SHOW_INSIGHT_GENERATION) {
    return
  }
  const [insight, setInsight] = useState<string>('')
  const [isGeneratingInsight, setIsGeneratingInsight] = useState<boolean>(false)

  const queryResponse = queryResponses[0]
  const validData = queryResponse.getValidRowsForField(shareConfig.metricId)
  const [knownData] = splitIntoKnownsAndUnknowns(validData, demographicType)

  const handleGenerateInsight = async () => {
    if (!knownData.length || !metricIds.length) return

    setIsGeneratingInsight(true)
    try {
      const newInsight = await generateInsight({ knownData, metricIds })
      setInsight(newInsight)
    } finally {
      setIsGeneratingInsight(false)
    }
  }

  const handleClearInsight = () => setInsight('')

  return (
    <>
      <IconButton
        onClick={insight ? handleClearInsight : handleGenerateInsight}
        className='absolute top-2 right-2 z-10'
        disabled={isGeneratingInsight}
      >
        {isGeneratingInsight ? (
          <CircularProgress size={24} />
        ) : insight ? (
          <DeleteForever />
        ) : (
          <TipsAndUpdatesOutlined />
        )}
      </IconButton>
      <p className='text-text smMd:text-smallestHeader p-8 m-0 text-center text-altDark'>
        {isGeneratingInsight ? 'Generating insight...' : insight}
      </p>
    </>
  )
}

export default InsightDisplay
