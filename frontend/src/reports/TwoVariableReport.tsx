import { Grid } from "@material-ui/core";
import React, { useEffect, useState, Fragment } from "react";
import LazyLoad from "react-lazyload";
import { AgeAdjustedTableCard } from "../cards/AgeAdjustedTableCard";
import { DisparityBarChartCard } from "../cards/DisparityBarChartCard";
import { MapCard } from "../cards/MapCard";
import { PopulationCard } from "../cards/PopulationCard";
import { SimpleBarChartCard } from "../cards/SimpleBarChartCard";
import { TableCard } from "../cards/TableCard";
import { UnknownsMapCard } from "../cards/UnknownsMapCard";
import {
  DropdownVarId,
  METRIC_CONFIG,
  VariableConfig,
  VariableId,
} from "../data/config/MetricConfig";
import { BreakdownVar, DEMOGRAPHIC_BREAKDOWNS } from "../data/query/Breakdowns";
import { RACE } from "../data/utils/Constants";
import { Fips } from "../data/utils/Fips";
import { TableOfContents } from "../pages/ui/TableOfContents";
import {
  DATA_TYPE_1_PARAM,
  DATA_TYPE_2_PARAM,
  DEMOGRAPHIC_PARAM,
  getParameter,
  psSubscribe,
  setParameter,
  swapOldParams,
} from "../utils/urlutils";
import { reportProviderSteps } from "./ReportProviderSteps";
import NoDataAlert from "./ui/NoDataAlert";
import ReportToggleControls from "./ui/ReportToggleControls";
import styles from "./Report.module.scss";
import { pluralizeStepLabels, StepData } from "../utils/hooks/useStepObserver";

const HEADER_OFFSET_TWO_VAR = 188;

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
  jumpToDefinitions: Function;
  jumpToData: Function;
  isScrolledToTop: boolean;
  reportSteps?: StepData[];
  setReportSteps?: Function;
}) {
  const [currentBreakdown, setCurrentBreakdown] = useState<BreakdownVar>(
    getParameter(DEMOGRAPHIC_PARAM, RACE)
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

  const setVariableConfigWithParam1 = (v: VariableConfig) => {
    setParameter(DATA_TYPE_1_PARAM, v.variableId);
    setVariableConfig1(v);
  };

  const setVariableConfigWithParam2 = (v: VariableConfig) => {
    setParameter(DATA_TYPE_2_PARAM, v.variableId);
    setVariableConfig2(v);
  };

  const setDemoWithParam = (str: BreakdownVar) => {
    setParameter(DEMOGRAPHIC_PARAM, str);
    setCurrentBreakdown(str);
  };

  useEffect(() => {
    const readParams = () => {
      const demoParam1 = getParameter(
        DATA_TYPE_1_PARAM,
        undefined,
        (val: VariableId) => {
          val = swapOldParams(val);
          return METRIC_CONFIG[props.dropdownVarId1].find(
            (cfg) => cfg.variableId === val
          );
        }
      );
      const demoParam2 = getParameter(
        DATA_TYPE_2_PARAM,
        undefined,
        (val: VariableId) => {
          val = swapOldParams(val);
          return METRIC_CONFIG[props.dropdownVarId2].find(
            (cfg) => cfg.variableId === val
          );
        }
      );

      const demo: BreakdownVar = getParameter(DEMOGRAPHIC_PARAM, RACE);
      setVariableConfig1(
        demoParam1 ? demoParam1 : METRIC_CONFIG[props.dropdownVarId1][0]
      );
      setVariableConfig2(
        demoParam2 ? demoParam2 : METRIC_CONFIG[props.dropdownVarId2][0]
      );
      setCurrentBreakdown(demo);
    };
    const psSub = psSubscribe(readParams, "twovar");
    readParams();
    return () => {
      if (psSub) {
        psSub.unsubscribe();
      }
    };
  }, [props.dropdownVarId1, props.dropdownVarId2]);

  // // when variable config changes (new data type), re-calc available card steps in TableOfContents
  useEffect(() => {
    const stepsOnScreen: StepData[] = reportProviderSteps.filter(
      (step) => document.getElementById(step.hashId)?.id !== undefined
    );

    stepsOnScreen && props.setReportSteps?.(stepsOnScreen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variableConfig1, variableConfig2]);

  if (variableConfig1 === null) {
    return (
      <Grid container spacing={1} alignItems="center" justifyContent="center">
        <NoDataAlert dropdownVarId={props.dropdownVarId1} />
      </Grid>
    );
  }
  if (variableConfig2 === null) {
    return (
      <Grid container spacing={1} alignItems="center" justifyContent="center">
        <NoDataAlert dropdownVarId={props.dropdownVarId2} />
      </Grid>
    );
  }

  const breakdownIsShown = (breakdownVar: string) =>
    currentBreakdown === breakdownVar;

  const showAgeAdjustCardRow =
    variableConfig1?.metrics?.age_adjusted_ratio?.ageAdjusted ||
    variableConfig2?.metrics?.age_adjusted_ratio?.ageAdjusted;

  return (
    <Grid container>
      {/* CARDS COLUMN */}
      <Grid item xs={12} sm={11} md={10} xl={11}>
        <Grid container spacing={1} alignItems="flex-start">
          {/* POPULATION CARD(S)  AND 2 SETS OF TOGGLE CONTROLS */}
          {props.fips1.code === props.fips2.code ? (
            <Grid
              item
              xs={12}
              id="location-info"
              className={styles.ScrollPastHeaderCompareMode}
            >
              {/*  SINGLE POPULATION CARD FOR EXPLORE RELATIONSHIPS REPORT */}
              <PopulationCard
                jumpToData={props.jumpToData}
                fips={props.fips1}
              />

              {/* 2 SETS OF DEMOGRAPHIC AND DATA TYPE TOGGLES */}
              <Grid container>
                <Grid item xs={12} sm={6}>
                  <ReportToggleControls
                    dropdownVarId={props.dropdownVarId1}
                    variableConfig={variableConfig1}
                    setVariableConfig={setVariableConfigWithParam1}
                    currentBreakdown={currentBreakdown}
                    setCurrentBreakdown={setDemoWithParam}
                    fips={props.fips1}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <ReportToggleControls
                    dropdownVarId={props.dropdownVarId2}
                    variableConfig={variableConfig2}
                    setVariableConfig={setVariableConfigWithParam2}
                    currentBreakdown={currentBreakdown}
                    setCurrentBreakdown={setDemoWithParam}
                    fips={props.fips2}
                    excludeId={true}
                  />
                </Grid>
              </Grid>
            </Grid>
          ) : (
            <>
              <Grid
                item
                xs={12}
                sm={6}
                id="location-info"
                className={styles.ScrollPastHeaderCompareMode}
              >
                {/* FIRST POPULATION CARD FOR COMPARE RATES REPORT */}
                <PopulationCard
                  jumpToData={props.jumpToData}
                  fips={props.fips1}
                />

                {/*  FIRST TOGGLE(S) FOR COMPARE RATES REPORT */}
                <ReportToggleControls
                  dropdownVarId={props.dropdownVarId1}
                  variableConfig={variableConfig1}
                  setVariableConfig={setVariableConfigWithParam1}
                  currentBreakdown={currentBreakdown}
                  setCurrentBreakdown={setDemoWithParam}
                  fips={props.fips1}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                {/* SECOND POPULATION CARD FOR COMPARE RATES REPORT */}
                <PopulationCard
                  jumpToData={props.jumpToData}
                  fips={props.fips2}
                />

                {/*  SECOND TOGGLE(S) FOR COMPARE RATES REPORT */}
                <ReportToggleControls
                  dropdownVarId={props.dropdownVarId2}
                  variableConfig={variableConfig2}
                  setVariableConfig={setVariableConfigWithParam2}
                  currentBreakdown={currentBreakdown}
                  setCurrentBreakdown={setDemoWithParam}
                  fips={props.fips2}
                  excludeId={true}
                />
              </Grid>
            </>
          )}

          {/* SIDE-BY-SIDE 100K MAP CARDS */}
          <RowOfTwoOptionalMetrics
            id="map"
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
                jumpToDefinitions={props.jumpToDefinitions}
                jumpToData={props.jumpToData}
              />
            )}
          />

          {/* SIDE-BY-SIDE 100K BAR GRAPH CARDS */}
          {DEMOGRAPHIC_BREAKDOWNS.map((breakdownVar) =>
            !breakdownIsShown(breakdownVar) ? null : (
              <Fragment key={breakdownVar}>
                <RowOfTwoOptionalMetrics
                  id="rate-chart"
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
              </Fragment>
            )
          )}

          {/* SIDE-BY-SIDE UNKNOWNS MAP CARDS */}
          <RowOfTwoOptionalMetrics
            id="unknowns-map"
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
                overrideAndWithOr={currentBreakdown === RACE}
                variableConfig={variableConfig}
                fips={fips}
                updateFipsCallback={(fips: Fips) => {
                  updateFips(fips);
                }}
                currentBreakdown={currentBreakdown}
              />
            )}
          />

          {/* SIDE-BY-SIDE DISPARITY BAR GRAPH (COMPARE TO POPULATION) CARDS */}

          {DEMOGRAPHIC_BREAKDOWNS.map((breakdownVar) =>
            !breakdownIsShown(breakdownVar) ? null : (
              <Fragment key={breakdownVar}>
                <RowOfTwoOptionalMetrics
                  id="population-vs-share"
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
              </Fragment>
            )
          )}

          {/* SIDE-BY-SIDE DATA TABLE CARDS */}
          {DEMOGRAPHIC_BREAKDOWNS.map((breakdownVar) =>
            !breakdownIsShown(breakdownVar) ? null : (
              <RowOfTwoOptionalMetrics
                id="data-table"
                key={breakdownVar}
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

          {/* SIDE-BY-SIDE AGE-ADJUSTED TABLE CARDS */}

          {showAgeAdjustCardRow && (
            <RowOfTwoOptionalMetrics
              id="age-adjusted-risk"
              // specific data type
              variableConfig1={variableConfig1}
              variableConfig2={variableConfig2}
              // parent variable
              dropdownVarId1={props.dropdownVarId1}
              dropdownVarId2={props.dropdownVarId2}
              fips1={props.fips1}
              fips2={props.fips2}
              updateFips1={props.updateFips1Callback}
              updateFips2={props.updateFips2Callback}
              jumpToData={props.jumpToData}
              createCard={(
                variableConfig: VariableConfig,
                fips: Fips,
                updateFips: (fips: Fips) => void,
                dropdownVarId?: DropdownVarId,
                jumpToData?: Function
              ) => (
                <AgeAdjustedTableCard
                  fips={fips}
                  variableConfig={variableConfig}
                  breakdownVar={currentBreakdown}
                  dropdownVarId={dropdownVarId}
                  jumpToData={jumpToData}
                />
              )}
            />
          )}
        </Grid>
      </Grid>
      {/* TABLE OF CONTENTS COLUMN */}
      {props.reportSteps && (
        <Grid
          item
          // invisible
          xs={12}
          // icons only
          sm={1}
          // icons + text
          md={2}
          xl={1}
          container
          spacing={0}
          direction="column"
          alignItems="center"
        >
          <TableOfContents
            isScrolledToTop={props.isScrolledToTop}
            reportSteps={pluralizeStepLabels(props.reportSteps)}
            floatTopOffset={HEADER_OFFSET_TWO_VAR}
          />
        </Grid>
      )}
    </Grid>
  );
}

function RowOfTwoOptionalMetrics(props: {
  id: string;
  variableConfig1: VariableConfig | undefined;
  variableConfig2: VariableConfig | undefined;
  fips1: Fips;
  fips2: Fips;
  updateFips1?: (fips: Fips) => void;
  updateFips2?: (fips: Fips) => void;
  createCard: (
    variableConfig: VariableConfig,
    fips: Fips,
    updateFips: (fips: Fips) => void,
    dropdownVarId?: DropdownVarId,
    jumpToData?: Function
  ) => JSX.Element;
  dropdownVarId1?: DropdownVarId;
  dropdownVarId2?: DropdownVarId;
  jumpToData?: Function;
}) {
  if (!props.variableConfig1 && !props.variableConfig2) {
    return <></>;
  }

  // Needed for type safety, used when the card does not need to use the fips update callback
  const unusedFipsCallback = () => {};

  return (
    <>
      <Grid
        item
        xs={12}
        sm={6}
        id={props.id}
        className={styles.ScrollPastHeaderCompareMode}
      >
        <LazyLoad offset={800} height={750} once>
          {props.variableConfig1 && (
            <>
              {props.createCard(
                props.variableConfig1,
                props.fips1,
                props.updateFips1 || unusedFipsCallback,
                props.dropdownVarId1,
                props.jumpToData
              )}
            </>
          )}
        </LazyLoad>
      </Grid>
      <Grid
        item
        xs={12}
        sm={6}
        id={`${props.id}2`}
        className={styles.ScrollPastHeaderCompareMode}
      >
        <LazyLoad offset={800} height={600} once>
          {props.variableConfig2 && (
            <>
              {props.createCard(
                props.variableConfig2,
                props.fips2,
                props.updateFips2 || unusedFipsCallback,
                props.dropdownVarId2,
                props.jumpToData
              )}
            </>
          )}
        </LazyLoad>
      </Grid>
    </>
  );
}

export default TwoVariableReport;
