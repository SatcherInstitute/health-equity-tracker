import React, { useState } from "react";
import { CardContent } from "@material-ui/core";
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
  ALL,
  DemographicGroup,
  TIME_SERIES,
  NON_HISPANIC,
  UNKNOWN_LABELS,
  RaceAndEthnicityGroup,
} from "../data/utils/Constants";
import MissingDataAlert from "./ui/MissingDataAlert";
import { splitIntoKnownsAndUnknowns } from "../data/utils/datasetutils";
import {
  getNestedData,
  getNestedUnknowns,
} from "../data/utils/DatasetTimeUtils";
import { Alert } from "@material-ui/lab";
import { HashLink } from "react-router-hash-link";
import { METHODOLOGY_TAB_LINK } from "../utils/internalRoutes";
import AltTableView from "./ui/AltTableView";
import UnknownBubblesAlert from "./ui/UnknownBubblesAlert";
import { reportProviderSteps } from "../reports/ReportProviderSteps";
import { ScrollableHashId } from "../utils/hooks/useStepObserver";
import { getWomenRaceLabel } from "../data/variables/CawpProvider";
import { Row } from "../data/utils/DatasetTypes";
import { hasNonZeroUnknowns } from "../charts/trendsChart/helpers";
import { useCreateChartTitle } from "../utils/hooks/useCreateChartTitle";

/* minimize layout shift */
const PRELOAD_HEIGHT = 668;

export interface ShareTrendsChartCardProps {
  key?: string;
  breakdownVar: BreakdownVar;
  variableConfig: VariableConfig;
  fips: Fips;
  isCompareCard?: boolean;
}

// Intentionally removed key wrapper found in other cards as 2N prefers card not re-render
// and instead D3 will handle updates to the data
export function ShareTrendsChartCard(props: ShareTrendsChartCardProps) {
  // Manages which group filters user has applied
  const [selectedTableGroups, setSelectedTableGroups] = useState<
    DemographicGroup[]
  >([]);

  const [a11yTableExpanded, setA11yTableExpanded] = useState(false);
  const [unknownsExpanded, setUnknownsExpanded] = useState(false);

  const metricConfigInequitable =
    props.variableConfig.metrics["pct_relative_inequity"];
  const metricConfigPctShares = props.variableConfig.metrics["pct_share"];

  const breakdowns = Breakdowns.forFips(props.fips).addBreakdown(
    props.breakdownVar,
    exclude(NON_HISPANIC, ALL)
  );

  const inequityQuery = new MetricQuery(
    metricConfigInequitable.metricId,
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

  const locationPhrase = `in ${props.fips.getSentenceDisplayName()}`;
  const { filename, dataName } = useCreateChartTitle(
    metricConfigInequitable,
    locationPhrase
  );

  const HASH_ID: ScrollableHashId = "inequities-over-time";
  const cardHeaderTitle = reportProviderSteps[HASH_ID].label;

  const isCawpCongress =
    metricConfigInequitable.metricId ===
    "women_us_congress_pct_relative_inequity";

  return (
    <CardWrapper
      queries={[inequityQuery, pctShareQuery]}
      title={<>{cardHeaderTitle}</>}
      minHeight={PRELOAD_HEIGHT}
      scrollToHash={HASH_ID}
    >
      {([queryResponseInequity, queryResponsePctShares]) => {
        const inequityData = queryResponseInequity.getValidRowsForField(
          metricConfigInequitable.metricId
        );
        const [knownData] = splitIntoKnownsAndUnknowns(
          inequityData,
          props.breakdownVar
        );

        // swap race labels if applicable
        const knownInequityData = isCawpCongress
          ? knownData.map((row: Row) => {
              const altRow = { ...row };
              altRow.race_and_ethnicity = getWomenRaceLabel(
                row.race_and_ethnicity
              );
              return altRow;
            })
          : knownData;

        const pctShareData = queryResponsePctShares.getValidRowsForField(
          metricConfigPctShares.metricId
        );

        const [, unknownPctShareData] = splitIntoKnownsAndUnknowns(
          pctShareData,
          props.breakdownVar
        );

        // retrieve list of all present demographic groups
        const demographicGroups: DemographicGroup[] = queryResponseInequity
          .getFieldValues(props.breakdownVar, metricConfigInequitable.metricId)
          .withData.filter(
            (group: DemographicGroup) => !UNKNOWN_LABELS.includes(group)
          ) as DemographicGroup[];

        const demographicGroupsLabelled = isCawpCongress
          ? demographicGroups.map((group) =>
              getWomenRaceLabel(group as RaceAndEthnicityGroup)
            )
          : demographicGroups;

        const nestedInequityData = getNestedData(
          knownInequityData,
          demographicGroupsLabelled,
          props.breakdownVar,
          metricConfigInequitable.metricId
        );

        const nestedUnknowns = getNestedUnknowns(
          unknownPctShareData,
          metricConfigPctShares.metricId
        );

        const hasUnknowns = hasNonZeroUnknowns(nestedUnknowns);

        return (
          <>
            <CardContent>
              <Alert severity="info" role="note">
                This chart visualizes the disproportionate share of a condition
                experienced by group, compared with that group's share of the
                entire population (defaulting to highest and lowest historical
                averages when many groups are present). Read more about this
                calculation in our{" "}
                <HashLink to={`${METHODOLOGY_TAB_LINK}#metrics`}>
                  methodology
                </HashLink>
                .
              </Alert>
            </CardContent>

            <CardContent>
              {queryResponseInequity.shouldShowMissingDataMessage([
                metricConfigInequitable.metricId,
              ]) || nestedInequityData.length === 0 ? (
                <>
                  <MissingDataAlert
                    dataName={dataName}
                    breakdownString={
                      BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[props.breakdownVar]
                    }
                    fips={props.fips}
                  />
                </>
              ) : (
                <>
                  {/* @ts-ignore */}
                  <TrendsChart
                    data={nestedInequityData}
                    chartTitle={filename}
                    unknown={nestedUnknowns}
                    axisConfig={{
                      type: metricConfigInequitable.type,
                      groupLabel: BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[
                        props.breakdownVar
                      ] as DemographicGroup,
                      xAxisIsMonthly: metricConfigInequitable.isMonthly,
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
                    tableCaption={`${filename} by ${
                      BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[props.breakdownVar]
                    }`}
                    knownsData={inequityData}
                    unknownsData={unknownPctShareData}
                    breakdownVar={props.breakdownVar}
                    knownMetricConfig={metricConfigInequitable}
                    unknownMetricConfig={metricConfigPctShares}
                    selectedGroups={selectedTableGroups}
                    hasUnknowns={hasUnknowns}
                  />
                </>
              )}
            </CardContent>
          </>
        );
      }}
    </CardWrapper>
  );
}
