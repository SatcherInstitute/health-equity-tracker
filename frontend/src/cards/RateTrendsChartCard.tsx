import React from "react";
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
import { exclude } from "../data/query/BreakdownFilter";
import {
  DemographicGroup,
  LONGITUDINAL,
  NON_HISPANIC,
} from "../data/utils/Constants";
import MissingDataAlert from "./ui/MissingDataAlert";
import {
  getNestedRates,
  getNestedUnknowns,
  splitIntoKnownsAndUnknowns,
} from "../data/utils/datasetutils";

/* minimize layout shift */
const PRELOAD_HEIGHT = 668;

export interface RateTrendsChartCardProps {
  key?: string;
  breakdownVar: BreakdownVar;
  variableConfig: VariableConfig;
  fips: Fips;
}

// Intentionally removed key wrapper found in other cards as 2N prefers card not re-render
// and instead D3 will handle updates to the data
export function RateTrendsChartCard(props: RateTrendsChartCardProps) {
  const metricConfigRates = props.variableConfig.metrics["per100k"];
  const metricConfigPctShares = props.variableConfig.metrics["pct_share"];

  const breakdowns = Breakdowns.forFips(props.fips).addBreakdown(
    props.breakdownVar,
    exclude(NON_HISPANIC)
  );

  const ratesQuery = new MetricQuery(
    metricConfigRates.metricId,
    breakdowns,
    LONGITUDINAL
  );
  const pctShareQuery = new MetricQuery(
    metricConfigPctShares.metricId,
    breakdowns,
    LONGITUDINAL
  );

  function getTitleText() {
    return `${
      metricConfigRates.trendsCardTitleName
    } by ${BREAKDOWN_VAR_DISPLAY_NAMES[
      props.breakdownVar
    ].toLowerCase()} in ${props.fips.getSentenceDisplayName()}`;
  }
  function CardTitle() {
    return <>{getTitleText()}</>;
  }

  return (
    <CardWrapper
      queries={[ratesQuery, pctShareQuery]}
      title={<CardTitle />}
      minHeight={PRELOAD_HEIGHT}
    >
      {([queryResponseRates, queryResponsePctShares]) => {
        const ratesData = queryResponseRates.getValidRowsForField(
          metricConfigRates.metricId
        );
        const pctShareData = queryResponsePctShares.getValidRowsForField(
          metricConfigPctShares.metricId
        );

        // retrieve list of all present demographic groups
        const demographicGroups: DemographicGroup[] =
          queryResponseRates.getFieldValues(
            props.breakdownVar,
            metricConfigRates.metricId
          ).withData;

        const [knownRatesData] = splitIntoKnownsAndUnknowns(
          ratesData,
          props.breakdownVar
        );
        const [, unknownPctShareData] = splitIntoKnownsAndUnknowns(
          pctShareData,
          props.breakdownVar
        );

        const nestedRatesData = getNestedRates(
          knownRatesData,
          demographicGroups,
          props.breakdownVar,
          metricConfigRates.metricId
        );
        const nestedUnknownPctShareData = getNestedUnknowns(
          unknownPctShareData,
          metricConfigPctShares.metricId
        );

        return (
          <CardContent>
            {queryResponseRates.shouldShowMissingDataMessage([
              metricConfigRates.metricId,
            ]) ? (
              <>
                <MissingDataAlert
                  dataName={metricConfigRates.fullCardTitleName}
                  breakdownString={
                    BREAKDOWN_VAR_DISPLAY_NAMES[props.breakdownVar]
                  }
                  fips={props.fips}
                />
              </>
            ) : (
              <>
                {/* 2N INCIDENCE RATE TRENDS VIZ COMPONENT HERE */}
                {console.log("KNOWN RATES", nestedRatesData)}
                {console.log("UNKNOWN PCT SHARE", nestedUnknownPctShareData)}
                <b>Rates</b>
                {nestedRatesData.map((group) => {
                  return <pre>{JSON.stringify(group)}</pre>;
                })}
                <b>Unknowns</b>
                <pre>{JSON.stringify(nestedUnknownPctShareData)}</pre>
              </>
            )}
          </CardContent>
        );
      }}
    </CardWrapper>
  );
}
