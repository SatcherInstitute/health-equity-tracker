import React, { useState } from "react";
import { Button, Grid } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import {
  BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES,
} from "../data/query/Breakdowns";
import { MapCard } from "../cards/MapCard";
import { PopulationCard } from "../cards/PopulationCard";
import { TableCard } from "../cards/TableCard";
import { DisparityBarChartCard } from "../cards/DisparityBarChartCard";
import { SimpleBarChartCard } from "../cards/SimpleBarChartCard";
import { DropdownVarId } from "../utils/MadLibs";
import { Fips } from "../data/utils/Fips";
import {
  METRIC_CONFIG,
  VariableConfig,
  MetricConfig,
} from "../data/config/MetricConfig";
import styles from "./Report.module.scss";

const SUPPORTED_BREAKDOWNS: BreakdownVar[] = [
  "race_and_ethnicity",
  "age",
  "sex",
];

export interface VariableDisparityReportProps {
  key: string;
  dropdownVarId: DropdownVarId;
  fips: Fips;
  updateFipsCallback: Function;
  vertical?: boolean;
  hidePopulationCard?: boolean;
}

export function VariableDisparityReport(props: VariableDisparityReportProps) {
  const [currentBreakdown, setCurrentBreakdown] = useState<
    BreakdownVar | "all"
  >("all");

  // TODO Remove hard coded fail safe value
  const [variableConfig, setVariableConfig] = useState<VariableConfig | null>(
    Object.keys(METRIC_CONFIG).includes(props.dropdownVarId)
      ? METRIC_CONFIG[props.dropdownVarId][0]
      : null
  );

  let tableFields: MetricConfig[] = [];
  if (variableConfig) {
    if (variableConfig.metrics["per100k"]) {
      tableFields.push(variableConfig.metrics["per100k"]);
    }
    if (variableConfig.metrics["pct_share"]) {
      tableFields.push(variableConfig.metrics["pct_share"]);
      if (variableConfig.metrics["pct_share"].populationComparisonMetric) {
        tableFields.push(
          variableConfig.metrics["pct_share"].populationComparisonMetric
        );
      }
    }
  }

  const breakdownIsShown = (breakdownVar: string) =>
    currentBreakdown === "all" || currentBreakdown === breakdownVar;

  return (
    <Grid container xs={12} spacing={1} justify="center">
      {!props.hidePopulationCard && (
        <Grid item xs={12}>
          <PopulationCard fips={props.fips} />
        </Grid>
      )}

      {!variableConfig && (
        <Grid item xs={5}>
          <Alert style={{ margin: "20px" }} severity="error">
            This data is not currently available in the Health Equity Tracker,
            but will be coming soon.
            <br />
            {/* TODO - buttons should be actual working a href links and better follow UX*/}
            <Button
              style={{
                padding: "0",
                paddingLeft: "5px",
                paddingRight: "5px",
                background: "none",
                textDecoration: "underline",
              }}
              onClick={() => alert("unimplemented")}
            >
              See our roadmap to learn more.
            </Button>
          </Alert>
          <Alert variant="outlined" severity="info">
            Do you have information on {props.dropdownVarId} at the state or
            local level?
            <Button
              style={{
                padding: "0",
                paddingLeft: "5px",
                paddingRight: "5px",
                background: "none",
                textDecoration: "underline",
              }}
              onClick={() => alert("unimplemented")}
            >
              We would love to hear from you.
            </Button>
          </Alert>
        </Grid>
      )}

      {variableConfig && (
        <Grid container spacing={1} justify="center">
          <Grid container xs={12}>
            {!!METRIC_CONFIG[props.dropdownVarId] &&
              METRIC_CONFIG[props.dropdownVarId].length > 1 && (
                <Grid item className={styles.ToggleBlock}>
                  <span className={styles.ToggleLabel}>Choose Data Type</span>
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
              <span className={styles.ToggleLabel}>Choose Demographic</span>
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
              metricConfig={variableConfig.metrics["per100k"]}
              fips={props.fips}
              updateFipsCallback={(fips: Fips) => {
                props.updateFipsCallback(fips);
              }}
              currentBreakdown={currentBreakdown}
            />
            {SUPPORTED_BREAKDOWNS.map((breakdownVar) => (
              <>
                {breakdownIsShown(breakdownVar) && (
                  <TableCard
                    fips={props.fips}
                    metrics={tableFields}
                    breakdownVar={breakdownVar}
                  />
                )}
              </>
            ))}
          </Grid>
          <Grid item xs={props.vertical ? 12 : 6}>
            {SUPPORTED_BREAKDOWNS.map((breakdownVar) => (
              <>
                {breakdownIsShown(breakdownVar) &&
                  variableConfig.metrics["pct_share"] && (
                    <DisparityBarChartCard
                      metricConfig={variableConfig.metrics["pct_share"]}
                      breakdownVar={breakdownVar}
                      fips={props.fips}
                    />
                  )}
                {breakdownIsShown(breakdownVar) &&
                  variableConfig.metrics["per100k"] && (
                    <SimpleBarChartCard
                      metricConfig={variableConfig.metrics["per100k"]}
                      breakdownVar={breakdownVar}
                      fips={props.fips}
                    />
                  )}
              </>
            ))}
          </Grid>
        </Grid>
      )}
    </Grid>
  );
}
