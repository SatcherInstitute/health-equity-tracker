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
import { METRIC_CONFIG, VariableConfig } from "../data/config/MetricConfig";
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
            <Grid container>
              <Grid item xs={12} sm={6}>
                <ReportToggleControls
                  dropdownVarId={props.dropdownVarId1}
                  variableConfig={variableConfig1}
                  setVariableConfig={setVariableConfig1}
                  currentBreakdown={currentBreakdown}
                  setCurrentBreakdown={setCurrentBreakdown}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <ReportToggleControls
                  dropdownVarId={props.dropdownVarId2}
                  variableConfig={variableConfig2}
                  setVariableConfig={setVariableConfig2}
                  currentBreakdown={currentBreakdown}
                  setCurrentBreakdown={setCurrentBreakdown}
                />
              </Grid>
            </Grid>
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
        variableConfig1={variableConfig1}
        variableConfig2={variableConfig2}
        fips1={props.fips1}
        fips2={props.fips2}
        updateFips1={props.updateFips1Callback}
        updateFips2={props.updateFips2Callback}
        createCard={(
          variableConfig: VariableConfig,
          fips: Fips,
          updateFips: (fips: Fips) => void
        ) => (
          <MapCard
            variableConfig={variableConfig}
            fips={fips}
            updateFipsCallback={(fips: Fips) => {
              updateFips(fips);
            }}
            currentBreakdown={currentBreakdown}
          />
        )}
      />

      <RowOfTwoOptionalMetrics
        variableConfig1={variableConfig1}
        variableConfig2={variableConfig2}
        fips1={props.fips1}
        fips2={props.fips2}
        updateFips1={props.updateFips1Callback}
        updateFips2={props.updateFips2Callback}
        createCard={(
          variableConfig: VariableConfig,
          fips: Fips,
          updateFips: (fips: Fips) => void
        ) => (
          <UnknownsMapCard
            variableConfig={variableConfig}
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
          <RowOfTwoOptionalMetrics
            variableConfig1={variableConfig1}
            variableConfig2={variableConfig2}
            fips1={props.fips1}
            fips2={props.fips2}
            updateFips1={props.updateFips1Callback}
            updateFips2={props.updateFips2Callback}
            createCard={(
              variableConfig: VariableConfig,
              fips: Fips,
              updateFips: (fips: Fips) => void
            ) => (
              <TableCard
                fips={fips}
                variableConfig={variableConfig}
                breakdownVar={breakdownVar}
              />
            )}
          />
        )
      )}
      {DEMOGRAPHIC_BREAKDOWNS.map((breakdownVar) =>
        !breakdownIsShown(breakdownVar) ? null : (
          <>
            <RowOfTwoOptionalMetrics
              variableConfig1={variableConfig1}
              variableConfig2={variableConfig2}
              fips1={props.fips1}
              fips2={props.fips2}
              createCard={(
                variableConfig: VariableConfig,
                fips: Fips,
                unusedUpdateFips: (fips: Fips) => void
              ) => (
                <DisparityBarChartCard
                  variableConfig={variableConfig}
                  breakdownVar={breakdownVar}
                  fips={fips}
                />
              )}
            />
            <RowOfTwoOptionalMetrics
              variableConfig1={variableConfig1}
              variableConfig2={variableConfig2}
              fips1={props.fips1}
              fips2={props.fips2}
              createCard={(
                variableConfig: VariableConfig,
                fips: Fips,
                unusedUpdateFips: (fips: Fips) => void
              ) => (
                <SimpleBarChartCard
                  variableConfig={variableConfig}
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
  variableConfig1: VariableConfig | undefined;
  variableConfig2: VariableConfig | undefined;
  fips1: Fips;
  fips2: Fips;
  updateFips1?: (fips: Fips) => void;
  updateFips2?: (fips: Fips) => void;
  createCard: (
    variableConfig: VariableConfig,
    fips: Fips,
    updateFips: (fips: Fips) => void
  ) => JSX.Element;
}) {
  if (!props.variableConfig1 && !props.variableConfig2) {
    return <></>;
  }

  // Needed for type safety, used when the card does not need to use the fips update callback
  const unusedFipsCallback = () => {};

  return (
    <>
      <Grid item xs={12} sm={6}>
        {props.variableConfig1 && (
          <>
            {props.createCard(
              props.variableConfig1,
              props.fips1,
              props.updateFips1 || unusedFipsCallback
            )}
          </>
        )}
      </Grid>
      <Grid item xs={12} sm={6}>
        {props.variableConfig2 && (
          <>
            {props.createCard(
              props.variableConfig2,
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
