import React from "react";
import Alert from "@material-ui/lab/Alert";
import { DisparityBarChart } from "../charts/DisparityBarChart";
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
  UNKNOWN_ETHNICITY,
  RACE,
  HISPANIC,
} from "../data/utils/Constants";
import { Row } from "../data/utils/DatasetTypes";
import UnknownsAlert from "./ui/UnknownsAlert";
import { shouldShowAltPopCompare } from "../data/utils/datasetutils";
import { CAWP_DETERMINANTS } from "../data/variables/CawpProvider";
import { useGuessPreloadHeight } from "../utils/hooks/useGuessPreloadHeight";

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
  const preloadHeight = useGuessPreloadHeight(
    [700, 1000],
    props.breakdownVar === "sex"
  );

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
  if (metricConfig.secondaryPopulationComparisonMetric) {
    metricIds.push(metricConfig.secondaryPopulationComparisonMetric.metricId);
  }

  const query = new MetricQuery(metricIds, breakdowns);

  function getTitleText() {
    return `Population vs. ${
      metricConfig.fullCardTitleName
    } in ${props.fips.getSentenceDisplayName()}`;
  }
  function CardTitle() {
    return <>{getTitleText()}</>;
  }

  return (
    <CardWrapper
      queries={[query]}
      title={<CardTitle />}
      minHeight={preloadHeight}
    >
      {([queryResponse]) => {
        const dataWithoutUnknowns = queryResponse
          .getValidRowsForField(metricConfig.metricId)
          .filter(
            (row: Row) =>
              row[props.breakdownVar] !== UNKNOWN &&
              row[props.breakdownVar] !== UNKNOWN_RACE &&
              row[props.breakdownVar] !== UNKNOWN_ETHNICITY
          );

        // include a note about percents adding to over 100%
        // if race options include hispanic twice (eg "White" and "Hispanic" can both include Hispanic people)
        // also require at least some data to be available to avoid showing info on suppressed/undefined states
        const shouldShowDoesntAddUpMessage =
          props.breakdownVar === RACE &&
          queryResponse.data.every(
            (row) =>
              !row[props.breakdownVar].includes("(NH)") ||
              row[props.breakdownVar] === HISPANIC
          ) &&
          queryResponse.data.some((row) => row[metricConfig.metricId]);

        const isCawp = CAWP_DETERMINANTS.includes(metricConfig.metricId);

        const dataAvailable =
          dataWithoutUnknowns.length > 0 &&
          !queryResponse.shouldShowMissingDataMessage([metricConfig.metricId]);

        return (
          <>
            {/* Display either UnknownsAlert OR MissingDataAlert */}
            {dataAvailable ? (
              <UnknownsAlert
                metricConfig={metricConfig}
                queryResponse={queryResponse}
                breakdownVar={props.breakdownVar}
                displayType="chart"
                known={true}
                overrideAndWithOr={props.breakdownVar === RACE}
                fips={props.fips}
              />
            ) : (
              <CardContent>
                <MissingDataAlert
                  dataName={metricConfig.fullCardTitleName}
                  breakdownString={
                    BREAKDOWN_VAR_DISPLAY_NAMES[props.breakdownVar]
                  }
                  fips={props.fips}
                />
              </CardContent>
            )}
            {dataAvailable && dataWithoutUnknowns.length !== 0 && (
              <>
                <CardContent>
                  <DisparityBarChart
                    data={dataWithoutUnknowns}
                    lightMetric={metricConfig.populationComparisonMetric!}
                    darkMetric={
                      metricConfig.knownBreakdownComparisonMetric ||
                      metricConfig
                    }
                    breakdownVar={props.breakdownVar}
                    metricDisplayName={metricConfig.shortLabel}
                    filename={getTitleText()}
                    showAltPopCompare={shouldShowAltPopCompare(props)}
                  />
                </CardContent>{" "}
              </>
            )}
            {shouldShowDoesntAddUpMessage && !isCawp && (
              <Alert severity="info" role="note">
                Population percentages on this graph add up to over 100% because
                the racial categories reported for{" "}
                {metricConfig.fullCardTitleName} in{" "}
                {props.fips.getSentenceDisplayName()} include Hispanic
                individuals in each racial category. As a result, Hispanic
                individuals are counted twice.
              </Alert>
            )}
            {isCawp && (
              <Alert severity="info" role="note">
                Percentages reported for{" "}
                {props.variableConfig.variableDisplayName} cannot be summed, as
                these racial categories are not mutually exclusive. Individuals
                who identify with multiple specific races (e.g. both "White" and
                "Black") are represented multiple times in the visualization:
                across each corresponding category, and also as "Two or more
                races & Unrepresented race".
              </Alert>
            )}
          </>
        );
      }}
    </CardWrapper>
  );
}
