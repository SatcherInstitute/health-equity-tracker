import type React from 'react'
import ShareTrendsChartCard from '../cards/ShareTrendsChartCard'
import { Fips } from '../data/utils/Fips'
import { METRIC_CONFIG, type DataTypeConfig } from '../data/config/MetricConfig'

const CustomShareTrendsLineChart: React.FC = () => {
  const fips = new Fips('13121')
  const dataTypeConfig: DataTypeConfig = METRIC_CONFIG['covid'][1]
  const reportTitle = 'COVID Deaths in Fulton County by Age'

  return (
    <div>
      <ShareTrendsChartCard
        dataTypeConfig={dataTypeConfig}
        demographicType='age'
        fips={fips}
        reportTitle={reportTitle}
        isCompareCard={true}
      />
    </div>
  )
}

export default CustomShareTrendsLineChart
