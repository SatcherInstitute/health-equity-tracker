import React from "react";
import { DisparityBarChart } from "../charts/DisparityBarChart";
import styles from "./Card.module.scss";
import { CardContent } from "@material-ui/core";
import { Fips } from "../data/utils/Fips";
import {
  Breakdowns,
  BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES,
} from "../data/query/Breakdowns";
import { MetricQuery } from "../data/query/MetricQuery";
import { MetricConfig } from "../data/config/MetricConfig";
import CardWrapper from "./CardWrapper";
import MissingDataAlert from "./ui/MissingDataAlert";
import { exclude } from "../data/query/BreakdownFilter";
import {
  NON_HISPANIC,
  ALL,
  UNKNOWN,
  UNKNOWN_RACE,
} from "../data/utils/Constants";
import { Row } from "../data/utils/DatasetTypes";
import UnknownsAlert from "./ui/UnknownsAlert";

export interface DisparityBarChartCardProps {
  key?: string;
  breakdownVar: BreakdownVar;
  metricConfig: MetricConfig;
  fips: Fips;
}

// This wrapper ensures the proper key is set to create a new instance when
// required rather than relying on the card caller.
export function DisparityBarChartCard(props: DisparityBarChartCardProps) {
  return (
    <DisparityBarChartCardWithKey
      key={props.metricConfig.metricId + props.breakdownVar}
      {...props}
    />
  );
}

function DisparityBarChartCardWithKey(props: DisparityBarChartCardProps) {
  const breakdowns = Breakdowns.forFips(props.fips).addBreakdown(
    props.breakdownVar,
    exclude(ALL, NON_HISPANIC)
  );

  // Population Comparison Metric is required for the Disparity Bar Chart.
  // If MetricConfig supports known breakdown metric, prefer this metric.
  let metricIds = [
    props.metricConfig.metricId,
    props.metricConfig.populationComparisonMetric!.metricId,
  ];
  if (props.metricConfig.knownBreakdownComparisonMetric) {
    metricIds.push(props.metricConfig.knownBreakdownComparisonMetric.metricId);
  }
  const query = new MetricQuery(metricIds, breakdowns);

  function CardTitle() {
    return (
      <>
        Disparities in {props.metricConfig.fullCardTitleName} by{" "}
        <b>{BREAKDOWN_VAR_DISPLAY_NAMES[props.breakdownVar]}</b> in{" "}
        {props.fips.getFullDisplayName()}
      </>
    );
  }

  return (
    <CardWrapper queries={[query]} title={<CardTitle />}>
      {([queryResponse]) => {
        const dataWithoutUnknowns = queryResponse
          .getValidRowsForField(props.metricConfig.metricId)
          .filter(
            (row: Row) =>
              row[props.breakdownVar] !== UNKNOWN &&
              row[props.breakdownVar] !== UNKNOWN_RACE
          );

        return (
          <>
            <UnknownsAlert
              metricConfig={props.metricConfig}
              queryResponse={queryResponse}
              breakdownVar={props.breakdownVar}
              displayType="chart"
              known={true}
            />
            {queryResponse.shouldShowMissingDataMessage([
              props.metricConfig.metricId,
            ]) && (
              <CardContent className={styles.Breadcrumbs}>
                <MissingDataAlert
                  dataName={props.metricConfig.fullCardTitleName}
                  breakdownString={
                    BREAKDOWN_VAR_DISPLAY_NAMES[props.breakdownVar]
                  }
                />
              </CardContent>
            )}
            {!queryResponse.shouldShowMissingDataMessage([
              props.metricConfig.metricId,
            ]) && (
              <CardContent className={styles.Breadcrumbs}>
                <DisparityBarChart
                  data={dataWithoutUnknowns}
                  lightMetric={props.metricConfig.populationComparisonMetric!}
                  darkMetric={
                    props.metricConfig.knownBreakdownComparisonMetric ||
                    props.metricConfig
                  }
                  breakdownVar={props.breakdownVar}
                  metricDisplayName={props.metricConfig.shortVegaLabel}
                />
              </CardContent>
            )}
          </>
        );
      }}
    </CardWrapper>
  );
}
