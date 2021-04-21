import React, { useState } from "react";
import { Grid } from "@material-ui/core";
import { BreakdownVar, DEMOGRAPHIC_BREAKDOWNS } from "../data/query/Breakdowns";
import { MapCard } from "../cards/MapCard";
import { UnknownsMapCard } from "../cards/UnknownsMapCard";
import { PopulationCard } from "../cards/PopulationCard";
import { TableCard } from "../cards/TableCard";
import { DisparityBarChartCard } from "../cards/DisparityBarChartCard";
import { SimpleBarChartCard } from "../cards/SimpleBarChartCard";
import { DropdownVarId } from "../utils/MadLibs";
import { Fips } from "../data/utils/Fips";
import {
  METRIC_CONFIG,
  VariableConfig,
  getPer100kAndPctShareMetrics,
} from "../data/config/MetricConfig";
import ReportToggleControls from "./ui/ReportToggleControls";
import NoDataAlert from "./ui/NoDataAlert";

/* Takes dropdownVar and fips inputs for each side-by-side column.
Input values for each column can be the same. */
function TwoVariableReport(props: {
  key: string;
  dropdownVarId1: DropdownVarId;
  dropdownVarId2: DropdownVarId;
  fips1: Fips;
  fips2: Fips;
  updateFips1Callback: Function;
  updateFips2Callback: Function;
}) {
  const [currentBreakdown, setCurrentBreakdown] = useState<BreakdownVar>(
    "race_and_ethnicity"
  );

  const [variableConfig1, setVariableConfig1] = useState<VariableConfig | null>(
    Object.keys(METRIC_CONFIG).includes(props.dropdownVarId1)
      ? METRIC_CONFIG[props.dropdownVarId1][0]
      : null
  );
  const [variableConfig2, setVariableConfig2] = useState<VariableConfig | null>(
    Object.keys(METRIC_CONFIG).includes(props.dropdownVarId2)
      ? METRIC_CONFIG[props.dropdownVarId2][0]
      : null
  );

  if (variableConfig1 === null) {
    return (
      <Grid container spacing={1} alignItems="center" justify="center">
        <NoDataAlert dropdownVarId={props.dropdownVarId1} />
      </Grid>
    );
  }
  if (variableConfig2 === null) {
    return (
      <Grid container spacing={1} alignItems="center" justify="center">
        <NoDataAlert dropdownVarId={props.dropdownVarId2} />
      </Grid>
    );
  }

  const breakdownIsShown = (breakdownVar: string) =>
    currentBreakdown === breakdownVar;

  return (
    <Grid container spacing={1} alignItems="flex-start">
      {props.fips1.code === props.fips2.code ? (
        <Grid item xs={12}>
          <PopulationCard fips={props.fips1} />
          <ReportToggleControls
            dropdownVarId={props.dropdownVarId1}
            variableConfig={variableConfig1}
            setVariableConfig={setVariableConfig1}
            currentBreakdown={currentBreakdown}
            setCurrentBreakdown={setCurrentBreakdown}
          />
        </Grid>
      ) : (
        <>
          <Grid item xs={12} sm={6}>
            <PopulationCard fips={props.fips1} />
            <ReportToggleControls
              dropdownVarId={props.dropdownVarId1}
              variableConfig={variableConfig1}
              setVariableConfig={setVariableConfig1}
              currentBreakdown={currentBreakdown}
              setCurrentBreakdown={setCurrentBreakdown}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <PopulationCard fips={props.fips2} />
            <ReportToggleControls
              dropdownVarId={props.dropdownVarId2}
              variableConfig={variableConfig2}
              setVariableConfig={setVariableConfig2}
              currentBreakdown={currentBreakdown}
              setCurrentBreakdown={setCurrentBreakdown}
            />
          </Grid>
        </>
      )}
      {variableConfig1.metrics["pct_share"] && (
        <Grid item xs={12} sm={6}>
          <UnknownsMapCard
            metricConfig={variableConfig1.metrics["pct_share"]}
            fips={props.fips1}
            updateFipsCallback={(fips: Fips) => {
              props.updateFips1Callback(fips);
            }}
            currentBreakdown={currentBreakdown}
          />
        </Grid>
      )}
      {variableConfig2.metrics["pct_share"] && (
        <Grid item xs={12} sm={6}>
          <UnknownsMapCard
            metricConfig={variableConfig2.metrics["pct_share"]}
            fips={props.fips2}
            updateFipsCallback={(fips: Fips) => {
              props.updateFips2Callback(fips);
            }}
            currentBreakdown={currentBreakdown}
          />
        </Grid>
      )}
      <Grid item xs={12} sm={6}>
        <MapCard
          metricConfig={variableConfig1.metrics["per100k"]}
          fips={props.fips1}
          updateFipsCallback={(fips: Fips) => {
            props.updateFips1Callback(fips);
          }}
          currentBreakdown={currentBreakdown}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <MapCard
          metricConfig={variableConfig2.metrics["per100k"]}
          fips={props.fips2}
          updateFipsCallback={(fips: Fips) => {
            props.updateFips2Callback(fips);
          }}
          currentBreakdown={currentBreakdown}
        />
      </Grid>

      {DEMOGRAPHIC_BREAKDOWNS.map((breakdownVar) =>
        !breakdownIsShown(breakdownVar) ? null : (
          <>
            <Grid item xs={12} sm={6}>
              <TableCard
                fips={props.fips1}
                variableConfig={variableConfig1}
                metrics={getPer100kAndPctShareMetrics(variableConfig1)}
                breakdownVar={breakdownVar}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TableCard
                fips={props.fips2}
                variableConfig={variableConfig2}
                metrics={getPer100kAndPctShareMetrics(variableConfig2)}
                breakdownVar={breakdownVar}
              />
            </Grid>
          </>
        )
      )}
      {DEMOGRAPHIC_BREAKDOWNS.map((breakdownVar) =>
        !breakdownIsShown(breakdownVar) ? null : (
          <>
            {variableConfig1.metrics["pct_share"] && (
              <Grid item xs={12} sm={6}>
                <DisparityBarChartCard
                  metricConfig={variableConfig1.metrics["pct_share"]}
                  breakdownVar={breakdownVar}
                  fips={props.fips1}
                />
              </Grid>
            )}
            {variableConfig2.metrics["pct_share"] && (
              <Grid item xs={12} sm={6}>
                <DisparityBarChartCard
                  metricConfig={variableConfig2.metrics["pct_share"]}
                  breakdownVar={breakdownVar}
                  fips={props.fips2}
                />
              </Grid>
            )}
            {variableConfig1.metrics["per100k"] && (
              <Grid item xs={12} sm={6}>
                <SimpleBarChartCard
                  metricConfig={variableConfig1.metrics["per100k"]}
                  breakdownVar={breakdownVar}
                  fips={props.fips1}
                />
              </Grid>
            )}
            {variableConfig1.metrics["per100k"] && (
              <Grid item xs={12} sm={6}>
                <SimpleBarChartCard
                  metricConfig={variableConfig2.metrics["per100k"]}
                  breakdownVar={breakdownVar}
                  fips={props.fips2}
                />
              </Grid>
            )}
          </>
        )
      )}
    </Grid>
  );
}

export default TwoVariableReport;
