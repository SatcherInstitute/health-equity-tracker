import type React from 'react'
import { Fips } from '../data/utils/Fips'
import { METRIC_CONFIG, type DataTypeConfig } from '../data/config/MetricConfig'
import MapCard from '../cards/MapCard'
import { AGE } from '../data/utils/Constants'
import type { DemographicType } from '../data/query/Breakdowns'

interface CustomChoroplethProps {
  fips?: Fips
  dataTypeConfig?: DataTypeConfig
  demographicType?: DemographicType
  reportTitle?: string
  className?: string
}

const CustomChoroplethMap: React.FC<CustomChoroplethProps> = ({
  fips = new Fips('00'),
  dataTypeConfig = METRIC_CONFIG['gun_violence_youth'][0],
  demographicType = AGE,
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
