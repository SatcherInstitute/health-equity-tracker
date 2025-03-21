import type React from 'react'
import ShareTrendsChartCard from '../cards/ShareTrendsChartCard'
import { METRIC_CONFIG } from '../data/config/MetricConfig'
import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import type { DemographicType } from '../data/query/Breakdowns'
import { Fips } from '../data/utils/Fips'

interface CustomShareTrendsLineChartProps {
  fips?: Fips
  dataTypeConfig?: DataTypeConfig
  demographicType?: DemographicType
  reportTitle?: string
  isCompareCard?: boolean
  className?: string
}

const CustomShareTrendsLineChart: React.FC<CustomShareTrendsLineChartProps> = ({
  fips = new Fips('13121'),
  dataTypeConfig = METRIC_CONFIG['covid'][1],
  demographicType = 'age',
  reportTitle = 'COVID Deaths in Fulton County by Age',
  isCompareCard = true,
  className,
}) => {
  return (
    <ShareTrendsChartCard
      dataTypeConfig={dataTypeConfig}
      demographicType={demographicType}
      fips={fips}
      reportTitle={reportTitle}
      isCompareCard={isCompareCard}
      className={className}
    />
  )
}

export default CustomShareTrendsLineChart
