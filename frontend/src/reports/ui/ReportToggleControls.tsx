import React from "react";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import { Grid } from "@material-ui/core";
import { DropdownVarId } from "../../utils/MadLibs";
import { METRIC_CONFIG, VariableConfig } from "../../data/config/MetricConfig";
import styles from "../Report.module.scss";
import {
  BreakdownVar,
  DEMOGRAPHIC_BREAKDOWNS,
  BREAKDOWN_VAR_DISPLAY_NAMES,
} from "../../data/query/Breakdowns";

interface ReportToggleControlsProps {
  dropdownVarId: DropdownVarId;
  variableConfig: VariableConfig;
  setVariableConfig: (variableConfig: VariableConfig) => void;
  currentBreakdown: BreakdownVar;
  setCurrentBreakdown: (breakdown: BreakdownVar) => void;
}

// This wrapper ensures the proper key is set to create a new instance when
// required rather than relying on the card caller.
export function ReportToggleControls(props: ReportToggleControlsProps) {
  return (
    <ReportToggleControlsWithKey
      key={props.dropdownVarId + props.variableConfig.variableId}
      {...props}
    />
  );
}

function ReportToggleControlsWithKey(props: ReportToggleControlsProps) {
  const enableMetricToggle =
    !!METRIC_CONFIG[props.dropdownVarId] &&
    METRIC_CONFIG[props.dropdownVarId].length > 1;

  return (
    <Grid container>
      {enableMetricToggle && (
        <Grid className={styles.ToggleBlock}>
          <span className={styles.ToggleLabel}>Data Type</span>
          <ToggleButtonGroup
            exclusive
            value={props.variableConfig.variableId}
            onChange={(e, variableId) => {
              if (variableId !== null && METRIC_CONFIG[props.dropdownVarId]) {
                props.setVariableConfig(
                  METRIC_CONFIG[props.dropdownVarId].find(
                    (variableConfig) => variableConfig.variableId === variableId
                  ) as VariableConfig
                );
              }
            }}
          >
            {METRIC_CONFIG[props.dropdownVarId].map(
              (variable: VariableConfig, key: number) => (
                <ToggleButton value={variable.variableId} key={key}>
                  {variable.variableDisplayName}
                </ToggleButton>
              )
            )}
          </ToggleButtonGroup>
        </Grid>
      )}
      <Grid item className={styles.ToggleBlock}>
        <div className={styles.ToggleLabel}>Demographic</div>
        <div id="onboarding-explore-trends">
          <ToggleButtonGroup
            exclusive
            value={props.currentBreakdown}
            onChange={(e, v) => {
              if (v !== null) {
                props.setCurrentBreakdown(v);
              }
            }}
          >
            {DEMOGRAPHIC_BREAKDOWNS.map((breakdownVar) => (
              <ToggleButton value={breakdownVar} key={breakdownVar}>
                {BREAKDOWN_VAR_DISPLAY_NAMES[breakdownVar]}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>
      </Grid>
    </Grid>
  );
}

export default ReportToggleControls;
