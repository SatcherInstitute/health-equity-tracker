import React from "react";
import { TableChart } from "../charts/TableChart";
import { Alert } from "@material-ui/lab";
import CardWrapper from "./CardWrapper";
import useDatasetStore from "../data/useDatasetStore";
import { getDependentDatasets, MetricId } from "../data/variableProviders";
import { MetricQuery } from "../data/MetricQuery";
import { Fips } from "../utils/madlib/Fips";
import {
  Breakdowns,
  BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES,
} from "../data/Breakdowns";
import { CardContent } from "@material-ui/core";
import { MetricConfig } from "../data/MetricConfig";

export interface TableCardProps {
  fips: Fips;
  breakdownVar: BreakdownVar;
  metrics: MetricConfig[];
  nonstandardizedRace: boolean /* TODO- ideally wouldn't go here, could be calculated based on dataset */;
}

export function TableCard(props: TableCardProps) {
  const datasetStore = useDatasetStore();

  // TODO need to handle race categories standard vs non-standard for covid vs
  // other demographic.
  const breakdowns = Breakdowns.forFips(props.fips).addBreakdown(
    props.breakdownVar,
    props.nonstandardizedRace
  );
  const metricIds: MetricId[] = props.metrics.map(
    (metricConfig) => metricConfig.metricId
  );
  const query = new MetricQuery(metricIds, breakdowns);
  const datasetIds = getDependentDatasets(metricIds);

  return (
    <CardWrapper
      queries={[query]}
      datasetIds={datasetIds}
      titleText={`${
        BREAKDOWN_VAR_DISPLAY_NAMES[props.breakdownVar]
      } in ${props.fips.getFullDisplayName()}`}
    >
      {() => {
        const queryResponse = datasetStore.getMetrics(query);
        const dataset = queryResponse.data.filter(
          (row) =>
            !["Not Hispanic or Latino", "Total"].includes(
              row.race_and_ethnicity
            )
        );

        return (
          <>
            {queryResponse.shouldShowError(metricIds) && (
              <CardContent>
                <Alert severity="warning">
                  Missing data means that we don't know the full story.
                </Alert>
              </CardContent>
            )}
            {!queryResponse.isError() && (
              <TableChart
                data={dataset}
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
