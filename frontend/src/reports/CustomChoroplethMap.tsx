import type React from 'react'
import { Fips } from '../data/utils/Fips'
import { METRIC_CONFIG } from '../data/config/MetricConfig'
import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import MapCard from '../cards/MapCard'
import type { DemographicType } from '../data/query/Breakdowns'
import { getConfigFromDataTypeId } from '../utils/MadLibs'

interface CustomChoroplethProps {
  fips?: Fips
  dataTypeConfig?: DataTypeConfig
  demographicType?: DemographicType
  reportTitle?: string
  className?: string
}

const CustomChoroplethMap: React.FC<CustomChoroplethProps> = ({
  fips = new Fips('00'),
  dataTypeConfig = getConfigFromDataTypeId('gun_deaths_young_adults'),
  demographicType = 'race_and_ethnicity',
  reportTitle = 'Custom Choropleth Rate Map',
  className,
}) => {
  return (
    <MapCard
      dataTypeConfig={dataTypeConfig}
      demographicType={demographicType}
      fips={fips}
      reportTitle={reportTitle}
      updateFipsCallback={(fips: Fips) => {}}
      trackerMode={'disparity'}
      className={className}
    />
  )
}

export default CustomChoroplethMap
