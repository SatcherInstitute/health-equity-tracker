import type React from 'react'
import SimpleBarChartCard from '../cards/SimpleBarChartCard'
import { Fips } from '../data/utils/Fips'
import { METRIC_CONFIG, type DataTypeConfig } from '../data/config/MetricConfig'

const Custom100kBarChart: React.FC = () => {
  const fips = new Fips('13')
  const dataTypeConfigPoverty: DataTypeConfig = METRIC_CONFIG['poverty'][0]

  return (
    <div>
      
        <SimpleBarChartCard
          dataTypeConfig={dataTypeConfigPoverty}
          demographicType='race_and_ethnicity'
          fips={fips}
          reportTitle={`Poverty in ${fips.getFullDisplayName()}`}
        />
      
    </div>
  )
}

export default Custom100kBarChart
