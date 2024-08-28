import type React from 'react'
import DisparityBarChartCard from '../cards/DisparityBarChartCard'
import { Fips } from '../data/utils/Fips'
import { METRIC_CONFIG, type DataTypeConfig } from '../data/config/MetricConfig'
import { DemographicType } from '../data/query/Breakdowns';

interface CustomDisparityBarChartProps {
  fips?: Fips;
  dataTypeConfig?: DataTypeConfig;
  demographicType?: DemographicType;
  reportTitle?: string;
}

const CustomDisparityBarChart: React.FC<CustomDisparityBarChartProps> = ({
  fips = new Fips('12'), 
  dataTypeConfig = METRIC_CONFIG['health_insurance'][0],  
  demographicType = 'sex',  
  reportTitle = 'Uninsurance in Florida by Sex', 
}) => {
  return (
    <div>
      <DisparityBarChartCard
        dataTypeConfig={dataTypeConfig}
        demographicType={demographicType}
        fips={fips}
        reportTitle={reportTitle}
      />
    </div>
  )
}

export default CustomDisparityBarChart