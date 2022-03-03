import { Box, Button, Grid } from "@material-ui/core";
import React, { useEffect, useState, useRef } from "react";
import LazyLoad from "react-lazyload";
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
} from "../utils/urlutils";
import { SINGLE_COLUMN_WIDTH } from "./ReportProvider";
import NoDataAlert from "./ui/NoDataAlert";
import ReportToggleControls from "./ui/ReportToggleControls";
import styles from "./Report.module.scss";
import { Alert } from "@material-ui/lab";

export interface VariableDisparityReportProps {
  key: string;
  singleCard: string | null;
  dropdownVarId: DropdownVarId;
  fips: Fips;
  updateFipsCallback: Function;
  hidePopulationCard?: boolean;
  jumpToDefinitions: Function;
  jumpToData: Function;
}

export function VariableDisparityReport(props: VariableDisparityReportProps) {
  const ref100kMap = useRef<null | HTMLDivElement>(null);
  const ref100kBarChart = useRef<null | HTMLDivElement>(null);
  const refUnknownsMap = useRef<null | HTMLDivElement>(null);
  const refPopulationShareMap = useRef<null | HTMLDivElement>(null);
  const refDataTable = useRef<null | HTMLDivElement>(null);

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

  const breakdownIsShown = (breakdownVar: string) =>
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
      {!props.singleCard && !props.hidePopulationCard && (
        // POPULATION CARD
        <Grid item xs={12} md={SINGLE_COLUMN_WIDTH} id="populationCard">
          <PopulationCard jumpToData={props.jumpToData} fips={props.fips} />
        </Grid>
      )}

      {!variableConfig && <NoDataAlert dropdownVarId={props.dropdownVarId} />}

      {variableConfig && (
        <Grid container spacing={1} justifyContent="center">
          {/* DEMOGRAPHIC / DATA TYPE TOGGLE(S) */}
          {!props.singleCard && (
            <Grid item container xs={12} md={SINGLE_COLUMN_WIDTH}>
              <ReportToggleControls
                dropdownVarId={props.dropdownVarId}
                variableConfig={variableConfig}
                setVariableConfig={setVariableConfigWithParam}
                currentBreakdown={currentBreakdown}
                setCurrentBreakdown={setDemoWithParam}
              />
            </Grid>
          )}

          {/* 100k MAP CARD */}
          {(!props.singleCard || props.singleCard === "#Map100k") && (
            <Grid item xs={12} md={SINGLE_COLUMN_WIDTH} id="Map100k">
              <div ref={ref100kMap}>
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
              </div>
            </Grid>
          )}

          {/* 100K BAR CHART CARD */}
          {(!props.singleCard || props.singleCard === "#BarChart100k") && (
            <Grid
              item
              xs={12}
              sm={12}
              md={SINGLE_COLUMN_WIDTH}
              id="BarChart100k"
            >
              <LazyLoad offset={300} height={750} once>
                {DEMOGRAPHIC_BREAKDOWNS.map((breakdownVar) => (
                  <div ref={ref100kBarChart} key={breakdownVar}>
                    {breakdownIsShown(breakdownVar) &&
                      variableConfig.metrics["per100k"] && (
                        <SimpleBarChartCard
                          variableConfig={variableConfig}
                          breakdownVar={breakdownVar}
                          fips={props.fips}
                        />
                      )}
                  </div>
                ))}
              </LazyLoad>
            </Grid>
          )}

          {/* UNKNOWNS MAP CARD */}
          {(!props.singleCard || props.singleCard === "#UnknownsMap") && (
            <Grid
              item
              xs={12}
              sm={12}
              md={SINGLE_COLUMN_WIDTH}
              id="UnknownsMap"
            >
              <LazyLoad offset={300} height={750} once>
                {variableConfig.metrics["pct_share"] && (
                  <div ref={refUnknownsMap}>
                    <UnknownsMapCard
                      overrideAndWithOr={currentBreakdown === RACE}
                      variableConfig={variableConfig}
                      fips={props.fips}
                      updateFipsCallback={(fips: Fips) => {
                        props.updateFipsCallback(fips);
                      }}
                      currentBreakdown={currentBreakdown}
                    />
                  </div>
                )}
              </LazyLoad>
            </Grid>
          )}

          {/* DISPARITY BAR CHART COMPARE VS POPULATION */}
          {(!props.singleCard ||
            props.singleCard === "#PopulationShareMap") && (
            <Grid
              item
              xs={12}
              sm={12}
              md={SINGLE_COLUMN_WIDTH}
              id="PopulationShareMap"
            >
              <LazyLoad offset={300} height={750} once>
                {DEMOGRAPHIC_BREAKDOWNS.map((breakdownVar) => (
                  <div ref={refPopulationShareMap} key={breakdownVar}>
                    {breakdownIsShown(breakdownVar) &&
                      variableConfig.metrics["pct_share"] && (
                        <DisparityBarChartCard
                          variableConfig={variableConfig}
                          breakdownVar={breakdownVar}
                          fips={props.fips}
                        />
                      )}
                  </div>
                ))}
              </LazyLoad>
            </Grid>
          )}

          {/* DATA TABLE CARD */}
          {(!props.singleCard || props.singleCard === "#DataTable") && (
            <Grid item xs={12} md={SINGLE_COLUMN_WIDTH} id="DataTable">
              <LazyLoad offset={300} height={750} once>
                {DEMOGRAPHIC_BREAKDOWNS.map((breakdownVar) => (
                  <div key={breakdownVar} ref={refDataTable}>
                    {breakdownIsShown(breakdownVar) && (
                      <TableCard
                        fips={props.fips}
                        variableConfig={variableConfig}
                        breakdownVar={breakdownVar}
                      />
                    )}
                  </div>
                ))}
              </LazyLoad>
            </Grid>
          )}

          {props.singleCard && (
            <Box my={5}>
              <Button
                variant="contained"
                color="primary"
                className={styles.PrimaryButton}
                href={"#"}
              >
                View the Full Report
              </Button>
            </Box>
          )}
        </Grid>
      )}
    </Grid>
  );
}
