import React from "react";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import { Grid } from "@material-ui/core";
import {
  DropdownVarId,
  METRIC_CONFIG,
  VariableConfig,
  VariableId,
} from "../../data/config/MetricConfig";
import styles from "../Report.module.scss";
import {
  BreakdownVar,
  DEMOGRAPHIC_BREAKDOWNS,
  BREAKDOWN_VAR_DISPLAY_NAMES,
  GeographicBreakdown,
} from "../../data/query/Breakdowns";
import { Fips } from "../../data/utils/Fips";
import { DATA_GAPS } from "../../data/utils/datasetutils";

export const DATA_TYPE_LABEL = "Data Type";
export const DEMOGRAPHIC_LABEL = "Demographic";

/* 
Checks for data gaps at current Datatype/Demographic/GeoLevel and 
*/
function getToggleOptionStatus(
  breakdownVar: BreakdownVar,
  variableId: VariableId,
  fips: Fips
) {
  const geoLevel = fips.getFipsTypeDisplayName() as GeographicBreakdown;
  return DATA_GAPS[geoLevel]?.[breakdownVar]?.includes(variableId);
}

interface ReportToggleControlsProps {
  dropdownVarId: DropdownVarId;
  variableConfig: VariableConfig;
  setVariableConfig: (variableConfig: VariableConfig) => void;
  currentBreakdown: BreakdownVar;
  setCurrentBreakdown: (breakdown: BreakdownVar) => void;
  fips: Fips;
  excludeId?: boolean;
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
          <div className={styles.ToggleLabel}>
            {props.dropdownVarId.replaceAll("_", " ") + " " + DATA_TYPE_LABEL}
          </div>
          {/* DATA TYPE TOGGLE */}
          <ToggleButtonGroup
            id={props.excludeId ? undefined : "onboarding-explore-datatypes"}
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
                <ToggleButton
                  value={variable.variableId}
                  key={key}
                  aria-label={
                    variable.variableDisplayName + " " + DATA_TYPE_LABEL
                  }
                >
                  {variable.variableDisplayName}
                </ToggleButton>
              )
            )}
          </ToggleButtonGroup>
        </Grid>
      )}
      <Grid item className={styles.ToggleBlock}>
        <div className={styles.ToggleLabel}>{DEMOGRAPHIC_LABEL}</div>
        <div id={props.excludeId ? undefined : "onboarding-explore-trends"}>
          {/* DEMOGRAPHIC TOGGLE */}
          <ToggleButtonGroup
            exclusive
            value={props.currentBreakdown}
            onChange={(e, v) => {
              if (v !== null) {
                props.setCurrentBreakdown(v);
              }
            }}
          >
            {DEMOGRAPHIC_BREAKDOWNS.map((breakdownVar) => {
              const disabled = getToggleOptionStatus(
                breakdownVar,
                props.variableConfig.variableId,
                props.fips
              );

              return (
                <ToggleButton
                  disabled={disabled}
                  value={breakdownVar}
                  key={breakdownVar}
                  aria-label={
                    BREAKDOWN_VAR_DISPLAY_NAMES[breakdownVar] +
                    " " +
                    DEMOGRAPHIC_LABEL
                  }
                >
                  {BREAKDOWN_VAR_DISPLAY_NAMES[breakdownVar]}
                </ToggleButton>
              );
            })}
          </ToggleButtonGroup>
        </div>
      </Grid>
    </Grid>
  );
}

export default ReportToggleControls;
