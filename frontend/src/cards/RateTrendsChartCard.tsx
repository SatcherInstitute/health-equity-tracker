import React, { useState } from "react";
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
  TIME_SERIES,
  NON_HISPANIC,
} from "../data/utils/Constants";
import MissingDataAlert from "./ui/MissingDataAlert";
import { splitIntoKnownsAndUnknowns } from "../data/utils/datasetutils";
import {
  getNestedRates,
  getNestedUnknowns,
} from "../data/utils/DatasetTimeUtils";
import { Alert } from "@material-ui/lab";
import AltTableView from "./ui/AltTableView";
import { createSubTitle } from "../charts/utils";
import { EXPLORE_DATA_PAGE_WHAT_DATA_ARE_MISSING_LINK } from "../utils/internalRoutes";
import { HashLink } from "react-router-hash-link";

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
  // Manages which group filters user has applied
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  const [a11yTableExpanded, setA11yTableExpanded] = useState(false);

  const metricConfigRates = props.variableConfig.metrics["per100k"];
  const metricConfigPctShares = props.variableConfig.metrics["pct_share"];

  const breakdowns = Breakdowns.forFips(props.fips).addBreakdown(
    props.breakdownVar,
    exclude(NON_HISPANIC)
  );

  const ratesQuery = new MetricQuery(
    metricConfigRates.metricId,
    breakdowns,
    TIME_SERIES
  );
  const pctShareQuery = new MetricQuery(
    metricConfigPctShares.metricId,
    breakdowns,
    TIME_SERIES
  );

  function getTitleText() {
    return `${
      metricConfigRates.trendsCardTitleName
    } in ${props.fips.getSentenceDisplayName()}`;
  }
  // function CardTitle() {
  //   return <>{getTitleText()}</>;
  // }

  const { chartTitle } = createSubTitle({
    fips: props.fips,
    variableConfig: props.variableConfig,
    trend: true,
  });

  return (
    <CardWrapper
      queries={[ratesQuery, pctShareQuery]}
      title={<>Rates Over Time</>}
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
                  chartTitle={chartTitle}
                  breakdownVar={props.breakdownVar}
                  selectedGroups={selectedGroups}
                  setSelectedGroups={setSelectedGroups}
                />

                <CardContent>
                  <Alert severity="info" role="note">
                    Missing and unknown data impact Health Equity. The{" "}
                    <b>percent unknown</b> bubbles we show along the bottom of
                    this chart are our best attempt to demonstrate prevalence of
                    unknown demographic data. Learn more about{" "}
                    <HashLink to={EXPLORE_DATA_PAGE_WHAT_DATA_ARE_MISSING_LINK}>
                      what data are missing.
                    </HashLink>{" "}
                  </Alert>
                </CardContent>

                <AltTableView
                  expanded={a11yTableExpanded}
                  setExpanded={setA11yTableExpanded}
                  expandBoxLabel={"rates over time"}
                  tableCaption={`${getTitleText()} by ${
                    BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[props.breakdownVar]
                  }`}
                  knownsData={knownRatesData}
                  unknownsData={unknownPctShareData}
                  breakdownVar={props.breakdownVar}
                  knownMetricConfig={metricConfigRates}
                  unknownMetricConfig={metricConfigPctShares}
                  selectedGroups={selectedGroups}
                />
              </>
            )}
          </CardContent>
        );
      }}
    </CardWrapper>
  );
}
