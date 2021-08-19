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
  getPer100kAndPctShareMetrics,
} from "../data/config/MetricConfig";
import { exclude } from "../data/query/BreakdownFilter";
import {
  NON_HISPANIC,
  RACE,
  UNKNOWN,
  UNKNOWN_RACE,
} from "../data/utils/Constants";
import { Row } from "../data/utils/DatasetTypes";
import MissingDataAlert from "./ui/MissingDataAlert";
import Alert from "@material-ui/lab/Alert";
import Divider from "@material-ui/core/Divider";

export interface TableCardProps {
  fips: Fips;
  breakdownVar: BreakdownVar;
  variableConfig: VariableConfig;
}

export function TableCard(props: TableCardProps) {
  const metrics = getPer100kAndPctShareMetrics(props.variableConfig);

  /* TODO(993) change breakdowns to exclude ALL when the map card info alert is shown
    import { ALL } from "../data/utils/Constants";
    Breakdowns.forFips(props.fips).addBreakdown(
        props.breakdownVar,
        props.breakdownVar === "race_and_ethnicity"
        ? exclude(NON_HISPANIC, ALL)
        : exclude(ALL)
    )
  */
  const breakdowns = Breakdowns.forFips(props.fips).addBreakdown(
    props.breakdownVar,
    props.breakdownVar === "race_and_ethnicity"
      ? exclude(NON_HISPANIC)
      : undefined
  );

  let metricConfigs: Record<string, MetricConfig> = {};
  metrics.forEach((metricConfig) => {
    // We prefer to show the known breakdown metric over the vanilla metric, if
    // it is available.
    if (metricConfig.knownBreakdownComparisonMetric) {
      metricConfigs[metricConfig.knownBreakdownComparisonMetric.metricId] =
        metricConfig.knownBreakdownComparisonMetric;
    } else {
      metricConfigs[metricConfig.metricId] = metricConfig;
    }

    if (metricConfig.populationComparisonMetric) {
      metricConfigs[metricConfig.populationComparisonMetric.metricId] =
        metricConfig.populationComparisonMetric;
    }
  });
  const metricIds = Object.keys(metricConfigs);
  const query = new MetricQuery(metricIds as MetricId[], breakdowns);

  const displayingCovidData = metrics
    .map((config) => config.metricId)
    .some((metricId) => metricId.includes("covid"));

  return (
    <CardWrapper
      queries={[query]}
      title={
        <>{`${props.variableConfig.variableFullDisplayName} By ${
          BREAKDOWN_VAR_DISPLAY_NAMES[props.breakdownVar]
        } In ${props.fips.getFullDisplayName()}`}</>
      }
    >
      {([queryResponse]) => {
        const dataWithoutUnknowns = queryResponse.data.filter(
          (row: Row) =>
            row[props.breakdownVar] !== UNKNOWN &&
            row[props.breakdownVar] !== UNKNOWN_RACE
        );

        return (
          <>
            {queryResponse.shouldShowMissingDataMessage(metricIds) && (
              <CardContent>
                <MissingDataAlert
                  dataName={props.variableConfig.variableFullDisplayName + " "}
                  breakdownString={
                    BREAKDOWN_VAR_DISPLAY_NAMES[props.breakdownVar]
                  }
                  geoLevel={props.fips.getFipsTypeDisplayName()}
                />
              </CardContent>
            )}
            {!queryResponse.dataIsMissing() &&
              displayingCovidData &&
              props.breakdownVar === RACE && (
                <>
                  <CardContent>
                    <Alert severity="warning">
                      Share of COVID-19 cases reported for American Indian,
                      Alaska Native, Native Hawaiian and Pacific Islander are
                      underrepresented at the national level and in many states
                      because these racial categories are often not recorded.
                      The Urban Indian Health Institute publishes{" "}
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://www.uihi.org/resources/best-practices-for-american-indian-and-alaska-native-data-collection/"
                      >
                        guidelines for American Indian and Alaska Native Data
                        Collection
                      </a>
                      .
                    </Alert>
                  </CardContent>
                  <Divider />
                </>
              )}
            {!queryResponse.dataIsMissing() && (
              <TableChart
                data={dataWithoutUnknowns}
                breakdownVar={props.breakdownVar}
                metrics={Object.values(metricConfigs)}
              />
            )}
          </>
        );
      }}
    </CardWrapper>
  );
}
