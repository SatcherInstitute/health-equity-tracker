import type React from 'react'
import { Fips } from '../data/utils/Fips'
import { METRIC_CONFIG, type DataTypeConfig } from '../data/config/MetricConfig'
import MapCard from '../cards/MapCard'

const CustomChoroplethMap: React.FC = () => {
  const fips = new Fips('00')
  const dataTypeConfig: DataTypeConfig = METRIC_CONFIG['gun_violence_youth'][0]
  const reportTitle = 'Example Choropleth Rate Map'

  return (
    <div>
      <MapCard
              dataTypeConfig={dataTypeConfig}
              demographicType='race_and_ethnicity'
              fips={fips}
              reportTitle={reportTitle} updateFipsCallback={ (fips: Fips) => { }} trackerMode={'disparity'}      />
    </div>
  )
}

export default CustomChoroplethMap
