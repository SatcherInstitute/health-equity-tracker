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
  MetricConfig,
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
  updateFips1Callback: (fips: Fips) => void;
  updateFips2Callback: (fips: Fips) => void;
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
        <>
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
        </>
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

      <RowOfTwoOptionalMetrics
        metric1={variableConfig1.metrics["per100k"]}
        metric2={variableConfig2.metrics["per100k"]}
        fips1={props.fips1}
        fips2={props.fips2}
        updateFips1={props.updateFips1Callback}
        updateFips2={props.updateFips2Callback}
        createCard={(
          metricConfig: MetricConfig,
          fips: Fips,
          updateFips: (fips: Fips) => void
        ) => (
          <MapCard
            metricConfig={metricConfig}
            fips={fips}
            updateFipsCallback={(fips: Fips) => {
              updateFips(fips);
            }}
            currentBreakdown={currentBreakdown}
          />
        )}
      />

      <RowOfTwoOptionalMetrics
        metric1={variableConfig1.metrics["pct_share"]}
        metric2={variableConfig2.metrics["pct_share"]}
        fips1={props.fips1}
        fips2={props.fips2}
        updateFips1={props.updateFips1Callback}
        updateFips2={props.updateFips2Callback}
        createCard={(
          metricConfig: MetricConfig,
          fips: Fips,
          updateFips: (fips: Fips) => void
        ) => (
          <UnknownsMapCard
            metricConfig={metricConfig}
            fips={fips}
            updateFipsCallback={(fips: Fips) => {
              updateFips(fips);
            }}
            currentBreakdown={currentBreakdown}
          />
        )}
      />

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
            <RowOfTwoOptionalMetrics
              metric1={variableConfig1.metrics["pct_share"]}
              metric2={variableConfig2.metrics["pct_share"]}
              fips1={props.fips1}
              fips2={props.fips2}
              createCard={(
                metricConfig: MetricConfig,
                fips: Fips,
                unusedUpdateFips: (fips: Fips) => void
              ) => (
                <DisparityBarChartCard
                  metricConfig={metricConfig}
                  breakdownVar={breakdownVar}
                  fips={fips}
                />
              )}
            />
            <RowOfTwoOptionalMetrics
              metric1={variableConfig1.metrics["per100k"]}
              metric2={variableConfig2.metrics["per100k"]}
              fips1={props.fips1}
              fips2={props.fips2}
              createCard={(
                metricConfig: MetricConfig,
                fips: Fips,
                unusedUpdateFips: (fips: Fips) => void
              ) => (
                <SimpleBarChartCard
                  metricConfig={metricConfig}
                  breakdownVar={breakdownVar}
                  fips={fips}
                />
              )}
            />
          </>
        )
      )}
    </Grid>
  );
}

function RowOfTwoOptionalMetrics(props: {
  metric1: MetricConfig | undefined;
  metric2: MetricConfig | undefined;
  fips1: Fips;
  fips2: Fips;
  updateFips1?: (fips: Fips) => void;
  updateFips2?: (fips: Fips) => void;
  createCard: (
    metricConfig: MetricConfig,
    fips: Fips,
    updateFips: (fips: Fips) => void
  ) => JSX.Element;
}) {
  if (!props.metric1 && !props.metric2) {
    return <></>;
  }

  // Needed for type safety, used when the card does not need to use the fips update callback
  const unusedFipsCallback = () => {};

  return (
    <>
      <Grid item xs={12} sm={6}>
        {props.metric1 && (
          <>
            {props.createCard(
              props.metric1,
              props.fips1,
              props.updateFips1 || unusedFipsCallback
            )}
          </>
        )}
      </Grid>
      <Grid item xs={12} sm={6}>
        {props.metric2 && (
          <>
            {props.createCard(
              props.metric2,
              props.fips2,
              props.updateFips2 || unusedFipsCallback
            )}
          </>
        )}
      </Grid>
    </>
  );
}

export default TwoVariableReport;
