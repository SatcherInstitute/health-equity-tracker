import type React from 'react'
import UnknownsMapCard from '../cards/UnknownsMapCard'
import { METRIC_CONFIG } from '../data/config/MetricConfig'
import type { DataTypeConfig } from '../data/config/MetricConfigTypes'
import { UNKNOWN_RACE } from '../data/utils/Constants'
import { Fips } from '../data/utils/Fips'
import HetLazyLoader from '../styles/HetComponents/HetLazyLoader'

interface CustomUnknownMapProps {
  headerScrollMargin?: string
  fips?: Fips
  updateFipsCallback?: (fips: Fips) => void
  demographicType?: string
  shareMetricConfig?: boolean
  reportTitle?: string
}

const CustomUnknownMap: React.FC<CustomUnknownMapProps> = ({
  headerScrollMargin = '50px',
  fips = new Fips('00'),
  updateFipsCallback = (fips: Fips) => {},
  demographicType = UNKNOWN_RACE,
  shareMetricConfig = true,
  reportTitle = 'Custom Unknown Map Report',
}) => {
  const dataTypeConfig: DataTypeConfig = METRIC_CONFIG['covid'][0]

  return (
    <div
      tabIndex={-1}
      className='w-full'
      id='unknown-demographic-map'
      style={{
        scrollMarginTop: headerScrollMargin,
      }}
    >
      <HetLazyLoader offset={800} height={750} once>
        {shareMetricConfig && (
          <UnknownsMapCard
            overrideAndWithOr={demographicType === 'race_and_ethnicity'}
            dataTypeConfig={dataTypeConfig}
            fips={fips}
            updateFipsCallback={updateFipsCallback}
            demographicType={'race_and_ethnicity'}
            reportTitle={reportTitle}
          />
        )}
      </HetLazyLoader>
    </div>
  )
}

export default CustomUnknownMap
