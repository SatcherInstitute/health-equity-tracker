import { Grid } from "@material-ui/core";
import React, { useEffect, useState, Fragment, useRef } from "react";
import LazyLoad from "react-lazyload";
import { useLocation } from "react-router-dom";
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
  VAXX,
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

export interface VariableDisparityReportProps {
  key: string;
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

  // handle incoming link to MISSING DATA sections
  const location: any = useLocation();

  // const doScrollToData: boolean =
  //   location?.hash === `#${WHAT_DATA_ARE_MISSING_ID}`;

  if (location?.hash) {
    console.log(location.hash);

    ref100kMap.current &&
      setTimeout(() => {
        ref100kMap?.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 2000);

    // eslint-disable-next-line no-restricted-globals
    // history.pushState(
    //   "",
    //   document.title,
    //   window.location.pathname + window.location.search
    // );
  }

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
        <Grid item xs={12} md={SINGLE_COLUMN_WIDTH} id="populationCard">
          <PopulationCard jumpToData={props.jumpToData} fips={props.fips} />
        </Grid>
      )}

      {!variableConfig && <NoDataAlert dropdownVarId={props.dropdownVarId} />}

      {variableConfig && (
        <Grid container spacing={1} justifyContent="center">
          {/* DEMOGRAPHIC / DATA TYPE TOGGLE(S) */}
          {!(props.dropdownVarId === VAXX && props.fips.isCounty()) && (
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
          <Grid item xs={12} md={SINGLE_COLUMN_WIDTH} id="100kMap">
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

          {/* 100K BAR CHART CARD */}
          <Grid item xs={12} sm={12} md={SINGLE_COLUMN_WIDTH} id="100kBarChart">
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

          {/* UNKNOWNS MAP CARD */}
          <Grid item xs={12} sm={12} md={SINGLE_COLUMN_WIDTH} id="UnknownsMap">
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

          {/* DISPARITY BAR CHART COMPARE VS POPULATION */}
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

          {/* DATA TABLE CARD */}
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
        </Grid>
      )}
    </Grid>
  );
}
