import React from "react";
import { TableChart } from "../charts/TableChart";
import CardWrapper from "./CardWrapper";
import { MetricQuery } from "../data/query/MetricQuery";
import { Fips } from "../data/utils/Fips";
import {
  Breakdowns,
  BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES,
} from "../data/query/Breakdowns";
import { CardContent } from "@material-ui/core";
import {
  MetricConfig,
  MetricId,
  VariableConfig,
} from "../data/config/MetricConfig";
import RaceInfoPopoverContent from "./ui/RaceInfoPopoverContent";
import { exclude } from "../data/query/BreakdownFilter";
import { NON_HISPANIC } from "../data/utils/Constants";
import MissingDataAlert from "./ui/MissingDataAlert";

export interface TableCardProps {
  fips: Fips;
  breakdownVar: BreakdownVar;
  metrics: MetricConfig[];
  variableConfig: VariableConfig;
}

export function TableCard(props: TableCardProps) {
  const breakdowns = Breakdowns.forFips(props.fips).addBreakdown(
    props.breakdownVar,
    props.breakdownVar === "race_and_ethnicity"
      ? exclude(NON_HISPANIC)
      : undefined
  );
  let metricIds: MetricId[] = [];
  props.metrics.forEach((metricConfig) => {
    metricIds.push(metricConfig.metricId);
    if (metricConfig.populationComparisonMetric) {
      metricIds.push(metricConfig.populationComparisonMetric.metricId);
    }
  });
  const query = new MetricQuery(metricIds, breakdowns);

  return (
    <CardWrapper
      queries={[query]}
      title={
        <>{`${props.variableConfig.variableFullDisplayName} by ${
          BREAKDOWN_VAR_DISPLAY_NAMES[props.breakdownVar]
        } in ${props.fips.getFullDisplayName()}`}</>
      }
      infoPopover={
        props.breakdownVar === "race_and_ethnicity" ? (
          <RaceInfoPopoverContent />
        ) : undefined
      }
    >
      {([queryResponse]) => {
        return (
          <>
            {queryResponse.shouldShowMissingDataMessage(metricIds) && (
              <CardContent>
                <MissingDataAlert
                  dataName={props.variableConfig.variableFullDisplayName + " "}
                  breakdownString={
                    BREAKDOWN_VAR_DISPLAY_NAMES[props.breakdownVar]
                  }
                />
              </CardContent>
            )}
            {!queryResponse.dataIsMissing() && (
              <TableChart
                data={queryResponse.data}
                breakdownVar={props.breakdownVar}
                metrics={props.metrics}
              />
            )}
          </>
        );
      }}
    </CardWrapper>
  );
}
