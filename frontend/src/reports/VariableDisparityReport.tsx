import { Grid } from "@material-ui/core";
import React, { useEffect, useState, Fragment } from "react";
import { DisparityBarChartCard } from "../cards/DisparityBarChartCard";
import { MapCard } from "../cards/MapCard";
import { PopulationCard } from "../cards/PopulationCard";
import { SimpleBarChartCard } from "../cards/SimpleBarChartCard";
import { TableCard } from "../cards/TableCard";
import { UnknownsMapCard } from "../cards/UnknownsMapCard";
import { METRIC_CONFIG, VariableConfig } from "../data/config/MetricConfig";
import { BreakdownVar, DEMOGRAPHIC_BREAKDOWNS } from "../data/query/Breakdowns";
import { Fips } from "../data/utils/Fips";
import { DropdownVarId } from "../utils/MadLibs";
import {
  DATA_TYPE_1_PARAM,
  DATA_TYPE_2_PARAM,
  DEMOGRAPHIC_PARAM,
  getParameter,
  psSubscribe,
  setParameter,
  setParameters,
} from "../utils/urlutils";
import NoDataAlert from "./ui/NoDataAlert";
import ReportToggleControls from "./ui/ReportToggleControls";

export interface VariableDisparityReportProps {
  key: string;
  dropdownVarId: DropdownVarId;
  fips: Fips;
  updateFipsCallback: Function;
  hidePopulationCard?: boolean;
  jumpToDefinitions?: Function;
}

export function VariableDisparityReport(props: VariableDisparityReportProps) {
  const [currentBreakdown, setCurrentBreakdown] = useState<BreakdownVar>(
    getParameter(DEMOGRAPHIC_PARAM, "race_and_ethnicity")
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

      const demo: BreakdownVar = getParameter(
        DEMOGRAPHIC_PARAM,
        "race_and_ethnicity"
      );
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
    <Grid item container xs={12} spacing={1} justify="center">
      {!props.hidePopulationCard && (
        <Grid item xs={12}>
          <PopulationCard fips={props.fips} />
        </Grid>
      )}

      {!variableConfig && <NoDataAlert dropdownVarId={props.dropdownVarId} />}

      {variableConfig && (
        <Grid container spacing={1} justify="center">
          {!(
            props.dropdownVarId ===
              METRIC_CONFIG["vaccinations"][0].variableId &&
            props.fips.isCounty()
          ) && (
            <Grid item container xs={12}>
              <ReportToggleControls
                dropdownVarId={props.dropdownVarId}
                variableConfig={variableConfig}
                setVariableConfig={setVariableConfigWithParam}
                currentBreakdown={currentBreakdown}
                setCurrentBreakdown={setDemoWithParam}
              />
            </Grid>
          )}
          <Grid item xs={12} sm={12} md={6}>
            <MapCard
              variableConfig={variableConfig}
              fips={props.fips}
              updateFipsCallback={(fips: Fips) => {
                props.updateFipsCallback(fips);
              }}
              currentBreakdown={currentBreakdown}
              jumpToDefinitions={props.jumpToDefinitions}
            />
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
          </Grid>
          <Grid item xs={12} sm={12} md={6}>
            {variableConfig.metrics["pct_share"] && (
              <UnknownsMapCard
                overrideAndWithOr={currentBreakdown === "race_and_ethnicity"}
                variableConfig={variableConfig}
                fips={props.fips}
                updateFipsCallback={(fips: Fips) => {
                  props.updateFipsCallback(fips);
                }}
                currentBreakdown={currentBreakdown}
              />
            )}
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
          </Grid>
        </Grid>
      )}
    </Grid>
  );
}
