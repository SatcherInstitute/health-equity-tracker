import type React from 'react'
import DisparityBarChartCard from '../cards/DisparityBarChartCard'
import { Fips } from '../data/utils/Fips'
import { METRIC_CONFIG, type DataTypeConfig } from '../data/config/MetricConfig'
import type { DemographicType } from '../data/query/Breakdowns'

interface CustomDisparityBarChartProps {
  fips?: Fips
  dataTypeConfig?: DataTypeConfig
  demographicType?: DemographicType
  reportTitle?: string
  className?: string
}

const CustomDisparityBarChart: React.FC<CustomDisparityBarChartProps> = ({
  fips = new Fips('12'), 
  dataTypeConfig = METRIC_CONFIG['health_insurance'][0],  
  demographicType = 'sex',  
  reportTitle = 'Uninsurance in Florida by Sex', 
  className
}) => {
  return (
    
      <DisparityBarChartCard
        dataTypeConfig={dataTypeConfig}
        demographicType={demographicType}
        fips={fips}
        reportTitle={reportTitle}
        className={className}
      />
    
  )
}

export default CustomDisparityBarChart