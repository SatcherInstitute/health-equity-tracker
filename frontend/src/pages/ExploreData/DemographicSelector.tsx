import type { DemographicType } from '../../data/query/Breakdowns'
import { useParamState } from '../../utils/hooks/useParamState'
import { DEMOGRAPHIC_PARAM } from '../../utils/urlutils'
import MadLibAbstractSelector from './MadLibAbstractSelector'

interface DemographicSelectorProps {
  options: Array<[DemographicType, string]>
}

export default function DemographicSelector({
  options,
}: DemographicSelectorProps) {
  const defaultDemo: DemographicType = options[0][0]
  const [demographicType, setDemographicType] = useParamState<DemographicType>(
    DEMOGRAPHIC_PARAM,
    defaultDemo,
  )

  return (
    <MadLibAbstractSelector
      options={options}
      selectedValue={demographicType}
      onSelect={(value) => setDemographicType(value)}
    />
  )
}
