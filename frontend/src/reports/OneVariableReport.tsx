/* eslint-disable react-hooks/exhaustive-deps */
import { Grid } from "@material-ui/core";
import React, { useEffect, useState, Fragment, useRef, RefObject } from "react";
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
import styles from "./Report.module.scss";
import { ScrollableHashId, steps } from "../pages/ExploreData/CardsStepper";
// import useIsOnScreen from "../utils/useIsOnScreen";
import { useInView } from "react-intersection-observer";

const hashIds = steps.map((step) => step.hashId);

export interface OneVariableReportProps {
  key: string;
  dropdownVarId: DropdownVarId;
  fips: Fips;
  updateFipsCallback: Function;
  hidePopulationCard?: boolean;
  jumpToDefinitions: Function;
  jumpToData: Function;
  activeStep: number;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
  cardsInView?: string[];
  setCardsInView?: React.Dispatch<React.SetStateAction<string[]>>;
}

export function OneVariableReport(props: OneVariableReportProps) {
  // const populationRef = useRef(null);
  // const populationIsOnScreen = useIsOnScreen(populationRef);

  // const mapRef = useRef(null);
  // const mapIsOnScreen = useIsOnScreen(mapRef);

  // const barRef = useRef(null);
  // const barIsOnScreen = useIsOnScreen(barRef);

  // const unknownsRef = useRef(null);
  // const unknownsIsOnScreen = useIsOnScreen(unknownsRef);

  // const disparityRef = useRef(null);
  // const disparityIsOnScreen = useIsOnScreen(disparityRef);

  // const tableRef = useRef(null);
  // const tableIsOnScreen = useIsOnScreen(tableRef);

  // const ageAdjustedRef = useRef(null);
  // // const ageAdjustedIsOnScreen = useIsOnScreen(ageAdjustedRef);

  // const [cardOnScreen, setCardOnScreen] = useState<ScrollableHashId | null>(
  //   null
  // );

  // useEffect(() => {

  //   if (tableIsOnScreen) setCardOnScreen("table")
  //   else if (disparityIsOnScreen) setCardOnScreen("disparity")
  //   else if (unknownsIsOnScreen) setCardOnScreen("unknowns")
  //   else if (barIsOnScreen) setCardOnScreen("bar")
  //   else if (mapIsOnScreen) setCardOnScreen("map")
  //   else if (populationIsOnScreen) setCardOnScreen("population")

  //   // if (ageAdjustedIsOnScreen ) setCardOnScreen("age-adjusted")
  //   // else setCardOnScreen(null)

  // }, [
  //   populationIsOnScreen,
  //   mapIsOnScreen,
  //   barIsOnScreen,
  //   unknownsIsOnScreen,
  //   disparityIsOnScreen,
  //   tableIsOnScreen,
  //   // ageAdjustedIsOnScreen
  // ])

  // useEffect(() => {
  //   const stepIndex = steps.findIndex((step) => step.hashId === cardOnScreen) || props.activeStep
  //   // console.log("found index", stepIndex);
  //   props.setActiveStep(stepIndex)

  // }, [cardOnScreen])

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

  const breakdownIsShown = (breakdownVar: BreakdownVar) =>
    currentBreakdown === breakdownVar;

  return (
    <Grid
      item
      container
      xs={12}
      alignItems="center"
      spacing={1}
      justifyContent="center"
    >
      {!props.hidePopulationCard && (
        // POPULATION CARD
        <Grid
          item
          xs={12}
          md={SINGLE_COLUMN_WIDTH}
          className={styles.ScrollableId}
          id="population"
          // ref={populationRef}
        >
          <PopulationCard
            jumpToData={props.jumpToData}
            fips={props.fips}
            setActiveStep={props.setActiveStep}
            cardsInView={props.cardsInView}
            setCardsInView={props.setCardsInView}
          />
        </Grid>
      )}

      {!variableConfig && <NoDataAlert dropdownVarId={props.dropdownVarId} />}

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
            className={styles.ScrollableId}
            id="map"
            // ref={mapRef}
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
              setActiveStep={props.setActiveStep}
              cardsInView={props.cardsInView}
              setCardsInView={props.setCardsInView}
            />
          </Grid>

          {/* 100K BAR CHART CARD */}
          <Grid
            item
            xs={12}
            sm={12}
            md={SINGLE_COLUMN_WIDTH}
            className={styles.ScrollableId}
            id="bar"
            // ref={barRef}
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
                        setActiveStep={props.setActiveStep}
                        cardsInView={props.cardsInView}
                        setCardsInView={props.setCardsInView}
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
            className={styles.ScrollableId}
            id="unknowns"
            // ref={unknownsRef}
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
                  setActiveStep={props.setActiveStep}
                  cardsInView={props.cardsInView}
                  setCardsInView={props.setCardsInView}
                />
              )}
            </LazyLoad>
          </Grid>

          {/* DISPARITY BAR CHART COMPARE VS POPULATION */}
          <Grid
            item
            xs={12}
            sm={12}
            md={SINGLE_COLUMN_WIDTH}
            className={styles.ScrollableId}
            id="disparity"
            // ref={disparityRef}
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
                        setActiveStep={props.setActiveStep}
                        cardsInView={props.cardsInView}
                        setCardsInView={props.setCardsInView}
                      />
                    )}
                </Fragment>
              ))}
            </LazyLoad>
          </Grid>

          {/* DATA TABLE CARD */}
          <div>
            <Grid
              item
              xs={12}
              md={SINGLE_COLUMN_WIDTH}
              className={styles.ScrollableId}
              id="table"
              // ref={tableRef}

              // ref={tableRef}
            >
              <LazyLoad offset={800} height={750} once>
                {DEMOGRAPHIC_BREAKDOWNS.map((breakdownVar) => (
                  <Fragment key={breakdownVar}>
                    {breakdownIsShown(breakdownVar) && (
                      <TableCard
                        fips={props.fips}
                        variableConfig={variableConfig}
                        breakdownVar={breakdownVar}
                        setActiveStep={props.setActiveStep}
                        cardsInView={props.cardsInView}
                        setCardsInView={props.setCardsInView}
                      />
                    )}
                  </Fragment>
                ))}
              </LazyLoad>
            </Grid>
          </div>

          {/* AGE ADJUSTED TABLE CARD */}
          {variableConfig.metrics.age_adjusted_ratio.ageAdjusted && (
            <Grid
              item
              xs={12}
              md={SINGLE_COLUMN_WIDTH}
              className={styles.ScrollableId}
              id="age-adjusted"
              // ref={ageAdjustedRef}
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
  );
}
