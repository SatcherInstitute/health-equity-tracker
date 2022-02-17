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
    metricConfigs[metricConfig.metricId] = metricConfig;
  });

  const metricIds = Object.keys(metricConfigs) as MetricId[];
  const query = new MetricQuery(metricIds as MetricId[], breakdowns);

  return (
    <CardWrapper
      minHeight={PRELOAD_HEIGHT}
      queries={[query]}
      title={
        <>
          {`
      ${props.variableConfig.metrics.age_adjusted_ratio.fullCardTitleName}
         in ${props.fips.getFullDisplayName()}`}
        </>
      }
    >
      {([queryResponse]) => {
        let dataWithoutUnknowns = queryResponse.data.filter((row: Row) => {
          return (
            row[RACE] !== UNKNOWN &&
            row[RACE] !== UNKNOWN_RACE &&
            row[RACE] !== UNKNOWN_ETHNICITY
          );
        });

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
            {!queryResponse.dataIsMissing() && (
              <>
                <CardContent>
                  <Alert severity="info" role="note">
                    Age-adjustment is a technique to remove the effect of
                    differences in the underlying age distribution of two
                    populations (in our case, racial groups compared to White,
                    Non-Hispanic individuals) when comparing rates of incidence.
                    This is extremely important for conditions where age is a
                    large risk factor, e.g. the risk of dying with Covid
                    increases non-linearly with age. Age-adjustment allows us to
                    compute rates that are normalized for age, painting a more
                    accurate picture of health inequities.{" "}
                    <a href="https://healthequitytracker.org">
                      Learn how we calculated these age-adjusted ratios
                    </a>
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
