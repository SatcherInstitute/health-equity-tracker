import type React from 'react'
import DisparityBarChartCard from '../cards/DisparityBarChartCard'
import { Fips } from '../data/utils/Fips'
import { METRIC_CONFIG, type DataTypeConfig } from '../data/config/MetricConfig'

const CustomDisparityBarChart: React.FC = () => {
  const fipsFlorida = new Fips('12')
  const fipsCalifornia = new Fips('06')
  const dataTypeConfig: DataTypeConfig = METRIC_CONFIG['health_insurance'][0]

  return (
    
      <div>
        <DisparityBarChartCard
          dataTypeConfig={dataTypeConfig}
          demographicType='sex'
          fips={fipsFlorida}
          reportTitle={`Uninsurance in Florida by Sex`}
        />
      </div>
   
  )
}

export default CustomDisparityBarChart
