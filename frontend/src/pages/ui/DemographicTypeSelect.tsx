import { type DemographicType } from '../../data/query/Breakdowns'
import SimpleSelect from './SimpleSelect'
import { DEMOGRAPHIC_PARAM } from '../../utils/urlutils'
import { RACE } from '../../data/utils/Constants'
import { useParamState } from '../../utils/hooks/useParamState'

interface DemographicTypeSelectProps {
  demographicOptionsMap: any
  disabledDemographicOptions?: string[][]
}

export default function DemographicTypeSelect(
  props: DemographicTypeSelectProps
) {
  const [demographicType, setDemographicType] = useParamState<DemographicType>(
    /* paramKey */ DEMOGRAPHIC_PARAM,
    /* paramDefaultValue */ RACE
  )

  return (
    <SimpleSelect<DemographicType>
      label="Demographic"
      optionsMap={props.demographicOptionsMap}
      disabledOptions={props.disabledDemographicOptions}
      selected={demographicType}
      setSelected={setDemographicType}
    />
  )
}
