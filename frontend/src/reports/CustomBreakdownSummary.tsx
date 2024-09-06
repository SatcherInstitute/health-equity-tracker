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
}

const CustomBreakdownSummary: React.FC<CustomBreakdownSummaryProps> = ({
  headerScrollMargin = '50px',
  fips = new Fips('00'),
  demographicType = SEX,
  reportTitle = 'Demographic Summary',
}) => {
  const dataTypeConfig: DataTypeConfig = GUN_VIOLENCE_METRICS[1]

  return (
    <div
      tabIndex={-1}
      className='w-full'
      id='data-table'
      style={{
        scrollMarginTop: headerScrollMargin,
      }}
    >
      <TableCard
        fips={fips}
        dataTypeConfig={dataTypeConfig}
        demographicType={demographicType}
        reportTitle={reportTitle}
      />
    </div>
  )
}

export default CustomBreakdownSummary
