import React from "react";
import Alert from "@material-ui/lab/Alert";
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
import { VariableConfig, METRIC_CONFIG } from "../data/config/MetricConfig";
import CardWrapper from "./CardWrapper";
import MissingDataAlert from "./ui/MissingDataAlert";
import { exclude } from "../data/query/BreakdownFilter";
import {
  NON_HISPANIC,
  ALL,
  UNKNOWN,
  UNKNOWN_RACE,
  UNKNOWN_ETHNICITY,
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

  // use secondary ACS population comparison if STATE LEVEL and VACCINATION
  const show2ndPopulationCompare =
    props.fips.isState() &&
    props.variableConfig.variableId ===
      METRIC_CONFIG["vaccinated"][0].variableId;

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
  // KFF doesn't calculate population comparisons for some demographic groups; use ACS instead but as different color
  if (show2ndPopulationCompare) {
    metricIds.push(metricConfig.secondaryPopulationComparisonMetric!.metricId);
  }

  const query = new MetricQuery(metricIds, breakdowns);

  function getTitleText() {
    return `${metricConfig.fullCardTitleName} vs. Population By ${
      BREAKDOWN_VAR_DISPLAY_NAMES[props.breakdownVar]
    } In ${props.fips.getFullDisplayName()}`;
  }
  function CardTitle() {
    return <>{getTitleText()}</>;
  }

  return (
    <CardWrapper queries={[query]} title={<CardTitle />}>
      {([queryResponse]) => {
        const dataWithoutUnknowns = queryResponse
          .getValidRowsForField(metricConfig.metricId)
          .filter(
            (row: Row) =>
              row[props.breakdownVar] !== UNKNOWN &&
              row[props.breakdownVar] !== UNKNOWN_RACE &&
              row[props.breakdownVar] !== UNKNOWN_ETHNICITY
          );

        let shouldShowDoesntAddUpMessage = false;
        if (
          props.breakdownVar === "race_and_ethnicity" &&
          queryResponse.data.length > 0
        ) {
          shouldShowDoesntAddUpMessage = true;
          queryResponse.data.forEach((elem) => {
            if (elem[props.breakdownVar].includes("(Non-Hispanic)")) {
              shouldShowDoesntAddUpMessage = false;
            }
          });
        }

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
                  geoLevel={props.fips.getFipsTypeDisplayName()}
                  noDemographicInfo={
                    props.variableConfig.variableId ===
                      METRIC_CONFIG["vaccinated"][0].variableId &&
                    props.fips.isCounty()
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
                overrideAndWithOr={props.breakdownVar === "race_and_ethnicity"}
              />
            )}
            {dataAvailable && dataWithoutUnknowns.length !== 0 && (
              <CardContent className={styles.Breadcrumbs}>
                {console.log(
                  "show 2nd pop before props to bar",
                  show2ndPopulationCompare
                )}
                <DisparityBarChart
                  data={dataWithoutUnknowns}
                  lightMetric={metricConfig.populationComparisonMetric!}
                  show2ndPopulationCompare={show2ndPopulationCompare}
                  thirdMetric={
                    show2ndPopulationCompare
                      ? metricConfig.secondaryPopulationComparisonMetric
                      : undefined
                  }
                  darkMetric={
                    metricConfig.knownBreakdownComparisonMetric || metricConfig
                  }
                  breakdownVar={props.breakdownVar}
                  metricDisplayName={metricConfig.shortVegaLabel}
                  filename={getTitleText()}
                />
              </CardContent>
            )}
            {shouldShowDoesntAddUpMessage && (
              <Alert severity="info">
                Population percentages on this graph add up to over 100% because
                the racial categories reported for{" "}
                {metricConfig.fullCardTitleName} include Hispanic individuals in
                each racial category. As a result, Hispanic individuals are
                counted twice.
              </Alert>
            )}
          </>
        );
      }}
    </CardWrapper>
  );
}
