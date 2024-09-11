import type React from 'react'
import { Fips } from '../data/utils/Fips'
import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import TableCard from '../cards/TableCard'
import { SEX } from '../data/utils/Constants'
import type { DemographicType } from '../data/query/Breakdowns'
import { GUN_VIOLENCE_METRICS } from '../data/config/MetricConfigCommunitySafety'

interface CustomBreakdownSummaryProps {
  headerScrollMargin?: string
  fips?: Fips
  dataTypeConfig?: DataTypeConfig
  demographicType?: DemographicType
  reportTitle?: string
  className?: string
}

const CustomBreakdownSummary: React.FC<CustomBreakdownSummaryProps> = ({
  fips = new Fips('00'),
  demographicType = SEX,
  reportTitle = 'Demographic Summary',
  className,
}) => {
  const dataTypeConfig: DataTypeConfig = GUN_VIOLENCE_METRICS[1]

  return (
    <TableCard
      fips={fips}
      dataTypeConfig={dataTypeConfig}
      demographicType={demographicType}
      reportTitle={reportTitle}
      className={`max-w-eighty ${className}`}
    />
    
  )
}

export default CustomBreakdownSummary
