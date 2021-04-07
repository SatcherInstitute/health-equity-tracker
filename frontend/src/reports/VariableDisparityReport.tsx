import React, { useState } from "react";
import { Grid } from "@material-ui/core";
import { BreakdownVar, DEMOGRAPHIC_BREAKDOWNS } from "../data/query/Breakdowns";
import { MapCard } from "../cards/MapCard";
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

export interface VariableDisparityReportProps {
  key: string;
  dropdownVarId: DropdownVarId;
  fips: Fips;
  updateFipsCallback: Function;
  hidePopulationCard?: boolean;
}

export function VariableDisparityReport(props: VariableDisparityReportProps) {
  const [currentBreakdown, setCurrentBreakdown] = useState<BreakdownVar>(
    "race_and_ethnicity"
  );

  // TODO Remove hard coded fail safe value
  const [variableConfig, setVariableConfig] = useState<VariableConfig | null>(
    Object.keys(METRIC_CONFIG).includes(props.dropdownVarId)
      ? METRIC_CONFIG[props.dropdownVarId][0]
      : null
  );

  const breakdownIsShown = (breakdownVar: string) =>
    currentBreakdown === breakdownVar;

  return (
    <Grid container xs={12} spacing={1} justify="center">
      {!props.hidePopulationCard && (
        <Grid item xs={12}>
          <PopulationCard fips={props.fips} />
        </Grid>
      )}

      {!variableConfig && <NoDataAlert dropdownVarId={props.dropdownVarId} />}

      {variableConfig && (
        <Grid container spacing={1} justify="center">
          <Grid container xs={12}>
            <ReportToggleControls
              dropdownVarId={props.dropdownVarId}
              variableConfig={variableConfig}
              setVariableConfig={setVariableConfig}
              currentBreakdown={currentBreakdown}
              setCurrentBreakdown={setCurrentBreakdown}
            />
          </Grid>
          <Grid item xs={12} sm={12} md={6}>
            <MapCard
              metricConfig={variableConfig.metrics["per100k"]}
              fips={props.fips}
              updateFipsCallback={(fips: Fips) => {
                props.updateFipsCallback(fips);
              }}
              currentBreakdown={currentBreakdown}
            />
            {DEMOGRAPHIC_BREAKDOWNS.map((breakdownVar) => (
              <>
                {breakdownIsShown(breakdownVar) && (
                  <TableCard
                    fips={props.fips}
                    variableConfig={variableConfig}
                    metrics={getPer100kAndPctShareMetrics(variableConfig)}
                    breakdownVar={breakdownVar}
                  />
                )}
              </>
            ))}
          </Grid>
          <Grid item xs={12} sm={12} md={6}>
            {DEMOGRAPHIC_BREAKDOWNS.map((breakdownVar) => (
              <>
                {breakdownIsShown(breakdownVar) &&
                  variableConfig.metrics["pct_share"] && (
                    <DisparityBarChartCard
                      metricConfig={variableConfig.metrics["pct_share"]}
                      breakdownVar={breakdownVar}
                      fips={props.fips}
                    />
                  )}
                {breakdownIsShown(breakdownVar) &&
                  variableConfig.metrics["per100k"] && (
                    <SimpleBarChartCard
                      metricConfig={variableConfig.metrics["per100k"]}
                      breakdownVar={breakdownVar}
                      fips={props.fips}
                    />
                  )}
              </>
            ))}
          </Grid>
        </Grid>
      )}
    </Grid>
  );
}
