import React from "react";
import { CardContent } from "@material-ui/core";
import { Fips } from "../data/utils/Fips";
import {
  Breakdowns,
  BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES,
} from "../data/query/Breakdowns";
import { MetricQuery } from "../data/query/MetricQuery";
import { MetricId, VariableConfig } from "../data/config/MetricConfig";
import CardWrapper from "./CardWrapper";
import { TrendsChart } from "../charts/trendsChart/Index";
import { exclude } from "../data/query/BreakdownFilter";
import {
  DemographicGroup,
  LONGITUDINAL,
  NON_HISPANIC,
  UNKNOWN_LABELS,
} from "../data/utils/Constants";
import MissingDataAlert from "./ui/MissingDataAlert";
import {
  getNestedUndueShares,
  getNestedUnknowns,
  splitIntoKnownsAndUnknowns,
} from "../data/utils/datasetutils";

/* minimize layout shift */
const PRELOAD_HEIGHT = 668;

export interface ShareTrendsChartCardProps {
  key?: string;
  breakdownVar: BreakdownVar;
  variableConfig: VariableConfig;
  fips: Fips;
}

// Intentionally removed key wrapper found in other cards as 2N prefers card not re-render
// and instead D3 will handle updates to the data
export function ShareTrendsChartCard(props: ShareTrendsChartCardProps) {
  const metricConfig = props.variableConfig.metrics["pct_share"];

  const metricIdsToFetch: MetricId[] = [metricConfig.metricId];

  if (metricConfig.populationComparisonMetric?.metricId)
    metricIdsToFetch.push(metricConfig.populationComparisonMetric.metricId);

  const breakdowns = Breakdowns.forFips(props.fips).addBreakdown(
    props.breakdownVar,
    exclude(NON_HISPANIC)
  );

  const query = new MetricQuery(metricIdsToFetch, breakdowns, LONGITUDINAL);

  function getTitleText() {
    return `${metricConfig.trendsCardTitleName} by ${
      BREAKDOWN_VAR_DISPLAY_NAMES[props.breakdownVar]
    } in ${props.fips.getSentenceDisplayName()}`;
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
        const [knownData, unknownData] = splitIntoKnownsAndUnknowns(
          data,
          props.breakdownVar
        );

        // retrieve list of all present demographic groups
        const demographicGroups: DemographicGroup[] = queryResponse
          .getFieldValues(props.breakdownVar, metricConfig.metricId)
          .withData.filter(
            (group: DemographicGroup) => !UNKNOWN_LABELS.includes(group)
          );

        // TODO - can we make populationComparisonMetric a required field?
        const nestedData = getNestedUndueShares(
          knownData,
          demographicGroups,
          props.breakdownVar,
          metricConfig.metricId,
          metricConfig.populationComparisonMetric!.metricId
        );
        const nestedUnknowns = getNestedUnknowns(
          unknownData,
          metricConfig.metricId
        );

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
              <div>
                {/* 2N INCIDENCE RATE TRENDS VIZ COMPONENT HERE */}
                {console.log("UNDUE SHARES", nestedData)}

                {console.log("UNKNOWN PCT SHARE", nestedUnknowns)}
                {/*
                  <b>type: MetricType</b>
                  <pre>{metricConfig.type}</pre>

                  <b>metricId: MetricId</b>
                  <pre>{metricConfig.metricId}</pre>
                  <b>unknown: UnknownData</b>
                  <pre>{JSON.stringify(nestedUnknowns)}</pre>

                  <b>data: TrendsData</b>
                  <pre>{JSON.stringify(nestedData)}</pre> */}
                {/* @ts-ignore */}
                <TrendsChart
                  // @ts-ignore
                  data={nestedData}
                  // @ts-ignore
                  unknown={nestedUnknowns}
                  axisConfig={[metricConfig.type]}
                />
              </div>
            )}
          </CardContent>
        );
      }}
    </CardWrapper>
  );
}
