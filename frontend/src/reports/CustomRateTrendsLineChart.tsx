import type React from 'react'
import { Fips } from '../data/utils/Fips'
import { METRIC_CONFIG, type DataTypeConfig } from '../data/config/MetricConfig'
import RateTrendsChartCard from '../cards/RateTrendsChartCard'

const CustomRateTrendsLineChart: React.FC = () => {
  const fips = new Fips('00')
  const dataTypeConfig: DataTypeConfig = METRIC_CONFIG['hiv'][0]
  const reportTitle = 'Example Report Title'

  return (
    <div>
      <RateTrendsChartCard
        dataTypeConfig={dataTypeConfig}
        demographicType='race_and_ethnicity'
        fips={fips}
        reportTitle={reportTitle}
      />
    </div>
  )
}

export default CustomRateTrendsLineChart
