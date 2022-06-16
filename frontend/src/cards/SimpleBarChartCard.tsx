import React from "react";
import { SimpleHorizontalBarChart } from "../charts/SimpleHorizontalBarChart";
import { Box, CardContent } from "@material-ui/core";
import { Fips } from "../data/utils/Fips";
import {
  Breakdowns,
  BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES,
} from "../data/query/Breakdowns";
import { MetricQuery } from "../data/query/MetricQuery";
import {
  isPctType,
  MetricId,
  VariableConfig,
} from "../data/config/MetricConfig";
import CardWrapper from "./CardWrapper";
import { exclude } from "../data/query/BreakdownFilter";
import { ALL, NON_HISPANIC } from "../data/utils/Constants";
import MissingDataAlert from "./ui/MissingDataAlert";
import { BJS_VARIABLE_IDS } from "../data/variables/BjsProvider";
import IncarceratedChildrenShortAlert from "./ui/IncarceratedChildrenShortAlert";
import IncarcerationAlert from "./ui/IncarcerationAlert";

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

  const isIncarceration = BJS_VARIABLE_IDS.includes(
    props.variableConfig.variableId
  );
  const metricIdsToFetch: MetricId[] = [];
  metricIdsToFetch.push(metricConfig.metricId);
  isIncarceration && metricIdsToFetch.push("total_confined_children");

  const breakdowns = Breakdowns.forFips(props.fips).addBreakdown(
    props.breakdownVar,
    exclude(NON_HISPANIC)
  );

  const query = new MetricQuery(metricIdsToFetch, breakdowns);

  function getTitleText() {
    return `${metricConfig.fullCardTitleName} By ${
      BREAKDOWN_VAR_DISPLAY_NAMES[props.breakdownVar]
    } In ${props.fips.getFullDisplayName()}`;
  }
  function CardTitle() {
    return <>{getTitleText()}</>;
  }

  return (
    <CardWrapper
      queries={[query]}
      title={<CardTitle />}
      minHeight={PRELOAD_HEIGHT}
    >
      {([queryResponse]) => {
        const data = queryResponse.getValidRowsForField(metricConfig.metricId);

        const hasOnlyAll =
          data.map((row) => row[props.breakdownVar]).join() === ALL;

        return (
          <CardContent>
            {queryResponse.shouldShowMissingDataMessage([
              metricConfig.metricId,
            ]) ? (
              <>
                <MissingDataAlert
                  dataName={metricConfig.fullCardTitleName}
                  breakdownString={
                    BREAKDOWN_VAR_DISPLAY_NAMES[props.breakdownVar]
                  }
                  fips={props.fips}
                />
              </>
            ) : (
              <>
                {isIncarceration && (
                  <CardContent>
                    {!hasOnlyAll && (
                      <Box mb={1}>
                        <IncarcerationAlert
                          dataType={props.variableConfig.variableId}
                          fips={props.fips}
                          breakdown={props.breakdownVar}
                        />
                      </Box>
                    )}

                    <IncarceratedChildrenShortAlert
                      fips={props.fips}
                      queryResponse={queryResponse}
                      breakdownVar={props.breakdownVar}
                    />
                  </CardContent>
                )}

                <SimpleHorizontalBarChart
                  data={data}
                  breakdownVar={props.breakdownVar}
                  metric={metricConfig}
                  showLegend={false}
                  filename={getTitleText()}
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
