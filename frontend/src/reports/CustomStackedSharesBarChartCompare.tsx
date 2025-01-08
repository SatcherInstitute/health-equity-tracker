import type React from 'react'
import { METRIC_CONFIG } from '../data/config/MetricConfig'
import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import { Fips } from '../data/utils/Fips'
import StackedSharesBarChartCard from '../cards/DisparityBarChartCard'

const CustomStackedSharesBarChartCompare: React.FC = () => {
  const fipsFlorida = new Fips('12')
  const fipsCalifornia = new Fips('06')
  const dataTypeConfig: DataTypeConfig = METRIC_CONFIG['health_insurance'][0]

  return (
    <div className='flex justify-around'>
      <div className='mx-2 flex-1'>
        <StackedSharesBarChartCard
          dataTypeConfig={dataTypeConfig}
          demographicType='sex'
          fips={fipsFlorida}
          reportTitle={`Uninsurance in Florida by Sex`}
        />
      </div>
      <div className='mx-2 flex-1'>
        <StackedSharesBarChartCard
          dataTypeConfig={dataTypeConfig}
          demographicType='sex'
          fips={fipsCalifornia}
          reportTitle={`Uninsurance in FL & CA by Sex`}
        />
      </div>
    </div>
  )
}

export default CustomStackedSharesBarChartCompare
