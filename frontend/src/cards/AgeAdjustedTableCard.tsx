import React from "react";
import { AgeAdjustedTableChart } from "../charts/AgeAdjustedTableChart";
import CardWrapper from "./CardWrapper";
import { MetricQuery } from "../data/query/MetricQuery";
import { Fips } from "../data/utils/Fips";
import {
  Breakdowns,
  BREAKDOWN_VAR_DISPLAY_NAMES,
} from "../data/query/Breakdowns";
import { CardContent } from "@material-ui/core";
import {
  MetricConfig,
  MetricId,
  VariableConfig,
  getAgeAdjustedRatioMetric,
} from "../data/config/MetricConfig";
import { exclude } from "../data/query/BreakdownFilter";
import {
  NON_HISPANIC,
  RACE,
  UNKNOWN,
  UNKNOWN_RACE,
  UNKNOWN_ETHNICITY,
  ALL,
} from "../data/utils/Constants";
import { Row } from "../data/utils/DatasetTypes";
import MissingDataAlert from "./ui/MissingDataAlert";
import Alert from "@material-ui/lab/Alert";
import Divider from "@material-ui/core/Divider";
import { urlMap } from "../utils/externalUrls";
import styles from "./Card.module.scss";

/* minimize layout shift */
const PRELOAD_HEIGHT = 298;

export interface AgeAdjustedTableCardProps {
  fips: Fips;
  variableConfig: VariableConfig;
}

export function AgeAdjustedTableCard(props: AgeAdjustedTableCardProps) {
  // const metrics = getPer100kAndPctShareMetrics(props.variableConfig);
  const metrics = getAgeAdjustedRatioMetric(props.variableConfig);

  // choose demographic groups to exclude from the table
  const exclusionList = [ALL, NON_HISPANIC];

  const breakdowns = Breakdowns.forFips(props.fips).addBreakdown(
    RACE,
    exclude(...exclusionList)
  );

  let metricConfigs: Record<string, MetricConfig> = {};
  metrics.forEach((metricConfig) => {
    // We prefer known breakdown metric if available.
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

    if (metricConfig.secondaryPopulationComparisonMetric) {
      metricConfigs[metricConfig.secondaryPopulationComparisonMetric.metricId] =
        metricConfig.secondaryPopulationComparisonMetric;
    }
  });
  const metricIds = Object.keys(metricConfigs) as MetricId[];
  const query = new MetricQuery(metricIds as MetricId[], breakdowns);

  const displayingCovidData = metrics
    .map((config) => config.metricId)
    .some((metricId) => metricId.includes("covid"));

  return (
    <CardWrapper
      minHeight={PRELOAD_HEIGHT}
      queries={[query]}
      title={
        <>{`Age-Adjusted Ratios for ${
          props.variableConfig.variableFullDisplayName
        } in ${props.fips.getFullDisplayName()}`}</>
      }
    >
      {([queryResponse]) => {
        let dataWithoutUnknowns = queryResponse.data.filter(
          (row: Row) =>
            row[RACE] !== UNKNOWN &&
            row[RACE] !== UNKNOWN_RACE &&
            row[RACE] !== UNKNOWN_ETHNICITY
        );

        return (
          <>
            {queryResponse.shouldShowMissingDataMessage(
              metricIds as MetricId[]
            ) && (
              <CardContent>
                <MissingDataAlert
                  dataName={props.variableConfig.variableFullDisplayName + " "}
                  breakdownString={BREAKDOWN_VAR_DISPLAY_NAMES[RACE]}
                  fips={props.fips}
                />
              </CardContent>
            )}
            {!queryResponse.dataIsMissing() && displayingCovidData && (
              <>
                <CardContent>
                  <Alert severity="warning" role="note">
                    Share of COVID-19 cases reported for American Indian, Alaska
                    Native, Native Hawaiian and Pacific Islander are
                    underrepresented at the national level and in many states
                    because these racial categories are often not recorded. The
                    Urban Indian Health Institute publishes{" "}
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={urlMap.uihiBestPractice}
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
              <div className={styles.TableChart}>
                <AgeAdjustedTableChart
                  data={dataWithoutUnknowns}
                  metrics={Object.values(metricConfigs)}
                />
              </div>
            )}
          </>
        );
      }}
    </CardWrapper>
  );
}
