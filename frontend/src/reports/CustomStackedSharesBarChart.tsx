import type React from 'react'
import StackedSharesBarChartCard from '../cards/StackedSharesBarChartCard'
import { METRIC_CONFIG } from '../data/config/MetricConfig'
import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import type { DemographicType } from '../data/query/Breakdowns'
import { Fips } from '../data/utils/Fips'

interface CustomStackedSharesBarChartProps {
  fips?: Fips
  dataTypeConfig?: DataTypeConfig
  demographicType?: DemographicType
  reportTitle?: string
  className?: string
}

const CustomStackedSharesBarChart: React.FC<
  CustomStackedSharesBarChartProps
> = ({
  fips = new Fips('12'),
  dataTypeConfig = METRIC_CONFIG['health_insurance'][0],
  demographicType = 'sex',
  reportTitle = 'Uninsurance in Florida by Sex',
  className,
}) => {
  return (
    <StackedSharesBarChartCard
      dataTypeConfig={dataTypeConfig}
      demographicType={demographicType}
      fips={fips}
      reportTitle={reportTitle}
      className={className}
    />
  )
}

export default CustomStackedSharesBarChart
