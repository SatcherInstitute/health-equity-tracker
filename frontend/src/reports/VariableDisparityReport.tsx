import React, { useState } from "react";
import { Grid } from "@material-ui/core";
import { BreakdownVar, BREAKDOWN_VAR_DISPLAY_NAMES } from "../data/Breakdowns";
import DisparityBarChartCard from "../cards/DisparityBarChartCard";
import MapCard from "../cards/MapCard";
import TableCard from "../cards/TableCard";
import { DropdownVarId } from "../utils/madlib/MadLibs";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import Alert from "@material-ui/lab/Alert";
import { Fips } from "../utils/madlib/Fips";
import {
  METRIC_CONFIG,
  VariableConfig,
  MetricConfig,
} from "../data/MetricConfig";
import PopulationCard from "../cards/PopulationCard";
import styles from "./Report.module.scss";
import { POPULATION_VARIABLE_CONFIG } from "../data/MetricConfig";

const SUPPORTED_BREAKDOWNS: BreakdownVar[] = [
  "race_and_ethnicity",
  "age",
  "sex",
];

function VariableDisparityReport(props: {
  key: string;
  dropdownVarId: DropdownVarId;
  fips: Fips;
  updateFipsCallback: Function;
  vertical?: boolean;
  hidePopulationCard?: boolean;
}) {
  const [currentBreakdown, setCurrentBreakdown] = useState<
    BreakdownVar | "all"
  >("all");

  // TODO Remove hard coded fail safe value
  const [variableConfig, setVariableConfig] = useState<VariableConfig | null>(
    Object.keys(METRIC_CONFIG).includes(props.dropdownVarId)
      ? METRIC_CONFIG[props.dropdownVarId as string][0]
      : null
  );

  const fields: MetricConfig[] = [];
  if (variableConfig && variableConfig.metrics["per100k"]) {
    fields.push(variableConfig.metrics["per100k"]);
  }
  if (variableConfig && variableConfig.metrics["pct_share"]) {
    fields.push(variableConfig.metrics["pct_share"]);
  }
  const tableFields: MetricConfig[] = variableConfig
    ? [
        ...fields,
        POPULATION_VARIABLE_CONFIG.metrics.count,
        POPULATION_VARIABLE_CONFIG.metrics.pct_share,
      ]
    : [];

  return (
    <>
      {!variableConfig && (
        <Grid container xs={12} spacing={1} justify="center">
          <Grid item xs={5}>
            <Alert severity="error">Data not currently available</Alert>
          </Grid>
        </Grid>
      )}

      {variableConfig && (
        <Grid container spacing={1} justify="center">
          {!props.hidePopulationCard && (
            <Grid item xs={12}>
              <PopulationCard fips={props.fips} />
            </Grid>
          )}
          <Grid container xs={12}>
            {!!METRIC_CONFIG[props.dropdownVarId as string] &&
              METRIC_CONFIG[props.dropdownVarId as string].length > 1 && (
                <Grid item className={styles.ToggleBlock}>
                  <span className={styles.ToggleLabel}>Filter Data</span>
                  <ToggleButtonGroup
                    exclusive
                    value={variableConfig.variableId}
                    onChange={(e, variableId) => {
                      if (
                        variableId !== null &&
                        METRIC_CONFIG[props.dropdownVarId]
                      ) {
                        setVariableConfig(
                          METRIC_CONFIG[props.dropdownVarId].find(
                            (variableConfig) =>
                              variableConfig.variableId === variableId
                          ) as VariableConfig
                        );
                      }
                    }}
                    aria-label="text formatting"
                  >
                    {METRIC_CONFIG[props.dropdownVarId as string].map(
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
              <span className={styles.ToggleLabel}>Filter Demographic</span>
              <ToggleButtonGroup
                exclusive
                value={currentBreakdown}
                onChange={(e, v) => {
                  if (v !== null) {
                    setCurrentBreakdown(v);
                  }
                }}
                aria-label="text formatting"
              >
                <ToggleButton value="all" key="all">
                  All
                </ToggleButton>
                {SUPPORTED_BREAKDOWNS.map((breakdownVar) => (
                  <ToggleButton value={breakdownVar} key={breakdownVar}>
                    {BREAKDOWN_VAR_DISPLAY_NAMES[breakdownVar]}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Grid>
          </Grid>
          <Grid item xs={props.vertical ? 12 : 6}>
            <MapCard
              key={
                currentBreakdown + variableConfig.metrics["per100k"].metricId
              }
              metricConfig={variableConfig.metrics["per100k"] as MetricConfig}
              fips={props.fips}
              updateFipsCallback={(fips: Fips) => {
                props.updateFipsCallback(fips);
              }}
              enableFilter={props.fips.isUsa()}
              nonstandardizedRace={
                props.dropdownVarId === "covid" ? true : false
              }
              currentBreakdown={currentBreakdown}
            />
            <TableCard
              fips={props.fips}
              metrics={tableFields}
              breakdownVar={"race_and_ethnicity" as BreakdownVar}
              nonstandardizedRace={
                props.dropdownVarId === "covid" ? true : false
              }
            />
          </Grid>
          <Grid item xs={props.vertical ? 12 : 6}>
            {SUPPORTED_BREAKDOWNS.map((breakdownVar) => (
              <>
                {(currentBreakdown === "all" ||
                  currentBreakdown === breakdownVar) && (
                  <DisparityBarChartCard
                    key={variableConfig.variableId + breakdownVar}
                    variableConfig={variableConfig}
                    nonstandardizedRace={
                      props.dropdownVarId === "covid" ? true : false
                    }
                    breakdownVar={breakdownVar as BreakdownVar}
                    fips={props.fips}
                  />
                )}
              </>
            ))}
          </Grid>
        </Grid>
      )}
    </>
  );
}

export default VariableDisparityReport;
