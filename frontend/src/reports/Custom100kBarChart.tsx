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
}

const Custom100kBarChart: React.FC<Custom100kBarChartProps> = ({
  fips = new Fips('13'), // Default to Georgia FIPS code
  dataTypeConfig = METRIC_CONFIG['poverty'][0],
  demographicType = RACE,
  reportTitle = `Poverty in ${new Fips('13').getFullDisplayName()}`,
}) => {
  return (
    <div>
      <SimpleBarChartCard
        dataTypeConfig={dataTypeConfig}
        demographicType={demographicType}
        fips={fips}
        reportTitle={reportTitle}
      />
    </div>
  )
}

export default Custom100kBarChart
