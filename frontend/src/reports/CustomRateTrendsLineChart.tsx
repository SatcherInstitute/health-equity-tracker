import type React from 'react'
import { Fips } from '../data/utils/Fips'
import { METRIC_CONFIG, type DataTypeConfig } from '../data/config/MetricConfig'
import RateTrendsChartCard from '../cards/RateTrendsChartCard'
import type { DemographicType } from '../data/query/Breakdowns'
import { useState } from 'react'
import { BLACK_NH, type DemographicGroup } from '../data/utils/Constants'

interface CustomRateTrendsLineChartProps {
  fips?: Fips
  dataTypeConfig?: DataTypeConfig
  demographicType?: DemographicType
  reportTitle?: string
  className?: string
  selectedTableGroups?: DemographicGroup;
  setSelectedTableGroups?: DemographicGroup
}

const CustomRateTrendsLineChart: React.FC<CustomRateTrendsLineChartProps> = ({
  
  fips = new Fips('00'),
  dataTypeConfig = METRIC_CONFIG['hiv'][0],  
  demographicType = 'race_and_ethnicity',
  reportTitle = 'Custom Rate Trends Line Chart',
  className
}) => {
  const [selectedGroups, setSelectedGroups] = useState<DemographicGroup[]>([])
  return (
      <RateTrendsChartCard
        dataTypeConfig={dataTypeConfig}
        demographicType={demographicType}
        fips={fips}
        reportTitle={reportTitle}
        className={className}
        selectedTableGroups={selectedGroups}
      setSelectedTableGroups={setSelectedGroups}
      />
  )
}

export default CustomRateTrendsLineChart