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
  getAgeAdjustedRatioMetric,
  DropdownVarId,
  METRIC_CONFIG,
  AgeAdjustedVariableId,
} from "../data/config/MetricConfig";
import { exclude } from "../data/query/BreakdownFilter";
import {
  NON_HISPANIC,
  RACE,
  ALL,
  WHITE_NH,
  MULTI_OR_OTHER_STANDARD_NH,
  AGE,
  SEX,
} from "../data/utils/Constants";
import Alert from "@material-ui/lab/Alert";
import Divider from "@material-ui/core/Divider";
import styles from "./Card.module.scss";
import MissingDataAlert from "./ui/MissingDataAlert";
import {
  AGE_ADJUSTMENT_TAB_LINK,
  COVID_DEATHS_US_SETTING,
  COVID_HOSP_US_SETTING,
} from "../utils/internalRoutes";
import UnknownsAlert from "./ui/UnknownsAlert";
import { Link } from "react-router-dom";
import { splitIntoKnownsAndUnknowns } from "../data/utils/datasetutils";
import { reportProviderSteps } from "../reports/ReportProviderSteps";
import { ScrollableHashId } from "../utils/hooks/useStepObserver";
import { useCreateChartTitle } from "../utils/hooks/useCreateChartTitle";

// when alternate data types are available, provide a link to the national level, by race report for that data type

export const dataTypeLinkMap: Record<AgeAdjustedVariableId, string> = {
  covid_deaths: COVID_DEATHS_US_SETTING,
  covid_hospitalizations: COVID_HOSP_US_SETTING,
};

/* minimize layout shift */
const PRELOAD_HEIGHT = 600;

// choose demographic groups to exclude from the table
const exclusionList = [ALL, NON_HISPANIC, WHITE_NH, MULTI_OR_OTHER_STANDARD_NH];

export interface AgeAdjustedTableCardProps {
  fips: Fips;
  variableConfig: VariableConfig;
  breakdownVar: BreakdownVar;
  dropdownVarId?: DropdownVarId;
  setVariableConfigWithParam?: Function;
}

export function AgeAdjustedTableCard(props: AgeAdjustedTableCardProps) {
  const metrics = getAgeAdjustedRatioMetric(props.variableConfig);
  const metricConfigPctShare = props.variableConfig.metrics["pct_share"];

  const raceBreakdowns = Breakdowns.forFips(props.fips).addBreakdown(
    RACE,
    exclude(...exclusionList)
  );

  const ageBreakdowns = Breakdowns.forFips(props.fips).addBreakdown(
    AGE,
    exclude(...exclusionList)
  );

  let metricConfigs: Record<string, MetricConfig> = {};
  metrics.forEach((metricConfig) => {
    metricConfigs[metricConfig.metricId] = metricConfig;
  });

  const metricIds = Object.keys(metricConfigs) as MetricId[];
  const raceQuery = new MetricQuery(metricIds as MetricId[], raceBreakdowns);
  const ageQuery = new MetricQuery(metricIds as MetricId[], ageBreakdowns);
  const ratioId = metricIds[0];
  const metricIdsForRatiosOnly = Object.values(metricConfigs).filter((config) =>
    config.metricId.includes("ratio")
  );

  const locationName = props.fips.getSentenceDisplayName();
  let chartTitle = useCreateChartTitle(metricConfigs[ratioId], locationName);

  // We have to do this here because vega automatically
  // splits the titles onto each line, but here, as we are
  // not using vega we need to do it ourselves.
  if (Array.isArray(chartTitle)) {
    chartTitle = chartTitle.join("\r\n");
  }

  // collect data types from the currently selected condition that offer age-adjusted ratios
  const ageAdjustedDataTypes: VariableConfig[] = METRIC_CONFIG[
    props.dropdownVarId!
  ].filter((dataType) => {
    // TODO: once every data type has a unique variableId across all topics, we can simply check if that id is in the dataTypeLinkMap
    return dataType?.metrics["age_adjusted_ratio"]?.ageAdjusted;
  });

  const HASH_ID: ScrollableHashId = "age-adjusted-risk";

  return (
    <CardWrapper
      isAgeAdjustedTable={true}
      minHeight={PRELOAD_HEIGHT}
      queries={[raceQuery, ageQuery]}
      title={<>{reportProviderSteps[HASH_ID].label}</>}
      scrollToHash={HASH_ID}
    >
      {([raceQueryResponse, ageQueryResponse]) => {
        const [knownRaceData] = splitIntoKnownsAndUnknowns(
          raceQueryResponse.data,
          RACE
        );

        const isWrongBreakdownVar = props.breakdownVar === SEX;
        const noRatios = knownRaceData.every(
          (row) => row[ratioId] === undefined
        );

        return (
          <>
            <CardContent>
              {/* Always show info on what age-adj is */}
              <Alert severity="info" role="note">
                Age Adjustment is a statistical process applied to rates of
                disease, death, or other health outcomes that occur more
                frequently among different age groups. Adjusting for age allows
                for fairer comparison between populations, where age is a large
                risk factor. By computing rates that are normalized for age, we
                can paint a more accurate picture of undue burden of disease and
                death between populations. More details can be found in our{" "}
                <Link to={AGE_ADJUSTMENT_TAB_LINK}>
                  age-adjustment methodology
                </Link>
                .
              </Alert>
            </CardContent>
            <Divider />

            <UnknownsAlert
              metricConfig={metricConfigPctShare}
              queryResponse={raceQueryResponse}
              breakdownVar={
                props.breakdownVar === AGE || props.breakdownVar === RACE
                  ? RACE
                  : props.breakdownVar
              }
              ageQueryResponse={ageQueryResponse}
              displayType="table"
              known={true}
              overrideAndWithOr={props.breakdownVar === RACE}
              fips={props.fips}
            />

            {/* If TABLE can't display for any of these various reasons, show the missing data alert */}
            {(noRatios ||
              isWrongBreakdownVar ||
              raceQueryResponse.dataIsMissing() ||
              raceQueryResponse.shouldShowMissingDataMessage(
                metricIds as MetricId[]
              )) && (
              <CardContent>
                <MissingDataAlert
                  dataName={metrics[0].fullCardTitleName}
                  breakdownString={
                    BREAKDOWN_VAR_DISPLAY_NAMES[props.breakdownVar]
                  }
                  dropdownVarId={props.dropdownVarId}
                  ageAdjustedDataTypes={ageAdjustedDataTypes}
                  fips={props.fips}
                />
              </CardContent>
            )}

            {/* values are present or partially null, implying we have at least some age-adjustments */}
            {!raceQueryResponse.dataIsMissing() &&
              !noRatios &&
              props.breakdownVar !== SEX && (
                <div className={styles.TableChart}>
                  <AgeAdjustedTableChart
                    data={knownRaceData}
                    metrics={metricIdsForRatiosOnly}
                    title={chartTitle}
                  />
                </div>
              )}
          </>
        );
      }}
    </CardWrapper>
  );
}
