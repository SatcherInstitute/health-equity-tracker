import { Grid } from "@material-ui/core";
import React, { useEffect, useState, Fragment } from "react";
import LazyLoad from "react-lazyload";
import { DisparityBarChartCard } from "../cards/DisparityBarChartCard";
import { MapCard } from "../cards/MapCard";
import { PopulationCard } from "../cards/PopulationCard";
import { SimpleBarChartCard } from "../cards/SimpleBarChartCard";
import { AgeAdjustedTableCard } from "../cards/AgeAdjustedTableCard";
import { UnknownsMapCard } from "../cards/UnknownsMapCard";
import { TableCard } from "../cards/TableCard";
import {
  DropdownVarId,
  METRIC_CONFIG,
  VariableConfig,
} from "../data/config/MetricConfig";
import { BreakdownVar, DEMOGRAPHIC_BREAKDOWNS } from "../data/query/Breakdowns";
import { RACE } from "../data/utils/Constants";
import { Fips } from "../data/utils/Fips";
import {
  DATA_TYPE_1_PARAM,
  DATA_TYPE_2_PARAM,
  DEMOGRAPHIC_PARAM,
  getParameter,
  psSubscribe,
  setParameter,
  setParameters,
  swapOldParams,
} from "../utils/urlutils";
import { SINGLE_COLUMN_WIDTH } from "./ReportProvider";
import NoDataAlert from "./ui/NoDataAlert";
import ReportToggleControls from "./ui/ReportToggleControls";
import { RateTrendsChartCard } from "../cards/RateTrendsChartCard";
import { ShareTrendsChartCard } from "../cards/ShareTrendsChartCard";
import styles from "./Report.module.scss";
import { TableOfContents } from "../pages/ui/TableOfContents";
import { reportProviderSteps } from "./ReportProviderSteps";
import { StepData } from "../utils/hooks/useStepObserver";

const HEADER_OFFSET_ONE_VAR = 88;

export interface OneVariableReportProps {
  key: string;
  dropdownVarId: DropdownVarId;
  fips: Fips;
  updateFipsCallback: Function;
  hidePopulationCard?: boolean;
  jumpToDefinitions: Function;
  jumpToData: Function;
  isScrolledToTop: boolean;
  reportSteps?: StepData[];
  setReportSteps?: Function;
}

export function OneVariableReport(props: OneVariableReportProps) {
  const [currentBreakdown, setCurrentBreakdown] = useState<BreakdownVar>(
    getParameter(DEMOGRAPHIC_PARAM, RACE)
  );

  const [variableConfig, setVariableConfig] = useState<VariableConfig | null>(
    Object.keys(METRIC_CONFIG).includes(props.dropdownVarId)
      ? METRIC_CONFIG[props.dropdownVarId][0]
      : null
  );

  const setVariableConfigWithParam = (v: VariableConfig) => {
    setParameters([
      { name: DATA_TYPE_1_PARAM, value: v.variableId },
      { name: DATA_TYPE_2_PARAM, value: null },
    ]);
    setVariableConfig(v);
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
        (val: string) => {
          val = swapOldParams(val);
          return METRIC_CONFIG[props.dropdownVarId].find(
            (cfg) => cfg.variableId === val
          );
        }
      );
      setVariableConfig(
        demoParam1 ? demoParam1 : METRIC_CONFIG[props.dropdownVarId][0]
      );

      const demo: BreakdownVar = getParameter(DEMOGRAPHIC_PARAM, RACE);
      setCurrentBreakdown(demo);
    };
    const psHandler = psSubscribe(readParams, "vardisp");
    readParams();
    return () => {
      if (psHandler) {
        psHandler.unsubscribe();
      }
    };
  }, [props.dropdownVarId]);

  // // when variable config changes (new data type), re-calc available card steps in TableOfContents
  useEffect(() => {
    const stepsOnScreen: StepData[] = reportProviderSteps.filter(
      (step) => document.getElementById(step.hashId)?.id !== undefined
    );

    stepsOnScreen && props.setReportSteps?.(stepsOnScreen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variableConfig]);

  const breakdownIsShown = (breakdownVar: BreakdownVar) =>
    currentBreakdown === breakdownVar;

  return (
    <Grid container>
      {/* CARDS COLUMN */}
      <Grid item xs={12} sm={11} md={10} xl={11}>
        <Grid
          item
          container
          xs={12}
          alignItems="center"
          spacing={0}
          justifyContent="center"
        >
          {!props.hidePopulationCard && (
            // POPULATION CARD
            <Grid
              item
              xs={12}
              md={SINGLE_COLUMN_WIDTH}
              id="location-info"
              className={styles.ScrollPastHeader}
            >
              <PopulationCard jumpToData={props.jumpToData} fips={props.fips} />
            </Grid>
          )}

          {!variableConfig && (
            <NoDataAlert dropdownVarId={props.dropdownVarId} />
          )}

          {variableConfig && (
            <Grid container spacing={1} justifyContent="center">
              {/* DEMOGRAPHIC / DATA TYPE TOGGLE(S) */}
              <Grid item container xs={12} md={SINGLE_COLUMN_WIDTH}>
                <ReportToggleControls
                  dropdownVarId={props.dropdownVarId}
                  variableConfig={variableConfig}
                  setVariableConfig={setVariableConfigWithParam}
                  currentBreakdown={currentBreakdown}
                  setCurrentBreakdown={setDemoWithParam}
                  fips={props.fips}
                />
              </Grid>

              {/* 100k MAP CARD */}
              <Grid
                item
                xs={12}
                md={SINGLE_COLUMN_WIDTH}
                id="rate-map"
                className={styles.ScrollPastHeader}
              >
                <MapCard
                  variableConfig={variableConfig}
                  fips={props.fips}
                  updateFipsCallback={(fips: Fips) => {
                    props.updateFipsCallback(fips);
                  }}
                  currentBreakdown={currentBreakdown}
                  jumpToDefinitions={props.jumpToDefinitions}
                  jumpToData={props.jumpToData}
                />
              </Grid>

              {/* RATE TRENDS LINE CHART CARD */}
              <Grid
                item
                xs={12}
                sm={12}
                md={SINGLE_COLUMN_WIDTH}
                id="rate-trends"
                className={styles.ScrollPastHeader}
              >
                <LazyLoad offset={600} height={750} once>
                  {DEMOGRAPHIC_BREAKDOWNS.map((breakdownVar) => (
                    <Fragment key={breakdownVar}>
                      {breakdownIsShown(breakdownVar) &&
                        // only show longitudinal 100k chart if MetricConfig for current condition has a card title
                        variableConfig.longitudinalData && (
                          <RateTrendsChartCard
                            variableConfig={variableConfig}
                            breakdownVar={breakdownVar}
                            fips={props.fips}
                          />
                        )}
                    </Fragment>
                  ))}
                </LazyLoad>
              </Grid>

              {/* 100K BAR CHART CARD */}
              <Grid
                item
                xs={12}
                sm={12}
                md={SINGLE_COLUMN_WIDTH}
                id="rate-chart"
                className={styles.ScrollPastHeader}
              >
                <LazyLoad offset={600} height={750} once>
                  {DEMOGRAPHIC_BREAKDOWNS.map((breakdownVar) => (
                    <Fragment key={breakdownVar}>
                      {breakdownIsShown(breakdownVar) &&
                        variableConfig.metrics["per100k"] && (
                          <SimpleBarChartCard
                            variableConfig={variableConfig}
                            breakdownVar={breakdownVar}
                            fips={props.fips}
                          />
                        )}
                    </Fragment>
                  ))}
                </LazyLoad>
              </Grid>

              {/* UNKNOWNS MAP CARD */}
              <Grid
                item
                xs={12}
                sm={12}
                md={SINGLE_COLUMN_WIDTH}
                id="unknowns-map"
                className={styles.ScrollPastHeader}
              >
                <LazyLoad offset={800} height={750} once>
                  {variableConfig.metrics["pct_share"] && (
                    <UnknownsMapCard
                      overrideAndWithOr={currentBreakdown === RACE}
                      variableConfig={variableConfig}
                      fips={props.fips}
                      updateFipsCallback={(fips: Fips) => {
                        props.updateFipsCallback(fips);
                      }}
                      currentBreakdown={currentBreakdown}
                    />
                  )}
                </LazyLoad>
              </Grid>

              {/* SHARE TRENDS LINE CHART CARD */}
              <Grid
                item
                xs={12}
                sm={12}
                md={SINGLE_COLUMN_WIDTH}
                id="share-trends"
                className={styles.ScrollPastHeader}
              >
                <LazyLoad offset={600} height={750} once>
                  {DEMOGRAPHIC_BREAKDOWNS.map((breakdownVar) => (
                    <Fragment key={breakdownVar}>
                      {breakdownIsShown(breakdownVar) &&
                        // only show longitudinal 100k chart if MetricConfig for current condition has a card title
                        variableConfig.longitudinalData && (
                          <ShareTrendsChartCard
                            variableConfig={variableConfig}
                            breakdownVar={breakdownVar}
                            fips={props.fips}
                          />
                        )}
                    </Fragment>
                  ))}
                </LazyLoad>
              </Grid>

              {/* DISPARITY BAR CHART COMPARE VS POPULATION */}
              <Grid
                item
                xs={12}
                sm={12}
                md={SINGLE_COLUMN_WIDTH}
                id="population-vs-share"
                className={styles.ScrollPastHeader}
              >
                <LazyLoad offset={800} height={750} once>
                  {DEMOGRAPHIC_BREAKDOWNS.map((breakdownVar) => (
                    <Fragment key={breakdownVar}>
                      {breakdownIsShown(breakdownVar) &&
                        variableConfig.metrics["pct_share"] && (
                          <DisparityBarChartCard
                            variableConfig={variableConfig}
                            breakdownVar={breakdownVar}
                            fips={props.fips}
                          />
                        )}
                    </Fragment>
                  ))}
                </LazyLoad>
              </Grid>

              {/* DATA TABLE CARD */}
              <Grid
                item
                xs={12}
                md={SINGLE_COLUMN_WIDTH}
                id="data-table"
                className={styles.ScrollPastHeader}
              >
                <LazyLoad offset={800} height={750} once>
                  {DEMOGRAPHIC_BREAKDOWNS.map((breakdownVar) => (
                    <Fragment key={breakdownVar}>
                      {breakdownIsShown(breakdownVar) && (
                        <TableCard
                          fips={props.fips}
                          variableConfig={variableConfig}
                          breakdownVar={breakdownVar}
                        />
                      )}
                    </Fragment>
                  ))}
                </LazyLoad>
              </Grid>

              {/* AGE ADJUSTED TABLE CARD */}
              {variableConfig.metrics.age_adjusted_ratio.ageAdjusted && (
                <Grid
                  item
                  xs={12}
                  md={SINGLE_COLUMN_WIDTH}
                  id="age-adjusted-risk"
                  className={styles.ScrollPastHeader}
                >
                  <LazyLoad offset={800} height={800} once>
                    <AgeAdjustedTableCard
                      fips={props.fips}
                      variableConfig={variableConfig}
                      dropdownVarId={props.dropdownVarId}
                      breakdownVar={currentBreakdown}
                      setVariableConfigWithParam={setVariableConfigWithParam}
                      jumpToData={props.jumpToData}
                    />
                  </LazyLoad>
                </Grid>
              )}
            </Grid>
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
          direction="column"
          alignItems="center"
        >
          <TableOfContents
            floatTopOffset={HEADER_OFFSET_ONE_VAR}
            isScrolledToTop={props.isScrolledToTop}
            reportSteps={props.reportSteps}
          />
        </Grid>
      )}
    </Grid>
  );
}
