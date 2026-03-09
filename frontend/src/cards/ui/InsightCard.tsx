import type React from 'react'
import type {
  MetricConfig,
  MetricId
} from '../../data/config/MetricConfigTypes'
import type { DemographicType } from '../../data/query/Breakdowns'
import type { MetricQueryResponse } from '../../data/query/MetricQuery'
import type { Fips } from '../../data/utils/Fips'
import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'

export type InsightCardProps = {
  demographicType: DemographicType
  metricIds: MetricId[]
  queryResponses: MetricQueryResponse[]
  shareConfig: MetricConfig
  hashId: ScrollableHashId
  fips?: Fips
  insight: string
  isGeneratingInsight: boolean
}

const InsightCard: React.FC<InsightCardProps> = ({
  insight,
  isGeneratingInsight,
}) => {
  const showPanel = isGeneratingInsight || !!insight

  if (!showPanel) return null

  return (
    <p className='m-0 pl-4 pr-20 py-3 text-left text-alt-dark text-small'>
      {isGeneratingInsight ? 'Analyzing health equity data with AI...' : insight}
    </p>
  )
}

export default InsightCard
