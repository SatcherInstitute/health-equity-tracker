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
  getNestedData,
  getNestedUnknowns,
} from "../data/utils/DatasetTimeUtils";
import { Alert } from "@material-ui/lab";
import AltTableView from "./ui/AltTableView";
import UnknownBubblesAlert from "./ui/UnknownBubblesAlert";
import { reportProviderSteps } from "../reports/ReportProviderSteps";
import { ScrollableHashId } from "../utils/hooks/useStepObserver";

/* minimize layout shift */
const PRELOAD_HEIGHT = 668;

export interface RateTrendsChartCardProps {
  key?: string;
  breakdownVar: BreakdownVar;
  variableConfig: VariableConfig;
  fips: Fips;
  isCompareCard?: boolean;
}

// Intentionally removed key wrapper found in other cards as 2N prefers card not re-render
// and instead D3 will handle updates to the data
export function RateTrendsChartCard(props: RateTrendsChartCardProps) {
  // Manages which group filters user has applied
  const [selectedTableGroups, setSelectedTableGroups] = useState<string[]>([]);

  const [a11yTableExpanded, setA11yTableExpanded] = useState(false);
  const [unknownsExpanded, setUnknownsExpanded] = useState(false);

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

  const HASH_ID: ScrollableHashId = "rates-over-time";
  const cardHeaderTitle = reportProviderSteps[HASH_ID].label;

  return (
    <CardWrapper
      queries={[ratesQuery, pctShareQuery]}
      title={<>{cardHeaderTitle}</>}
      minHeight={PRELOAD_HEIGHT}
      scrollToHash={HASH_ID}
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

        const nestedRatesData = getNestedData(
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
                {props.isCompareCard && (
                  <Box mb={2}>
                    <Alert severity="warning" role="note">
                      Please note that the y-axis scales to fit the largest
                      value, requiring extra attention when making visual
                      side-by-side comparisons.
                    </Alert>
                  </Box>
                )}

                <TrendsChart
                  data={nestedRatesData}
                  chartTitle={getTitleText()}
                  unknown={nestedUnknownPctShareData}
                  axisConfig={{
                    type: metricConfigRates.type,
                    groupLabel:
                      BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[
                        props.breakdownVar
                      ],
                    yAxisLabel: metricConfigRates.shortLabel,
                  }}
                  breakdownVar={props.breakdownVar}
                  setSelectedTableGroups={setSelectedTableGroups}
                  isCompareCard={props.isCompareCard || false}
                  expanded={unknownsExpanded}
                  setExpanded={setUnknownsExpanded}
                />

                <CardContent>
                  <UnknownBubblesAlert
                    breakdownVar={props.breakdownVar}
                    variableDisplayName={props.variableConfig.variableDisplayName.toLowerCase()}
                    expanded={unknownsExpanded}
                    setExpanded={setUnknownsExpanded}
                  />
                </CardContent>

                <AltTableView
                  expanded={a11yTableExpanded}
                  setExpanded={setA11yTableExpanded}
                  expandBoxLabel={cardHeaderTitle.toLowerCase()}
                  tableCaption={`${getTitleText()} by ${
                    BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[props.breakdownVar]
                  }`}
                  knownsData={knownRatesData}
                  unknownsData={unknownPctShareData}
                  breakdownVar={props.breakdownVar}
                  knownMetricConfig={metricConfigRates}
                  unknownMetricConfig={metricConfigPctShares}
                  selectedGroups={selectedTableGroups}
                />
              </>
            )}
          </CardContent>
        );
      }}
    </CardWrapper>
  );
}
