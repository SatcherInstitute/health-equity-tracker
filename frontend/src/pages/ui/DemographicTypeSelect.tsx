import { useAtom } from 'jotai'
import { type BreakdownVar } from '../../data/query/Breakdowns'
import SimpleSelect from './SimpleSelect'
import { selectedDemographicTypeAtom } from '../../utils/sharedSettingsState'
import { DEMOGRAPHIC_PARAM, setParameter } from '../../utils/urlutils'

interface DemographicTypeSelectProps {
  demographicOptionsMap: any
  disabledDemographicOptions?: string[][]
}

export default function DemographicTypeSelect(
  props: DemographicTypeSelectProps
) {
  const [trackerDemographic, setTrackerDemographic] = useAtom(
    selectedDemographicTypeAtom
  )

  function setDemoWithParam(newDemographicType: BreakdownVar) {
    setTrackerDemographic(newDemographicType)
    setParameter(DEMOGRAPHIC_PARAM, newDemographicType)
  }

  return (
    <SimpleSelect<BreakdownVar>
      label="Demographic"
      optionsMap={props.demographicOptionsMap}
      disabledOptions={props.disabledDemographicOptions}
      selected={trackerDemographic}
      setSelected={setDemoWithParam}
    />
  )
}
