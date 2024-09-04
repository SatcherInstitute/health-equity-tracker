import type React from 'react'
import ShareTrendsChartCard from '../cards/ShareTrendsChartCard'
import { Fips } from '../data/utils/Fips'
import { METRIC_CONFIG, type DataTypeConfig } from '../data/config/MetricConfig'
import type { DemographicType } from '../data/query/Breakdowns'

interface CustomShareTrendsLineChartProps {
  fips?: Fips
  dataTypeConfig?: DataTypeConfig
  demographicType?: DemographicType
  reportTitle?: string
  isCompareCard?: boolean
}

const CustomShareTrendsLineChart: React.FC<CustomShareTrendsLineChartProps> = ({
  fips = new Fips('13121'), // Default to Fulton County, GA FIPS code
  dataTypeConfig = METRIC_CONFIG['covid'][1],
  demographicType = 'age',
  reportTitle = 'COVID Deaths in Fulton County by Age',
  isCompareCard = true,
}) => {
  return (
    <div>
      <ShareTrendsChartCard
        dataTypeConfig={dataTypeConfig}
        demographicType={demographicType}
        fips={fips}
        reportTitle={reportTitle}
        isCompareCard={isCompareCard}
      />
    </div>
  )
}

export default CustomShareTrendsLineChart
