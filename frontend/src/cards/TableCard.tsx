import React, { useEffect } from "react";

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
} from "../data/config/MetricConfig";
import { exclude } from "../data/query/BreakdownFilter";
import { ALL, RACE } from "../data/utils/Constants";
import MissingDataAlert from "./ui/MissingDataAlert";
import Alert from "@material-ui/lab/Alert";
import Divider from "@material-ui/core/Divider";
import { urlMap } from "../utils/externalUrls";
import {
  getExclusionList,
  shouldShowAltPopCompare,
} from "../data/utils/datasetutils";
import styles from "./Card.module.scss";
import { INCARCERATION_IDS } from "../data/variables/IncarcerationProvider";
import IncarceratedChildrenShortAlert from "./ui/IncarceratedChildrenShortAlert";
import { Row } from "../data/utils/DatasetTypes";
import { useInView } from "react-intersection-observer";
import { steps } from "../pages/ExploreData/CardsStepper";

/* minimize layout shift */
const PRELOAD_HEIGHT = 698;

// We need to get this property, but we want to show it as
// part of the "population_pct" column, and not as its own column
export const NEVER_SHOW_PROPERTIES = [
  METRIC_CONFIG.covid_vaccinations[0]?.metrics?.pct_share
    ?.secondaryPopulationComparisonMetric,
];

export interface TableCardProps {
  fips: Fips;
  breakdownVar: BreakdownVar;
  variableConfig: VariableConfig;
  setActiveStep?: React.Dispatch<React.SetStateAction<number>>;
  cardsInView?: string[];
  setCardsInView?: React.Dispatch<React.SetStateAction<string[]>>;
}

export function TableCard(props: TableCardProps) {
  const { ref, inView } = useInView({ threshold: 0.66 });

  // console.log("map", { ref }, { inView }, { entry });

  useEffect(() => {
    if (props.cardsInView !== undefined && props.setCardsInView !== undefined) {
      let _cardsInView = [...props.cardsInView];

      if (inView && !_cardsInView.includes("table")) _cardsInView.push("table");
      else if (!inView && _cardsInView.includes("table"))
        _cardsInView = _cardsInView.filter((id) => id !== "table");

      const middle = Math.floor(_cardsInView.length / 2);
      console.log({ middle });
      props.setCardsInView(_cardsInView);
      props.setActiveStep?.(
        steps.findIndex((step) => step.hashId === _cardsInView[middle])
      );
    }
  }, [inView]);

  const metrics = getPer100kAndPctShareMetrics(props.variableConfig);

  const breakdowns = Breakdowns.forFips(props.fips).addBreakdown(
    props.breakdownVar,
    exclude(
      ...(getExclusionList(
        props.variableConfig,
        props.breakdownVar,
        props.fips
      ) as string[])
    )
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
  const isIncarceration = INCARCERATION_IDS.includes(
    props.variableConfig.variableId
  );

  const metricIds = Object.keys(metricConfigs) as MetricId[];
  isIncarceration && metricIds.push("total_confined_children");
  const query = new MetricQuery(metricIds as MetricId[], breakdowns);

  const displayingCovidData = metrics
    .map((config) => config.metricId)
    .some((metricId) => metricId.includes("covid"));

  return (
    <div ref={ref}>
      <CardWrapper
        minHeight={PRELOAD_HEIGHT}
        queries={[query]}
        title={
          <>{`${props.variableConfig.variableFullDisplayName} By ${
            BREAKDOWN_VAR_DISPLAY_NAMES[props.breakdownVar]
          } In ${props.fips.getSentenceDisplayName()}`}</>
        }
      >
        {([queryResponse]) => {
          let data = queryResponse.data;
          if (shouldShowAltPopCompare(props)) data = fillInAltPops(data);
          let normalMetricIds = metricIds;

          // revert metric ids to normal data structure, and revert "displayed" rows to exclude ALLs
          if (isIncarceration) {
            normalMetricIds = metricIds.filter(
              (id) => id !== "total_confined_children"
            );
            data = data.filter((row: Row) => row[props.breakdownVar] !== ALL);
          }

          const showMissingDataAlert =
            queryResponse.shouldShowMissingDataMessage(normalMetricIds) ||
            data.length <= 0;

          return (
            <>
              {isIncarceration && (
                <IncarceratedChildrenShortAlert
                  fips={props.fips}
                  queryResponse={queryResponse}
                  breakdownVar={props.breakdownVar}
                />
              )}

              {showMissingDataAlert && (
                <CardContent>
                  <MissingDataAlert
                    dataName={
                      props.variableConfig.variableFullDisplayName + " "
                    }
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
                        underrepresented at the national level and in many
                        states because these racial categories are often not
                        recorded. The Urban Indian Health Institute publishes{" "}
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

              {!queryResponse.dataIsMissing() && data.length > 0 && (
                <div className={styles.TableChart}>
                  <TableChart
                    data={data}
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
    </div>
  );
}

function fillInAltPops(data: any[]) {
  // This should only happen in the vaccine kff state case
  return data.map((item) => {
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
