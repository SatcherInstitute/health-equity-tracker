import type React from 'react'
import DisparityBarChartCard from '../cards/DisparityBarChartCard'
import { Fips } from '../data/utils/Fips'
import { METRIC_CONFIG } from '../data/config/MetricConfig'
import type { DataTypeConfig } from '../data/config/MetricConfigTypes'

const CustomDisparityBarChartCompare: React.FC = () => {
  const fipsFlorida = new Fips('12')
  const fipsCalifornia = new Fips('06')
  const dataTypeConfig: DataTypeConfig = METRIC_CONFIG['health_insurance'][0]

  return (
    <div className='flex justify-around'>
      <div className='flex-1 mx-2'>
        <DisparityBarChartCard
          dataTypeConfig={dataTypeConfig}
          demographicType='sex'
          fips={fipsFlorida}
          reportTitle={`Uninsurance in Florida by Sex`}
        />
      </div>
      <div className='flex-1 mx-2'>
        <DisparityBarChartCard
          dataTypeConfig={dataTypeConfig}
          demographicType='sex'
          fips={fipsCalifornia}
          reportTitle={`Uninsurance in FL & CA by Sex`}
        />
      </div>
    </div>
  )
}

export default CustomDisparityBarChartCompare
