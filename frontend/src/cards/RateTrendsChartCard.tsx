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
  AIAN_API,
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
import {
  CAWP_DETERMINANTS,
  getWomenRaceLabel,
} from "../data/variables/CawpProvider";
import { Row } from "../data/utils/DatasetTypes";
import { hasNonZeroUnknowns } from "../charts/trendsChart/helpers";
import styles from "../charts/trendsChart/Trends.module.scss";

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
    exclude(NON_HISPANIC, AIAN_API)
  );

  const ratesQuery = new MetricQuery(
    metricConfigRates.metricId,
    breakdowns,
    /* variableId */ props.variableConfig.variableId,
    /* timeView */ TIME_SERIES
  );
  const pctShareQuery = new MetricQuery(
    metricConfigPctShares.metricId,
    breakdowns,
    /* variableId */ props.variableConfig.variableId,
    /* timeView */ TIME_SERIES
  );

  const isCawp = CAWP_DETERMINANTS.includes(metricConfigRates.metricId);

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

        const pctShareData = isCawp
          ? ratesData
          : queryResponsePctShares.getValidRowsForField(
              metricConfigPctShares.metricId
            );

        // swap race labels if applicable
        const ratesDataLabelled = isCawp
          ? ratesData.map((row: Row) => {
              const altRow = { ...row };
              altRow.race_and_ethnicity = getWomenRaceLabel(
                row.race_and_ethnicity
              );
              return altRow;
            })
          : ratesData;

        // retrieve list of all present demographic groups
        const demographicGroups: DemographicGroup[] =
          queryResponseRates.getFieldValues(
            props.breakdownVar,
            metricConfigRates.metricId
          ).withData;

        const demographicGroupsLabelled = isCawp
          ? demographicGroups.map((race) => getWomenRaceLabel(race))
          : demographicGroups;

        // we want to send Unknowns as Knowns for CAWP so we can plot as a line as well
        const [knownRatesData] = isCawp
          ? [ratesDataLabelled]
          : splitIntoKnownsAndUnknowns(ratesDataLabelled, props.breakdownVar);

        // rates for the unknown bubbles
        const [, unknownPctShareData] = splitIntoKnownsAndUnknowns(
          pctShareData,
          props.breakdownVar
        );

        const nestedRatesData = getNestedData(
          knownRatesData,
          demographicGroupsLabelled,
          props.breakdownVar,
          metricConfigRates.metricId
        );
        const nestedUnknownPctShareData = getNestedUnknowns(
          unknownPctShareData,
          isCawp ? metricConfigRates.metricId : metricConfigPctShares.metricId
        );

        const hasUnknowns = hasNonZeroUnknowns(nestedUnknownPctShareData);

        return (
          <CardContent>
            {queryResponseRates.shouldShowMissingDataMessage([
              metricConfigRates.metricId,
            ]) || nestedRatesData.length === 0 ? (
              <>
                <MissingDataAlert
                  dataName={`historical data for ${metricConfigRates.chartTitleLines.join(
                    " "
                  )}`}
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
                      Please use extra attention when making visual comparisons
                      as the axis-scales adjust to fit the selected data set.
                    </Alert>
                  </Box>
                )}
                <svg
                  width="100"
                  height="50"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <linearGradient id="gradient">
                    <stop className={styles.GradientMainStop} offset="0%" />
                    <stop className={styles.GradientAltStop} offset="20%" />
                    <stop className={styles.GradientMainStop} offset="30%" />
                    <stop className={styles.GradientAltStop} offset="40%" />
                    <stop className={styles.GradientMainStop} offset="50%" />
                    <stop className={styles.GradientAltStop} offset="60%" />
                    <stop className={styles.GradientMainStop} offset="70%" />
                    <stop className={styles.GradientAltStop} offset="80%" />
                    <stop className={styles.GradientMainStop} offset="90%" />
                    <stop className={styles.GradientAltStop} offset="100%" />
                  </linearGradient>
                </svg>
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
                    yAxisLabel: `${metricConfigRates.shortLabel} ${
                      props.fips.isUsa() ? "" : "from"
                    } ${
                      props.fips.isUsa()
                        ? ""
                        : props.fips.getSentenceDisplayName()
                    }`,
                    xAxisIsMonthly: metricConfigRates.isMonthly,
                  }}
                  breakdownVar={props.breakdownVar}
                  setSelectedTableGroups={setSelectedTableGroups}
                  isCompareCard={props.isCompareCard || false}
                  expanded={unknownsExpanded}
                  setExpanded={setUnknownsExpanded}
                  hasUnknowns={hasUnknowns}
                />
                {hasUnknowns && (
                  <CardContent>
                    <UnknownBubblesAlert
                      breakdownVar={props.breakdownVar}
                      variableDisplayName={props.variableConfig.variableDisplayName.toLowerCase()}
                      expanded={unknownsExpanded}
                      setExpanded={setUnknownsExpanded}
                    />
                  </CardContent>
                )}

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
                  hasUnknowns={hasUnknowns}
                />
              </>
            )}
          </CardContent>
        );
      }}
    </CardWrapper>
  );
}
