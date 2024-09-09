import type React from 'react'
import LazyLoad from 'react-lazyload'
import { Fips } from '../data/utils/Fips'
import { METRIC_CONFIG, type DataTypeConfig } from '../data/config/MetricConfig'
import UnknownsMapCard from '../cards/UnknownsMapCard'
import { UNKNOWN_RACE } from '../data/utils/Constants'

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
      <LazyLoad offset={800} height={750} once>
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
      </LazyLoad>
    </div>
  )
}

export default CustomUnknownMap
