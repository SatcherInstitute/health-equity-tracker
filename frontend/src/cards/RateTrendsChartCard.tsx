import React from "react";
import { Box, CardContent } from "@material-ui/core";
import { Fips } from "../data/utils/Fips";
import {
  Breakdowns,
  BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE,
} from "../data/query/Breakdowns";
import { MetricQuery } from "../data/query/MetricQuery";
import { VariableConfig } from "../data/config/MetricConfig";
import CardWrapper from "./CardWrapper";
import { TrendsChart } from "../charts/trendsChart/Index";
import { exclude } from "../data/query/BreakdownFilter";
import {
  DemographicGroup,
  LONGITUDINAL,
  NON_HISPANIC,
} from "../data/utils/Constants";
import MissingDataAlert from "./ui/MissingDataAlert";
import { splitIntoKnownsAndUnknowns } from "../data/utils/datasetutils";
import {
  getNestedRates,
  getNestedUnknowns,
} from "../data/utils/DatasetTimeUtils";
import { Alert } from "@material-ui/lab";

/* minimize layout shift */
const PRELOAD_HEIGHT = 668;

export interface RateTrendsChartCardProps {
  key?: string;
  breakdownVar: BreakdownVar;
  variableConfig: VariableConfig;
  fips: Fips;
  isComparisonCard?: boolean;
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
    } in ${props.fips.getSentenceDisplayName()}`;
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
            ]) || nestedRatesData.length === 0 ? (
              <>
                <MissingDataAlert
                  dataName={`historical data for ${metricConfigRates.fullCardTitleName}`}
                  breakdownString={
                    BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[props.breakdownVar]
                  }
                  fips={props.fips}
                />
              </>
            ) : (
              <>
                {props.isComparisonCard && (
                  <Box mb={2}>
                    <Alert severity="warning" role="note">
                      Please note that the y-axis scales to fit the largest
                      value, requiring extra attention when making visual
                      side-by-side comparisons.
                    </Alert>
                  </Box>
                )}
                <TrendsChart
                  // @ts-ignore
                  data={nestedRatesData}
                  // @ts-ignore
                  unknown={nestedUnknownPctShareData}
                  axisConfig={{
                    type: metricConfigRates.type,
                    groupLabel:
                      BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[
                        props.breakdownVar
                      ],
                    yAxisLabel: metricConfigRates.shortLabel,
                  }}
                  title={getTitleText()}
                />
              </>
            )}
          </CardContent>
        );
      }}
    </CardWrapper>
  );
}
