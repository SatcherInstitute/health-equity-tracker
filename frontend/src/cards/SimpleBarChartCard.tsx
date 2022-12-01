import React from "react";
import { SimpleHorizontalBarChart } from "../charts/SimpleHorizontalBarChart";
import { CardContent } from "@material-ui/core";
import { Fips } from "../data/utils/Fips";
import {
  Breakdowns,
  BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES,
  BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE,
} from "../data/query/Breakdowns";
import { MetricQuery } from "../data/query/MetricQuery";
import {
  isPctType,
  MetricId,
  VariableConfig,
} from "../data/config/MetricConfig";
import CardWrapper from "./CardWrapper";
import { exclude } from "../data/query/BreakdownFilter";
import { AIAN_API, NON_HISPANIC, UNKNOWN_RACE } from "../data/utils/Constants";
import MissingDataAlert from "./ui/MissingDataAlert";
import { INCARCERATION_IDS } from "../data/variables/IncarcerationProvider";
import IncarceratedChildrenShortAlert from "./ui/IncarceratedChildrenShortAlert";
import { reportProviderSteps } from "../reports/ReportProviderSteps";
import { ScrollableHashId } from "../utils/hooks/useStepObserver";
import { useCreateChartTitle } from "../utils/hooks/useCreateChartTitle";

/* minimize layout shift */
const PRELOAD_HEIGHT = 668;

export interface SimpleBarChartCardProps {
  key?: string;
  breakdownVar: BreakdownVar;
  variableConfig: VariableConfig;
  fips: Fips;
}

// This wrapper ensures the proper key is set to create a new instance when
// required rather than relying on the card caller.
export function SimpleBarChartCard(props: SimpleBarChartCardProps) {
  return (
    <SimpleBarChartCardWithKey
      key={props.variableConfig.variableId + props.breakdownVar}
      {...props}
    />
  );
}

function SimpleBarChartCardWithKey(props: SimpleBarChartCardProps) {
  const metricConfig = props.variableConfig.metrics["per100k"];
  const locationName = props.fips.getSentenceDisplayName();

  const isIncarceration = INCARCERATION_IDS.includes(
    props.variableConfig.variableId
  );

  const isCawpCongress =
    props.variableConfig.variableId === "women_us_congress";

  const metricIdsToFetch: MetricId[] = [];
  metricIdsToFetch.push(metricConfig.metricId);
  isIncarceration && metricIdsToFetch.push("total_confined_children");

  const breakdowns = Breakdowns.forFips(props.fips).addBreakdown(
    props.breakdownVar,
    exclude(NON_HISPANIC, AIAN_API, UNKNOWN_RACE)
  );

  const query = new MetricQuery(
    metricIdsToFetch,
    breakdowns,
    /* variableId */ props.variableConfig.variableId,
    /* timeView */ isCawpCongress ? "cross_sectional" : undefined
  );

  const chartTitle = useCreateChartTitle(metricConfig, locationName);

  const filename = `${metricConfig.chartTitle} ${locationName}, by ${
    BREAKDOWN_VAR_DISPLAY_NAMES[props.breakdownVar]
  }`;

  const HASH_ID: ScrollableHashId = "rate-chart";

  return (
    <CardWrapper
      queries={[query]}
      title={<>{reportProviderSteps[HASH_ID].label}</>}
      minHeight={PRELOAD_HEIGHT}
      scrollToHash={HASH_ID}
    >
      {([queryResponse]) => {
        const data = queryResponse.getValidRowsForField(metricConfig.metricId);

        return (
          <CardContent>
            {queryResponse.shouldShowMissingDataMessage([
              metricConfig.metricId,
            ]) ? (
              <>
                <MissingDataAlert
                  dataName={metricConfig.fullCardTitleName}
                  breakdownString={
                    BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[props.breakdownVar]
                  }
                  fips={props.fips}
                />
              </>
            ) : (
              <>
                {isIncarceration && (
                  <IncarceratedChildrenShortAlert
                    fips={props.fips}
                    queryResponse={queryResponse}
                    breakdownVar={props.breakdownVar}
                  />
                )}

                <SimpleHorizontalBarChart
                  chartTitle={chartTitle}
                  data={data}
                  breakdownVar={props.breakdownVar}
                  metric={metricConfig}
                  showLegend={false}
                  filename={filename}
                  usePercentSuffix={isPctType(metricConfig.type)}
                />
              </>
            )}
          </CardContent>
        );
      }}
    </CardWrapper>
  );
}
