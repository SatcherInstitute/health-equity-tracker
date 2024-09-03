import type React from 'react'
import SimpleBarChartCard from '../cards/SimpleBarChartCard'
import { Fips } from '../data/utils/Fips'
import { METRIC_CONFIG, type DataTypeConfig } from '../data/config/MetricConfig'
import { RACE } from '../data/utils/Constants'
import type { DemographicType } from '../data/query/Breakdowns'

interface Custom100kBarChartProps {
  fips?: Fips
  dataTypeConfig?: DataTypeConfig
  demographicType?: DemographicType
  reportTitle?: string
  className?: string
}

const Custom100kBarChart: React.FC<Custom100kBarChartProps> = ({
  fips = new Fips('13'),
  dataTypeConfig = METRIC_CONFIG['poverty'][0],
  demographicType = RACE, 
  reportTitle = `Poverty in ${new Fips('13').getFullDisplayName()}`,
  className
}) => {
  return (
    <SimpleBarChartCard
      className={className}
      dataTypeConfig={dataTypeConfig}
      demographicType={demographicType}
      fips={fips}
      reportTitle={reportTitle}
    />
  );
}

export default Custom100kBarChart