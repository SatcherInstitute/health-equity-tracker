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
  METRIC_CONFIG,
  MetricConfig,
  MetricId,
  VariableConfig,
  getPer100kAndPctShareMetrics,
  VariableId,
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
import { shouldShowAltPopCompare } from "../data/utils/datasetutils";
import styles from "./Card.module.scss";

const showAllGroupIds: VariableId[] = [
  "women_state_legislatures",
  "women_us_congress",
];

/* minimize layout shift */
const PRELOAD_HEIGHT = 698;

export interface TableCardProps {
  fips: Fips;
  breakdownVar: BreakdownVar;
  variableConfig: VariableConfig;
}

// We need to get this property, but we want to show it as
// part of the "population_pct" column, and not as its own column
export const NEVER_SHOW_PROPERTIES = [
  METRIC_CONFIG.covid_vaccinations[0]?.metrics?.pct_share
    ?.secondaryPopulationComparisonMetric,
];

export function TableCard(props: TableCardProps) {
  const metrics = getPer100kAndPctShareMetrics(props.variableConfig);

  // choose demographic groups to exclude from the table
  let exclusionList = [];

  if (!showAllGroupIds.includes(props.variableConfig.variableId)) {
    exclusionList.push(ALL);
  }

  // across all variables
  if (props.breakdownVar === "race_and_ethnicity") {
    exclusionList.push(NON_HISPANIC);
  }

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

  // on TABLE card, show a full set of demographic groups/buckets even if some are missing incidence data to ensure rendering of comparison population data.
  const buckets = props.variableConfig.buckets?.[props.breakdownVar] ?? [];

  return (
    <CardWrapper
      minHeight={PRELOAD_HEIGHT}
      queries={[query]}
      title={
        <>{`${props.variableConfig.variableFullDisplayName} By ${
          BREAKDOWN_VAR_DISPLAY_NAMES[props.breakdownVar]
        } In ${props.fips.getFullDisplayName()}`}</>
      }
    >
      {([queryResponse]) => {
        let dataWithoutUnknowns = queryResponse.data.filter((row: Row) => {
          return (
            row[props.breakdownVar] !== UNKNOWN &&
            row[props.breakdownVar] !== UNKNOWN_RACE &&
            row[props.breakdownVar] !== UNKNOWN_ETHNICITY &&
            buckets.includes(row[props.breakdownVar])
          );
        });

        if (shouldShowAltPopCompare(props)) {
          // This should only happen in the vaccine kff state case
          dataWithoutUnknowns = dataWithoutUnknowns.map((item) => {
            const {
              vaccine_population_pct,
              acs_vaccine_population_pct,
              ...restOfItem
            } = item;
            return {
              vaccine_population_pct:
                vaccine_population_pct || acs_vaccine_population_pct,
              ...restOfItem,
            };
          });
        }

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
                <TableChart
                  data={dataWithoutUnknowns}
                  breakdownVar={props.breakdownVar}
                  metrics={Object.values(metricConfigs).filter(
                    (colName) => !NEVER_SHOW_PROPERTIES.includes(colName)
                  )}
                />
              </div>
            )}
          </>
        );
      }}
    </CardWrapper>
  );
}
