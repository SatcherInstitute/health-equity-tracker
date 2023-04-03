import { Grid } from "@material-ui/core";
import React, { useEffect, useState, Fragment } from "react";
import LazyLoad from "react-lazyload";
import { AgeAdjustedTableCard } from "../cards/AgeAdjustedTableCard";
import { DisparityBarChartCard } from "../cards/DisparityBarChartCard";
import { MapCard } from "../cards/MapCard";
import { PopulationCard } from "../cards/PopulationCard";
import { RateTrendsChartCard } from "../cards/RateTrendsChartCard";
import { ShareTrendsChartCard } from "../cards/ShareTrendsChartCard";
import { SimpleBarChartCard } from "../cards/SimpleBarChartCard";
import { TableCard } from "../cards/TableCard";
import { UnknownsMapCard } from "../cards/UnknownsMapCard";
import {
  type DropdownVarId,
  METRIC_CONFIG,
  type VariableConfig,
  type VariableId,
} from "../data/config/MetricConfig";
import {
  type BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE,
  DEMOGRAPHIC_BREAKDOWNS,
} from "../data/query/Breakdowns";
import { RACE } from "../data/utils/Constants";
import { type Fips } from "../data/utils/Fips";
import { TableOfContents } from "../pages/ui/TableOfContents";
import {
  DATA_TYPE_1_PARAM,
  DATA_TYPE_2_PARAM,
  DEMOGRAPHIC_PARAM,
  getParameter,
  psSubscribe,
  setParameter,
  swapOldDatatypeParams,
} from "../utils/urlutils";
import { reportProviderSteps } from "./ReportProviderSteps";
import NoDataAlert from "./ui/NoDataAlert";
import ReportToggleControls from "./ui/ReportToggleControls";
import { type ScrollableHashId } from "../utils/hooks/useStepObserver";
import styles from "./Report.module.scss";
import { Helmet } from "react-helmet-async";

const NON_LAZYLOADED_CARDS: ScrollableHashId[] = [
  "rate-map",
  "rates-over-time",
];

/* Takes dropdownVar and fips inputs for each side-by-side column.
Input values for each column can be the same. */
function TwoVariableReport(props: {
  key: string
  dropdownVarId1: DropdownVarId
  dropdownVarId2: DropdownVarId
  fips1: Fips
  fips2: Fips
  updateFips1Callback: (fips: Fips) => void
  updateFips2Callback: (fips: Fips) => void
  isScrolledToTop: boolean
  reportStepHashIds?: ScrollableHashId[]
  setReportStepHashIds?: (reportStepHashIds: ScrollableHashId[]) => void
  headerScrollMargin: number
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
          val = swapOldDatatypeParams(val);
          return METRIC_CONFIG[props.dropdownVarId1].find(
            (cfg) => cfg.variableId === val
          );
        }
      );
      const demoParam2 = getParameter(
        DATA_TYPE_2_PARAM,
        undefined,
        (val: VariableId) => {
          val = swapOldDatatypeParams(val);
          return METRIC_CONFIG[props.dropdownVarId2].find(
            (cfg) => cfg.variableId === val
          );
        }
      );

      const demo: BreakdownVar = getParameter(DEMOGRAPHIC_PARAM, RACE);
      setVariableConfig1(
        demoParam1 ?? METRIC_CONFIG?.[props.dropdownVarId1]?.[0]
      );
      setVariableConfig2(
        demoParam2 ?? METRIC_CONFIG?.[props.dropdownVarId2]?.[0]
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
    const hashIdsOnScreen: any[] = Object.keys(reportProviderSteps).filter(
      (key) => document.getElementById(key)?.id !== undefined
    );

    hashIdsOnScreen && props.setReportStepHashIds?.(hashIdsOnScreen);
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

  const showTrendCardRow =
    variableConfig1?.timeSeriesData ?? variableConfig2?.timeSeriesData;
  const showAgeAdjustCardRow =
    variableConfig1?.metrics?.age_adjusted_ratio?.ageAdjusted ??
    variableConfig2?.metrics?.age_adjusted_ratio?.ageAdjusted;

  const dt1 = variableConfig1.variableFullDisplayName;
  const dt2 = variableConfig2.variableFullDisplayName;
  const demo = BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[currentBreakdown];
  const loc1 = props.fips1.getSentenceDisplayName();
  const loc2 = props.fips2.getSentenceDisplayName();

  let browserTitle = dt1;
  if (dt1 !== dt2) browserTitle += ` and ${dt2}`;
  browserTitle += ` by ${demo} in ${loc1}`;
  if (loc1 !== loc2) browserTitle += ` and ${loc2}`;

  return (
    <>
      <Helmet>
        <title>{browserTitle} - Health Equity Tracker</title>
      </Helmet>
      <Grid container>
        {/* CARDS COLUMN */}
        <Grid item xs={12} sm={11} md={10}>
          <Grid container spacing={1} alignItems="flex-start">
            {/* POPULATION CARD(S)  AND 2 SETS OF TOGGLE CONTROLS */}
            {props.fips1.code === props.fips2.code ? (
              <Grid
                item
                xs={12}
                tabIndex={-1}
                id="location-info"
                style={{ scrollMarginTop: props.headerScrollMargin }}
              >
                {/*  SINGLE POPULATION CARD FOR EXPLORE RELATIONSHIPS REPORT */}
                <PopulationCard fips={props.fips1} />

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
                  tabIndex={-1}
                  id="location-info"
                  style={{ scrollMarginTop: props.headerScrollMargin }}
                >
                  {/* FIRST POPULATION CARD FOR COMPARE RATES REPORT */}
                  <PopulationCard fips={props.fips1} />

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
                  <PopulationCard fips={props.fips2} />

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
              id="rate-map"
              variableConfig1={variableConfig1}
              variableConfig2={variableConfig2}
              fips1={props.fips1}
              fips2={props.fips2}
              updateFips1={props.updateFips1Callback}
              updateFips2={props.updateFips2Callback}
              headerScrollMargin={props.headerScrollMargin}
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

            {/* SIDE-BY-SIDE RATE TREND CARDS */}
            {showTrendCardRow &&
              DEMOGRAPHIC_BREAKDOWNS.map((breakdownVar) =>
                !breakdownIsShown(breakdownVar) ? null : (
                  <Fragment key={breakdownVar}>
                    <RowOfTwoOptionalMetrics
                      id="rates-over-time"
                      variableConfig1={variableConfig1}
                      variableConfig2={variableConfig2}
                      fips1={props.fips1}
                      fips2={props.fips2}
                      headerScrollMargin={props.headerScrollMargin}
                      createCard={(
                        variableConfig: VariableConfig,
                        fips: Fips,
                        unusedUpdateFips: (fips: Fips) => void,
                        unusedDropdown: any,
                        isCompareCard: boolean | undefined
                      ) => (
                        <RateTrendsChartCard
                          variableConfig={variableConfig}
                          breakdownVar={breakdownVar}
                          fips={fips}
                          isCompareCard={isCompareCard}
                        />
                      )}
                    />
                  </Fragment>
                )
              )}

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
                    headerScrollMargin={props.headerScrollMargin}
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
              id="unknown-demographic-map"
              variableConfig1={variableConfig1}
              variableConfig2={variableConfig2}
              fips1={props.fips1}
              fips2={props.fips2}
              headerScrollMargin={props.headerScrollMargin}
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

            {/* SIDE-BY-SIDE SHARE INEQUITY TREND CARDS */}

            {showTrendCardRow &&
              DEMOGRAPHIC_BREAKDOWNS.map((breakdownVar) =>
                !breakdownIsShown(breakdownVar) ? null : (
                  <Fragment key={breakdownVar}>
                    <RowOfTwoOptionalMetrics
                      id="inequities-over-time"
                      variableConfig1={variableConfig1}
                      variableConfig2={variableConfig2}
                      fips1={props.fips1}
                      fips2={props.fips2}
                      headerScrollMargin={props.headerScrollMargin}
                      createCard={(
                        variableConfig: VariableConfig,
                        fips: Fips,
                        unusedUpdateFips: (fips: Fips) => void,
                        unusedDropdown: any,
                        isCompareCard: boolean | undefined
                      ) => (
                        <ShareTrendsChartCard
                          variableConfig={variableConfig}
                          breakdownVar={breakdownVar}
                          fips={fips}
                          isCompareCard={isCompareCard}
                        />
                      )}
                    />
                  </Fragment>
                )
              )}

            {/* SIDE-BY-SIDE DISPARITY BAR GRAPH (COMPARE TO POPULATION) CARDS */}

            {DEMOGRAPHIC_BREAKDOWNS.map((breakdownVar) =>
              !breakdownIsShown(breakdownVar) ? null : (
                <Fragment key={breakdownVar}>
                  <RowOfTwoOptionalMetrics
                    id="population-vs-distribution"
                    variableConfig1={variableConfig1}
                    variableConfig2={variableConfig2}
                    fips1={props.fips1}
                    fips2={props.fips2}
                    headerScrollMargin={props.headerScrollMargin}
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
                  headerScrollMargin={props.headerScrollMargin}
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
                headerScrollMargin={props.headerScrollMargin}
                createCard={(
                  variableConfig: VariableConfig,
                  fips: Fips,
                  updateFips: (fips: Fips) => void,
                  dropdownVarId?: DropdownVarId,
                  isCompareCard?: boolean
                ) => (
                  <AgeAdjustedTableCard
                    fips={fips}
                    variableConfig={variableConfig}
                    breakdownVar={currentBreakdown}
                    dropdownVarId={dropdownVarId}
                  />
                )}
              />
            )}
          </Grid>
        </Grid>
        {/* TABLE OF CONTENTS COLUMN */}
        {props.reportStepHashIds && (
          <Grid
            item
            // invisible
            xs={12}
            // icons only
            sm={1}
            // icons + text
            md={2}
            container
            spacing={0}
            direction="column"
            alignItems="center"
            className={styles.FloatingTableOfContentsWrapper}
          >
            <TableOfContents
              isScrolledToTop={props.isScrolledToTop}
              reportStepHashIds={props.reportStepHashIds}
              floatTopOffset={props.headerScrollMargin}
            />
          </Grid>
        )}
      </Grid>
    </>
  );
}

function RowOfTwoOptionalMetrics(props: {
  id: ScrollableHashId
  variableConfig1: VariableConfig | undefined
  variableConfig2: VariableConfig | undefined
  fips1: Fips
  fips2: Fips
  updateFips1?: (fips: Fips) => void
  updateFips2?: (fips: Fips) => void
  createCard: (
    variableConfig: VariableConfig,
    fips: Fips,
    updateFips: (fips: Fips) => void,
    dropdownVarId?: DropdownVarId,
    isCompareCard?: boolean
  ) => JSX.Element
  dropdownVarId1?: DropdownVarId
  dropdownVarId2?: DropdownVarId
  headerScrollMargin: number
}) {
  if (!props.variableConfig1 && !props.variableConfig2) {
    return <></>;
  }

  // Needed for type safety, used when the card does not need to use the fips update callback
  const unusedFipsCallback = () => {};

  const dontLazyLoadCard = NON_LAZYLOADED_CARDS.includes(props.id);
  return (
    <>
      <Grid
        item
        xs={12}
        sm={6}
        id={props.id}
        tabIndex={-1}
        style={{ scrollMarginTop: props.headerScrollMargin }}
      >
        {/* render with or without LazyLoad wrapped based on card id */}
        {props.variableConfig1 && dontLazyLoadCard && (
          <>
            {props.createCard(
              props.variableConfig1,
              props.fips1,
              props.updateFips1 ?? unusedFipsCallback,
              props.dropdownVarId1,
              /* isCompareCard */ false
            )}
          </>
        )}

        <LazyLoad offset={800} height={750}>
          {props.variableConfig1 && !dontLazyLoadCard && (
            <>
              {props.createCard(
                props.variableConfig1,
                props.fips1,
                props.updateFips1 ?? unusedFipsCallback,
                props.dropdownVarId1,
                /* isCompareCard */ false
              )}
            </>
          )}
        </LazyLoad>
      </Grid>
      <Grid
        item
        xs={12}
        sm={6}
        tabIndex={-1}
        id={`${props.id}2`}
        style={{ scrollMarginTop: props.headerScrollMargin }}
      >
        {props.variableConfig2 && dontLazyLoadCard && (
          <>
            {props.createCard(
              props.variableConfig2,
              props.fips2,
              props.updateFips2 ?? unusedFipsCallback,
              props.dropdownVarId2,
              /* isCompareCard */ true
            )}
          </>
        )}

        <LazyLoad offset={800} height={600} once>
          {props.variableConfig2 && !dontLazyLoadCard && (
            <>
              {props.createCard(
                props.variableConfig2,
                props.fips2,
                props.updateFips2 ?? unusedFipsCallback,
                props.dropdownVarId2,
                /* isCompareCard */ true
              )}
            </>
          )}
        </LazyLoad>
      </Grid>
    </>
  );
}

export default TwoVariableReport;
