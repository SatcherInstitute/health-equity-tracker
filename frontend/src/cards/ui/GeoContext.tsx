import type { DataTypeConfig } from '../../data/config/MetricConfigTypes'
import type { MetricQueryResponse } from '../../data/query/MetricQuery'
import type { Fips } from '../../data/utils/Fips'
import HetBreadcrumbs from '../../styles/HetComponents/HetBreadcrumbs'
import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'
import SviAlert from './SviAlert'

interface GeoContextProps {
  fips: Fips
  updateFipsCallback: (fips: Fips) => void
  dataTypeConfig: DataTypeConfig
  totalPopulationPhrase: string
  subPopulationPhrase: string
  sviQueryResponse: MetricQueryResponse | null
  isAtlantaMode?: boolean
}

const HASH_ID: ScrollableHashId = 'rate-map'

export default function GeoContext(props: GeoContextProps) {
  const { svi } = props.sviQueryResponse?.data?.[0] ?? {}

  return (
    <>
      <HetBreadcrumbs
        fips={props.fips}
        updateFipsCallback={props.updateFipsCallback}
        ariaLabel={props.dataTypeConfig.fullDisplayName}
        scrollToHashId={HASH_ID}
        totalPopulationPhrase={props.totalPopulationPhrase}
        subPopulationPhrase={props.subPopulationPhrase}
        isAtlantaMode={props.isAtlantaMode}
      />
      <div className='md:flex md:items-center'>
        {props.fips.isCounty() && (
          <SviAlert
            svi={svi}
            sviQueryResponse={props.sviQueryResponse}
            fips={props.fips}
          />
        )}
      </div>
    </>
  )
}
