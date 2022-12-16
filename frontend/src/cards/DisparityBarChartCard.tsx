import React from "react";
import Alert from "@material-ui/lab/Alert";
import { DisparityBarChart } from "../charts/disparityBarChart/Index";
import { CardContent } from "@material-ui/core";
import { Fips } from "../data/utils/Fips";
import {
  Breakdowns,
  BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE,
} from "../data/query/Breakdowns";
import { MetricQuery } from "../data/query/MetricQuery";
import { MetricConfig, VariableConfig } from "../data/config/MetricConfig";
import CardWrapper from "./CardWrapper";
import MissingDataAlert from "./ui/MissingDataAlert";
import { exclude } from "../data/query/BreakdownFilter";
import { NON_HISPANIC, ALL, RACE, HISPANIC } from "../data/utils/Constants";
import UnknownsAlert from "./ui/UnknownsAlert";
import {
  shouldShowAltPopCompare,
  splitIntoKnownsAndUnknowns,
} from "../data/utils/datasetutils";
import { CAWP_DETERMINANTS } from "../data/variables/CawpProvider";
import { useGuessPreloadHeight } from "../utils/hooks/useGuessPreloadHeight";
import { reportProviderSteps } from "../reports/ReportProviderSteps";
import { ScrollableHashId } from "../utils/hooks/useStepObserver";
import { useCreateChartTitle } from "../utils/hooks/useCreateChartTitle";
import CAWPOverlappingRacesAlert from "./ui/CAWPOverlappingRacesAlert";

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
  const locationPhrase = `in ${props.fips.getSentenceDisplayName()}`;

  const isCawpCongress =
    props.variableConfig.variableId === "women_us_congress";

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

  const query = new MetricQuery(
    metricIds,
    breakdowns,
    /* variableId */ props.variableConfig.variableId,
    /* timeView */ isCawpCongress ? "cross_sectional" : undefined
  );

  const { chartTitle, filename } = useCreateChartTitle(
    metricConfig.populationComparisonMetric as MetricConfig,
    locationPhrase
  );

  const HASH_ID: ScrollableHashId = "population-vs-distribution";

  return (
    <CardWrapper
      queries={[query]}
      title={<>{reportProviderSteps[HASH_ID].label}</>}
      scrollToHash={HASH_ID}
      minHeight={preloadHeight}
    >
      {([queryResponse]) => {
        const validData = queryResponse.getValidRowsForField(
          metricConfig.metricId
        );

        const [knownData] = splitIntoKnownsAndUnknowns(
          validData,
          props.breakdownVar
        );

        const isCawp = CAWP_DETERMINANTS.includes(metricConfig.metricId);

        // include a note about percents adding to over 100%
        // if race options include hispanic twice (eg "White" and "Hispanic" can both include Hispanic people)
        // also require at least some data to be available to avoid showing info on suppressed/undefined states
        const shouldShowDoesntAddUpMessage =
          !isCawp &&
          props.breakdownVar === RACE &&
          queryResponse.data.every(
            (row) =>
              !row[props.breakdownVar].includes("(NH)") ||
              row[props.breakdownVar] === HISPANIC
          ) &&
          queryResponse.data.some((row) => row[metricConfig.metricId]);

        const dataAvailable =
          knownData.length > 0 &&
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
                  dataName={metricConfig.chartTitleLines.join(" ")}
                  breakdownString={
                    BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[props.breakdownVar]
                  }
                  fips={props.fips}
                />
              </CardContent>
            )}
            {dataAvailable && knownData.length !== 0 && (
              <CardContent>
                <DisparityBarChart
                  chartTitle={chartTitle}
                  data={knownData}
                  lightMetric={metricConfig.populationComparisonMetric!}
                  darkMetric={
                    metricConfig.knownBreakdownComparisonMetric || metricConfig
                  }
                  breakdownVar={props.breakdownVar}
                  metricDisplayName={metricConfig.shortLabel}
                  filename={filename}
                  showAltPopCompare={shouldShowAltPopCompare(props)}
                />
              </CardContent>
            )}
            {shouldShowDoesntAddUpMessage && (
              <CardContent>
                <Alert severity="info" role="note">
                  Population percentages on this graph add up to over 100%
                  because the racial categories reported for{" "}
                  {metricConfig.chartTitleLines.join(" ")} in{" "}
                  {props.fips.getSentenceDisplayName()} include Hispanic
                  individuals in each racial category. As a result, Hispanic
                  individuals are counted twice.
                </Alert>
              </CardContent>
            )}
            {isCawp && (
              <CAWPOverlappingRacesAlert
                variableConfig={props.variableConfig}
              />
            )}
          </>
        );
      }}
    </CardWrapper>
  );
}
