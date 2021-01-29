import React from "react";
import { TableChart } from "../charts/TableChart";
import { Alert } from "@material-ui/lab";
import CardWrapper from "./CardWrapper";
import { MetricQuery } from "../data/MetricQuery";
import { Fips } from "../utils/madlib/Fips";
import {
  Breakdowns,
  BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES,
} from "../data/Breakdowns";
import { CardContent } from "@material-ui/core";
import { MetricConfig, MetricId } from "../data/MetricConfig";
import RaceInfoPopoverContent from "./ui/RaceInfoPopoverContent";
import { exclude } from "../data/query/BreakdownFilter";
import { NON_HISPANIC } from "../data/Constants";

export interface TableCardProps {
  fips: Fips;
  breakdownVar: BreakdownVar;
  metrics: MetricConfig[];
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
        <>{`${
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
                <Alert severity="warning">
                  Missing data means that we don't know the full story.
                </Alert>
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
