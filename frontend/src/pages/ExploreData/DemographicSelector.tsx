import { useAtomValue, useSetAtom } from 'jotai'
import type { DemographicType } from '../../data/query/Breakdowns'
import { locationAtom, urlParamAtom } from '../../utils/sharedSettingsState'
import {
  DEMOGRAPHIC_PARAM,
  MAP1_GROUP_PARAM,
  MAP2_GROUP_PARAM,
} from '../../utils/urlutils'
import MadLibAbstractSelector from './MadLibAbstractSelector'

interface DemographicSelectorProps {
  options: Array<[DemographicType, string]>
}

export default function DemographicSelector({
  options,
}: DemographicSelectorProps) {
  const defaultDemo: DemographicType = options[0][0]
  const demoParam = useAtomValue(urlParamAtom(DEMOGRAPHIC_PARAM))
  const setLocationState = useSetAtom(locationAtom)
  const demographicType = (demoParam || defaultDemo) as DemographicType

  function handleSelect(value: DemographicType) {
    if (value === demographicType) return
    setLocationState((prev) => {
      const params = new URLSearchParams(prev.searchParams)
      params.set(DEMOGRAPHIC_PARAM, value)
      // Group selections are demographic-specific ("85+" is not a race), so
      // clear them in the same write that changes the demographic type.
      params.delete(MAP1_GROUP_PARAM)
      params.delete(MAP2_GROUP_PARAM)
      return { ...prev, searchParams: params }
    })
  }

  return (
    <MadLibAbstractSelector
      options={options}
      selectedValue={demographicType}
      onSelect={handleSelect}
    />
  )
}
