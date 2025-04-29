import { DeleteForever, TipsAndUpdatesOutlined } from '@mui/icons-material'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import type React from 'react'
import { useEffect, useState } from 'react'
import type {
  MetricConfig,
  MetricId,
} from '../../data/config/MetricConfigTypes'
import type { DemographicType } from '../../data/query/Breakdowns'
import type { MetricQueryResponse } from '../../data/query/MetricQuery'
import { splitIntoKnownsAndUnknowns } from '../../data/utils/datasetutils'
import { SHOW_INSIGHT_GENERATION } from '../../featureFlags'
import { generateInsight } from '../generateInsights'
import { checkRateLimitStatus } from '../generateInsightsUtils'

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
  const [insight, setInsight] = useState<string>('')
  const [isGeneratingInsight, setIsGeneratingInsight] = useState<boolean>(false)
  const [rateLimitReached, setRateLimitReached] = useState<boolean>(false)

  const queryResponse = queryResponses[0]
  const validData = queryResponse.getValidRowsForField(shareConfig.metricId)
  const [knownData] = splitIntoKnownsAndUnknowns(validData, demographicType)

  useEffect(() => {
    const checkRateLimit = async () => {
      const status = await checkRateLimitStatus()
      setRateLimitReached(status.rateLimitReached)
    }

    if (SHOW_INSIGHT_GENERATION) {
      checkRateLimit()
    }
  }, [])

  const handleGenerateInsight = async () => {
    if (
      !SHOW_INSIGHT_GENERATION ||
      !knownData.length ||
      !metricIds.length ||
      rateLimitReached
    )
      return

    setIsGeneratingInsight(true)
    try {
      const newInsight = await generateInsight({ knownData, metricIds })
      setInsight(newInsight)
    } catch (error) {
      const status = await checkRateLimitStatus()
      setRateLimitReached(status.rateLimitReached)
    } finally {
      setIsGeneratingInsight(false)
    }
  }

  const handleClearInsight = () => setInsight('')

  if (!SHOW_INSIGHT_GENERATION || rateLimitReached) {
    return null
  }

  return (
    <>
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
      <p className='m-0 p-8 text-center text-altDark text-text smMd:text-smallestHeader'>
        {isGeneratingInsight ? 'Generating insight...' : insight}
      </p>
    </>
  )
}

export default InsightDisplay
