import React from 'react'
import { Fips } from '../data/utils/Fips'
import { METRIC_CONFIG, type DataTypeConfig } from '../data/config/MetricConfig'
import TableCard from '../cards/TableCard'
import { RACE } from '../data/utils/Constants';

interface CustomBreakdownSummaryProps {
  headerScrollMargin?: string;
  fips?: Fips;
  demographicType?: string;
  reportTitle?: string;
}

const CustomBreakdownSummary: React.FC<CustomBreakdownSummaryProps> = ({
  headerScrollMargin = '50px',
  fips = new Fips('00'),  // Default FIPS code for the USA
  demographicType = RACE,
  reportTitle = 'Demographic Breakdown Summary',
}) => {
  const dataTypeConfig: DataTypeConfig = METRIC_CONFIG['covid'][0]

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
        demographicType={RACE}
        reportTitle={reportTitle}
      />
    </div>
  )
}

export default CustomBreakdownSummary