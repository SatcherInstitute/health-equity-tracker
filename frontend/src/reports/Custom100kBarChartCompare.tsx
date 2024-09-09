import type React from 'react'
import SimpleBarChartCard from '../cards/SimpleBarChartCard'
import { Fips } from '../data/utils/Fips'
import { METRIC_CONFIG } from '../data/config/MetricConfig'
import type { DataTypeConfig } from '../data/config/MetricConfigTypes'

const Custom100kBarChartCompare: React.FC = () => {
  const fips = new Fips('13')
  const dataTypeConfigIncarceration: DataTypeConfig =
    METRIC_CONFIG['incarceration'][0]
  const dataTypeConfigPoverty: DataTypeConfig = METRIC_CONFIG['poverty'][0]

  return (
    <div>
      <div className='grid grid-cols-2'>
        <SimpleBarChartCard
          dataTypeConfig={dataTypeConfigPoverty}
          demographicType='race_and_ethnicity'
          fips={fips}
          reportTitle={`Poverty in ${fips.getFullDisplayName()}`}
        />
        <SimpleBarChartCard
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
