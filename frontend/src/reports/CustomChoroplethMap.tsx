import type React from 'react'
import MapCard from '../cards/MapCard'
import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import type { DemographicType } from '../data/query/Breakdowns'
import { Fips } from '../data/utils/Fips'
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
      updateFipsCallback={(_fips: Fips) => {}}
      trackerMode={'disparity'}
      className={className}
    />
  )
}

export default CustomChoroplethMap
