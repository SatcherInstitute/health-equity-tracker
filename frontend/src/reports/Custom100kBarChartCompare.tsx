import type React from 'react'
import RateBarChartCard from '../cards/RateBarChartCard'
import { METRIC_CONFIG } from '../data/config/MetricConfig'
import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import { Fips } from '../data/utils/Fips'

const Custom100kBarChartCompare: React.FC = () => {
  const fips = new Fips('13')
  const dataTypeConfigIncarceration: DataTypeConfig =
    METRIC_CONFIG['incarceration'][0]
  const dataTypeConfigPoverty: DataTypeConfig = METRIC_CONFIG['poverty'][0]

  return (
    <div>
      <div className='grid grid-cols-2'>
        <RateBarChartCard
          dataTypeConfig={dataTypeConfigPoverty}
          demographicType='race_and_ethnicity'
          fips={fips}
          reportTitle={`Poverty in ${fips.getFullDisplayName()}`}
        />
        <RateBarChartCard
          dataTypeConfig={dataTypeConfigIncarceration}
          demographicType='race_and_ethnicity'
          fips={fips}
          reportTitle={`Incarceration in ${fips.getFullDisplayName()}`}
        />
      </div>
    </div>
  )
}

export default Custom100kBarChartCompare
