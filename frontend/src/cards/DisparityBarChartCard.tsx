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
import { VariableConfig } from "../data/config/MetricConfig";
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
  variableConfig: VariableConfig;
  fips: Fips;
}

// This wrapper ensures the proper key is set to create a new instance when
// required rather than relying on the card caller.
export function DisparityBarChartCard(props: DisparityBarChartCardProps) {
  return (
    <DisparityBarChartCardWithKey
      key={props.variableConfig.variableId + props.breakdownVar}
      {...props}
    />
  );
}

function DisparityBarChartCardWithKey(props: DisparityBarChartCardProps) {
  const metricConfig = props.variableConfig.metrics["pct_share"];

  const breakdowns = Breakdowns.forFips(props.fips).addBreakdown(
    props.breakdownVar,
    exclude(ALL, NON_HISPANIC)
  );

  // Population Comparison Metric is required for the Disparity Bar Chart.
  // If MetricConfig supports known breakdown metric, prefer this metric.
  let metricIds = [
    metricConfig.metricId,
    metricConfig.populationComparisonMetric!.metricId,
  ];
  if (metricConfig.knownBreakdownComparisonMetric) {
    metricIds.push(metricConfig.knownBreakdownComparisonMetric.metricId);
  }
  const query = new MetricQuery(metricIds, breakdowns);

  function CardTitle() {
    return (
      <>
        Disparities in {metricConfig.fullCardTitleName} by{" "}
        <b>{BREAKDOWN_VAR_DISPLAY_NAMES[props.breakdownVar]}</b> in{" "}
        {props.fips.getFullDisplayName()}
      </>
    );
  }

  return (
    <CardWrapper queries={[query]} title={<CardTitle />}>
      {([queryResponse]) => {
        const dataWithoutUnknowns = queryResponse
          .getValidRowsForField(metricConfig.metricId)
          .filter(
            (row: Row) =>
              row[props.breakdownVar] !== UNKNOWN &&
              row[props.breakdownVar] !== UNKNOWN_RACE
          );

        const dataAvailable = !queryResponse.shouldShowMissingDataMessage([
          metricConfig.metricId,
        ]);
        return (
          <>
            {!dataAvailable && (
              <CardContent className={styles.Breadcrumbs}>
                <MissingDataAlert
                  dataName={metricConfig.fullCardTitleName}
                  breakdownString={
                    BREAKDOWN_VAR_DISPLAY_NAMES[props.breakdownVar]
                  }
                />
              </CardContent>
            )}
            {dataAvailable && (
              <UnknownsAlert
                metricConfig={metricConfig}
                queryResponse={queryResponse}
                breakdownVar={props.breakdownVar}
                displayType="chart"
                known={true}
              />
            )}
            {dataAvailable && dataWithoutUnknowns.length !== 0 && (
              <CardContent className={styles.Breadcrumbs}>
                <DisparityBarChart
                  data={dataWithoutUnknowns}
                  lightMetric={metricConfig.populationComparisonMetric!}
                  darkMetric={
                    metricConfig.knownBreakdownComparisonMetric || metricConfig
                  }
                  breakdownVar={props.breakdownVar}
                  metricDisplayName={metricConfig.shortVegaLabel}
                />
              </CardContent>
            )}
          </>
        );
      }}
    </CardWrapper>
  );
}
