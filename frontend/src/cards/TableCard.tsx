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
  COVID_VAXX,
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
  VOTER_AGE_BUCKETS,
  AGE_BUCKETS,
  ASIAN_NH,
  NHPI_NH,
  API_NH,
} from "../data/utils/Constants";
import { Row } from "../data/utils/DatasetTypes";
import MissingDataAlert from "./ui/MissingDataAlert";
import Alert from "@material-ui/lab/Alert";
import Divider from "@material-ui/core/Divider";
import {
  UHC_API_NH_DETERMINANTS,
  UHC_DECADE_PLUS_5_AGE_DETERMINANTS,
  UHC_DETERMINANTS,
  UHC_VOTER_AGE_DETERMINANTS,
} from "../data/variables/BrfssProvider";
import { urlMap } from "../utils/externalUrls";
import { shouldShowAltPopCompare } from "../data/utils/datasetutils";
import styles from "./Card.module.scss";

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
  METRIC_CONFIG.vaccinations[0]?.metrics?.pct_share
    ?.secondaryPopulationComparisonMetric,
];

export function TableCard(props: TableCardProps) {
  const metrics = getPer100kAndPctShareMetrics(props.variableConfig);
  const current100k = props.variableConfig.metrics.per100k.metricId;

  // choose demographic groups to exclude from the table
  let exclusionList = [ALL];

  // across all variables
  if (props.breakdownVar === "race_and_ethnicity") {
    exclusionList.push(NON_HISPANIC);
  }

  // only for UHC variables
  const ALL_UHC_DETERMINANTS = [
    ...UHC_DECADE_PLUS_5_AGE_DETERMINANTS,
    ...UHC_VOTER_AGE_DETERMINANTS,
    ...UHC_DETERMINANTS,
  ];
  if (
    ALL_UHC_DETERMINANTS.includes(current100k) &&
    props.breakdownVar === "race_and_ethnicity"
  ) {
    UHC_API_NH_DETERMINANTS.includes(current100k)
      ? exclusionList.push(ASIAN_NH, NHPI_NH)
      : exclusionList.push(API_NH);
  } else if (
    ALL_UHC_DETERMINANTS.includes(current100k) &&
    props.breakdownVar === "age"
  ) {
    // get correct age buckets for this determinant
    let determinantBuckets: any[] = [];
    if (UHC_DECADE_PLUS_5_AGE_DETERMINANTS.includes(current100k))
      determinantBuckets.push(...DECADE_PLUS_5_AGE_BUCKETS);
    else if (UHC_VOTER_AGE_DETERMINANTS.includes(current100k))
      determinantBuckets.push(...VOTER_AGE_BUCKETS);
    else if (UHC_DETERMINANTS.includes(current100k))
      determinantBuckets.push(...BROAD_AGE_BUCKETS);

    // remove all of the other age groups
    const irrelevantAgeBuckets = AGE_BUCKETS.filter(
      (bucket) => !determinantBuckets.includes(bucket)
    );
    exclusionList.push(...irrelevantAgeBuckets);
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
        let dataWithoutUnknowns = queryResponse.data.filter(
          (row: Row) =>
            row[props.breakdownVar] !== UNKNOWN &&
            row[props.breakdownVar] !== UNKNOWN_RACE &&
            row[props.breakdownVar] !== UNKNOWN_ETHNICITY
        );

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
                  noDemographicInfo={
                    props.variableConfig.variableId === COVID_VAXX &&
                    props.fips.isCounty()
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
