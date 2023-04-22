import { type VariableConfig } from '../../data/config/MetricConfig'
import { type DemographicGroup } from '../../data/utils/Constants'
import { type Fips } from '../../data/utils/Fips'
import { type ScrollableHashId } from '../../utils/hooks/useStepObserver'
import MapBreadcrumbs from './MapBreadcrumbs'

interface PopulationFootnoteProps {
  fips: Fips
  totalPopulation: number
  selectedPopulation: number
  selectedGroup: DemographicGroup
  updateFipsCallback: (fips: Fips) => void
  variableConfig: VariableConfig
}

const HASH_ID: ScrollableHashId = 'rate-map'

export default function PopulationFootnote(props: PopulationFootnoteProps) {
  return (
    <>
      <MapBreadcrumbs
        fips={props.fips}
        updateFipsCallback={props.updateFipsCallback}
        ariaLabel={props.variableConfig.variableFullDisplayName}
        scrollToHashId={HASH_ID}
        endNote={`Population ${props.totalPopulation}`}
      />
    </>
  )
}
