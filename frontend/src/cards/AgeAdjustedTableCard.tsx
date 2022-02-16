import React from "react";
import { AgeAdjustedTableChart } from "../charts/AgeAdjustedTableChart";
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
  UNKNOWN_ETHNICITY,
  ALL,
  BROAD_AGE_BUCKETS,
  DECADE_PLUS_5_AGE_BUCKETS,
} from "../data/utils/Constants";
import { Row } from "../data/utils/DatasetTypes";
import MissingDataAlert from "./ui/MissingDataAlert";
import Alert from "@material-ui/lab/Alert";
import Divider from "@material-ui/core/Divider";
import {
  UHC_BROAD_AGE_DETERMINANTS,
  UHC_DECADE_PLUS_5_AGE_DETERMINANTS,
} from "../data/variables/BrfssProvider";
import { urlMap } from "../utils/externalUrls";
import styles from "./Card.module.scss";

/* minimize layout shift */
const PRELOAD_HEIGHT = 298;

export interface AgeAdjustedTableCardProps {
  fips: Fips;
  breakdownVar: BreakdownVar;
  variableConfig: VariableConfig;
}

export function AgeAdjustedTableCard(props: AgeAdjustedTableCardProps) {
  const metrics = getPer100kAndPctShareMetrics(props.variableConfig);
  const current100k = props.variableConfig.metrics.per100k.metricId;

  // choose demographic groups to exclude from the table
  let exclusionList = [ALL];
  props.breakdownVar === "race_and_ethnicity" &&
    exclusionList.push(NON_HISPANIC);
  UHC_BROAD_AGE_DETERMINANTS.includes(current100k) &&
    exclusionList.push(...DECADE_PLUS_5_AGE_BUCKETS);
  UHC_DECADE_PLUS_5_AGE_DETERMINANTS.includes(current100k) &&
    exclusionList.push(...BROAD_AGE_BUCKETS);

  const breakdowns = Breakdowns.forFips(props.fips).addBreakdown(
    props.breakdownVar,
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
        <>{`Age-Adjusted ${
          props.variableConfig.variableFullDisplayName
        } Ratios By ${
          BREAKDOWN_VAR_DISPLAY_NAMES[props.breakdownVar]
        } in ${props.fips.getFullDisplayName()}`}</>
      }
    >
      {([queryResponse]) => {
        let dataWithoutUnknowns = queryResponse.data.filter(
          (row: Row) =>
            row[props.breakdownVar] !== UNKNOWN &&
            row[props.breakdownVar] !== UNKNOWN_RACE &&
            row[props.breakdownVar] !== UNKNOWN_ETHNICITY
        );

        return (
          <>
            {queryResponse.shouldShowMissingDataMessage(
              metricIds as MetricId[]
            ) && (
              <CardContent>
                <MissingDataAlert
                  dataName={props.variableConfig.variableFullDisplayName + " "}
                  breakdownString={
                    BREAKDOWN_VAR_DISPLAY_NAMES[props.breakdownVar]
                  }
                  fips={props.fips}
                />
              </CardContent>
            )}
            {!queryResponse.dataIsMissing() &&
              displayingCovidData &&
              props.breakdownVar === RACE && (
                <>
                  <CardContent>
                    <Alert severity="warning" role="note">
                      Share of COVID-19 cases reported for American Indian,
                      Alaska Native, Native Hawaiian and Pacific Islander are
                      underrepresented at the national level and in many states
                      because these racial categories are often not recorded.
                      The Urban Indian Health Institute publishes{" "}
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
                  breakdownVar={props.breakdownVar}
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
