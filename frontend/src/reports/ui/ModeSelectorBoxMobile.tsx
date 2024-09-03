import SimpleSelect from '../../pages/ui/SimpleSelect'
import JumpToSelect from '../../pages/ui/JumpToSelect'
import { MADLIB_MODE_MAP, type MadLibId } from '../../utils/MadLibs'
import type { DemographicType } from '../../data/query/Breakdowns'
import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'
import { reportProviderSteps } from '../ReportProviderSteps'

interface ModeSelectorBoxMobileProps {
  trackerMode: MadLibId
  setTrackerMode: React.Dispatch<React.SetStateAction<MadLibId>>
  demographicType: DemographicType
  setDemographicType: (demographic: DemographicType) => void
  offerJumpToAgeAdjustment: boolean
  enabledDemographicOptionsMap: any
  disabledDemographicOptions?: string[][]
}

const scrollableHashIdMap: Record<string, ScrollableHashId> = {}
for (const [key, value] of Object.entries(reportProviderSteps)) {
  scrollableHashIdMap[value.label] = key as ScrollableHashId
}

export default function ModeSelectorBoxMobile(
  props: ModeSelectorBoxMobileProps,
) {
  return (
    <div className='mode-selector-box-mobile m-2 flex justify-start rounded-sm bg-white p-2 shadow-raised md:hidden'>
      <div>
        <SimpleSelect<DemographicType>
          label='Demographic'
          optionsMap={props.enabledDemographicOptionsMap}
          disabledOptions={props.disabledDemographicOptions}
          selected={props.demographicType}
          setSelected={props.setDemographicType}
        />
        <SimpleSelect<MadLibId>
          label='Compare mode'
          optionsMap={MADLIB_MODE_MAP}
          selected={props.trackerMode}
          setSelected={props.setTrackerMode}
        />
        <JumpToSelect
          offerJumpToAgeAdjustment={props.offerJumpToAgeAdjustment}
        />
      </div>
    </div>
  )
}
