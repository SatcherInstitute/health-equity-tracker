import { Card } from '@mui/material'
import styles from './ModeSelectorBoxMobile.module.scss'
import { MADLIB_MODE_MAP, type MadLibId } from '../../utils/MadLibs'
import {
  DEMOGRAPHIC_BREAKDOWNS_MAP,
  type BreakdownVar,
} from '../../data/query/Breakdowns'
import SimpleSelect from '../../pages/ui/SimpleSelect'
import { type ScrollableHashId } from '../../utils/hooks/useStepObserver'
import { reportProviderSteps } from '../ReportProviderSteps'
import JumpToSelect from '../../pages/ui/JumpToSelect'
import {
  METRIC_CONFIG,
  type DropdownVarId,
  type VariableConfig,
} from '../../data/config/MetricConfig'

interface ModeSelectorBoxMobileProps {
  trackerMode: MadLibId
  setTrackerMode: React.Dispatch<React.SetStateAction<MadLibId>>
  trackerDemographic: BreakdownVar
  setDemoWithParam: (demographic: BreakdownVar) => void
  offerJumpToAgeAdjustment: boolean
  dropdownVarId: DropdownVarId
  variableConfig: VariableConfig | null
  setVariableConfig: (v: VariableConfig) => void
  dropdownVarId2?: DropdownVarId
  variableConfig2?: VariableConfig | null
  setVariableConfig2?: (v: VariableConfig) => void
}

const scrollableHashIdMap: Record<string, ScrollableHashId> = {}
for (const [key, value] of Object.entries(reportProviderSteps)) {
  scrollableHashIdMap[value.label] = key as ScrollableHashId
}

export default function ModeSelectorBoxMobile(
  props: ModeSelectorBoxMobileProps
) {
  const hasDataTypes = METRIC_CONFIG[props.dropdownVarId]?.length > 1
  const dataTypesMap: Record<string, VariableConfig> = {}
  METRIC_CONFIG[props.dropdownVarId].forEach(
    (variableConfig: VariableConfig) => {
      dataTypesMap[variableConfig.variableDisplayName] = variableConfig
    }
  )
  const hasSecondDataTypes =
    props.dropdownVarId2 && METRIC_CONFIG[props.dropdownVarId2].length > 1
  const secondDataTypesMap: Record<string, VariableConfig> = {}

  if (hasSecondDataTypes && props.dropdownVarId2) {
    METRIC_CONFIG[props.dropdownVarId2].forEach(
      (variableConfig: VariableConfig) => {
        secondDataTypesMap[variableConfig.variableDisplayName] = variableConfig
      }
    )
  }

  return (
    <div className="mode-selector-box-mobile">
      <Card raised={true} className={styles.ModeSelectorBoxMobile}>
        {hasDataTypes && (
          <SimpleSelect<VariableConfig>
            label="Data type"
            optionsMap={dataTypesMap}
            selected={props?.variableConfig ?? METRIC_CONFIG.covid_cases[0]}
            setSelected={props.setVariableConfig}
          />
        )}
        {hasSecondDataTypes && props.setVariableConfig2 && (
          <SimpleSelect<VariableConfig>
            label="Comparison Data type"
            optionsMap={secondDataTypesMap}
            selected={props?.variableConfig2 ?? METRIC_CONFIG.covid_deaths[0]}
            setSelected={props.setVariableConfig2}
          />
        )}
        <SimpleSelect<BreakdownVar>
          label="Demographic"
          optionsMap={DEMOGRAPHIC_BREAKDOWNS_MAP}
          selected={props.trackerDemographic}
          setSelected={props.setDemoWithParam}
        />
        <SimpleSelect<MadLibId>
          label="Compare mode"
          optionsMap={MADLIB_MODE_MAP}
          selected={props.trackerMode}
          setSelected={props.setTrackerMode}
        />
        <JumpToSelect
          offerJumpToAgeAdjustment={props.offerJumpToAgeAdjustment}
        />
      </Card>
    </div>
  )
}
