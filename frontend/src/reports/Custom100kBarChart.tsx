import type React from 'react'
import RateBarChartCard from '../cards/RateBarChartCard'
import { METRIC_CONFIG } from '../data/config/MetricConfig'
import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import type { DemographicType } from '../data/query/Breakdowns'
import { RACE } from '../data/utils/Constants'
import { Fips } from '../data/utils/Fips'

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
  className,
}) => {
  return (
    <RateBarChartCard
      className={className}
      dataTypeConfig={dataTypeConfig}
      demographicType={demographicType}
      fips={fips}
      reportTitle={reportTitle}
    />
  )
}

export default Custom100kBarChart
