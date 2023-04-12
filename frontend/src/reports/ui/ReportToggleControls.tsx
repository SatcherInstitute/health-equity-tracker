import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { Grid } from '@mui/material'
import {
  type DropdownVarId,
  METRIC_CONFIG,
  type VariableConfig,
} from '../../data/config/MetricConfig'
import styles from '../Report.module.scss'
import { type BreakdownVar } from '../../data/query/Breakdowns'
import { type Fips } from '../../data/utils/Fips'

export const DATA_TYPE_LABEL = 'Data Type'
export const DEMOGRAPHIC_LABEL = 'Demographic'

interface ReportToggleControlsProps {
  dropdownVarId: DropdownVarId
  variableConfig: VariableConfig
  setVariableConfig: (variableConfig: VariableConfig) => void
  currentBreakdown: BreakdownVar
  setCurrentBreakdown: (breakdown: BreakdownVar) => void
  fips: Fips
  excludeId?: boolean
}

// This wrapper ensures the proper key is set to create a new instance when
// required rather than relying on the card caller.
export function ReportToggleControls(props: ReportToggleControlsProps) {
  return (
    <ReportToggleControlsWithKey
      key={props.dropdownVarId + props.variableConfig.variableId}
      {...props}
    />
  )
}

function ReportToggleControlsWithKey(props: ReportToggleControlsProps) {
  const enableMetricToggle =
    !!METRIC_CONFIG[props.dropdownVarId] &&
    METRIC_CONFIG[props.dropdownVarId].length > 1

  return (
    <Grid container>
      {enableMetricToggle && (
        <Grid className={styles.ToggleBlock}>
          <div className={styles.ToggleLabel}>
            {props.dropdownVarId.replaceAll('_', ' ') + ' ' + DATA_TYPE_LABEL}
          </div>
          {/* DATA TYPE TOGGLE */}
          <ToggleButtonGroup
            id={props.excludeId ? undefined : 'onboarding-explore-datatypes'}
            exclusive
            value={props.variableConfig.variableId}
            onChange={(e, variableId) => {
              if (variableId !== null && METRIC_CONFIG[props.dropdownVarId]) {
                props.setVariableConfig(
                  METRIC_CONFIG[props.dropdownVarId].find(
                    (variableConfig) => variableConfig.variableId === variableId
                  ) as VariableConfig
                )
              }
            }}
          >
            {METRIC_CONFIG[props.dropdownVarId].map(
              (variable: VariableConfig, key: number) => (
                <ToggleButton
                  value={variable.variableId}
                  key={key}
                  aria-label={
                    variable.variableDisplayName + ' ' + DATA_TYPE_LABEL
                  }
                >
                  {variable.variableDisplayName}
                </ToggleButton>
              )
            )}
          </ToggleButtonGroup>
        </Grid>
      )}
    </Grid>
  )
}

export default ReportToggleControls
