import { DeleteForever, TipsAndUpdatesOutlined } from '@mui/icons-material'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import type React from 'react'
import { useState } from 'react'
import type {
  MetricConfig,
  MetricId
} from '../../data/config/MetricConfigTypes'
import type { DemographicType } from '../../data/query/Breakdowns'
import type { MetricQueryResponse } from '../../data/query/MetricQuery'
import { splitIntoKnownsAndUnknowns } from '../../data/utils/datasetutils'
import type { Fips } from '../../data/utils/Fips'
import { SHOW_INSIGHT_GENERATION } from '../../featureFlags'
import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'
import { generateInsight } from '../generateInsights'

type InsightDisplayProps = {
  demographicType: DemographicType
  metricIds: MetricId[]
  queryResponses: MetricQueryResponse[]
  shareConfig: MetricConfig
  hashId: ScrollableHashId
  fips?: Fips
}

const InsightDisplay: React.FC<InsightDisplayProps> = ({
  queryResponses,
  shareConfig,
  demographicType,
  metricIds,
  hashId,
  fips,
}) => {
  const [insight, setInsight] = useState<string>('')
  const [isGeneratingInsight, setIsGeneratingInsight] = useState<boolean>(false)
  const [rateLimitReached, setRateLimitReached] = useState<boolean>(false)

  const queryResponse = queryResponses[0]
  const validData = queryResponse.getValidRowsForField(shareConfig.metricId)
  const [knownData] = splitIntoKnownsAndUnknowns(validData, demographicType)

  const handleGenerateInsight = async () => {
    if (!SHOW_INSIGHT_GENERATION || !knownData.length || !metricIds.length) 
      return

    setIsGeneratingInsight(true)
    try {
      const result = await generateInsight(
        { knownData, metricIds },
        hashId,
        fips
        )
      if (result.rateLimited) {
        setRateLimitReached(true)
      } else {
        setInsight(result.content)
      }
    } finally {
      setIsGeneratingInsight(false)
    }
  }

  const handleClearInsight = () => setInsight('')

  const showInsightButton = SHOW_INSIGHT_GENERATION && !rateLimitReached

  return (
    <>
      {showInsightButton && (
        <IconButton
          aria-label={insight ? 'Clear insight' : 'Generate insight'}
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
      )}
      <p className='m-0 p-8 text-center text-alt-dark text-text smplus:text-smallest-header'>
        {isGeneratingInsight
          ? 'Analyzing health equity data with AI...'
          : insight}
      </p>
    </>
  )
}

export default InsightDisplay
