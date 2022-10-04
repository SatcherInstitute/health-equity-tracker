import React, { useState } from "react";
import { CardContent } from "@material-ui/core";
import { Fips } from "../data/utils/Fips";
import {
  Breakdowns,
  BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE,
} from "../data/query/Breakdowns";
import { MetricQuery } from "../data/query/MetricQuery";
import { MetricId, VariableConfig } from "../data/config/MetricConfig";
import CardWrapper from "./CardWrapper";
import { TrendsChart } from "../charts/trendsChart/Index";
import { exclude } from "../data/query/BreakdownFilter";
import {
  ALL,
  DemographicGroup,
  TIME_SERIES,
  NON_HISPANIC,
  UNKNOWN_LABELS,
} from "../data/utils/Constants";
import MissingDataAlert from "./ui/MissingDataAlert";
import { splitIntoKnownsAndUnknowns } from "../data/utils/datasetutils";
import {
  getNestedUndueShares,
  getNestedUnknowns,
} from "../data/utils/DatasetTimeUtils";
import { Alert } from "@material-ui/lab";
import { HashLink } from "react-router-hash-link";
import { METHODOLOGY_TAB_LINK } from "../utils/internalRoutes";
import AltTableView from "./ui/AltTableView";
import { reportProviderSteps } from "../reports/ReportProviderSteps";
import { createTitles } from "../charts/utils";
import { ScrollableHashId } from "../utils/hooks/useStepObserver";

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
  const [selectedTableGroups, setSelectedTableGroups] = useState<string[]>([]);

  const [a11yTableExpanded, setA11yTableExpanded] = useState(false);

  const metricConfig = props.variableConfig.metrics["pct_share"];

  const metricIdsToFetch: MetricId[] = [metricConfig.metricId];

  if (metricConfig.populationComparisonMetric?.metricId)
    metricIdsToFetch.push(metricConfig.populationComparisonMetric.metricId);

  const breakdowns = Breakdowns.forFips(props.fips).addBreakdown(
    props.breakdownVar,
    exclude(NON_HISPANIC, ALL)
  );

  const query = new MetricQuery(metricIdsToFetch, breakdowns, TIME_SERIES);

  function getTitleText() {
    return `${
      metricConfig.trendsCardTitleName
    } in ${props.fips.getSentenceDisplayName()}`;
  }

  const { chartTitle } = createTitles({
    fips: props.fips,
    variableConfig: props.variableConfig,
    share: true,
  });

  const HASH_ID: ScrollableHashId = "inequities-over-time";

  return (
    <CardWrapper
      queries={[query]}
      title={<>{reportProviderSteps[HASH_ID].label}</>}
      minHeight={PRELOAD_HEIGHT}
      scrollToHash={HASH_ID}
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
          <>
            <CardContent>
              <Alert severity="info" role="note">
                This chart visualizes the disproportionate percent share of a
                condition that is borne by a certain demographic, compared with
                that demographic's share of the entire population. Read more
                about this calculation in our{" "}
                <HashLink to={`${METHODOLOGY_TAB_LINK}#metrics`}>
                  methodology
                </HashLink>
                .
              </Alert>
            </CardContent>

            <CardContent>
              {queryResponse.shouldShowMissingDataMessage([
                metricConfig.metricId,
              ]) || nestedData.length === 0 ? (
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
                  {/* @ts-ignore */}
                  <TrendsChart
                    data={nestedData}
                    chartTitle={chartTitle}
                    unknown={nestedUnknowns}
                    axisConfig={{
                      type: metricConfig.type,
                      groupLabel:
                        BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[
                          props.breakdownVar
                        ],
                    }}
                    breakdownVar={props.breakdownVar}
                    setSelectedTableGroups={setSelectedTableGroups}
                    isCompareCard={props.isCompareCard || false}
                  />

                  <AltTableView
                    expanded={a11yTableExpanded}
                    setExpanded={setA11yTableExpanded}
                    expandBoxLabel={"share disparities over time"}
                    tableCaption={`${getTitleText()} by ${
                      BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[props.breakdownVar]
                    }`}
                    knownsData={knownData}
                    unknownsData={unknownData}
                    breakdownVar={props.breakdownVar}
                    knownMetricConfig={metricConfig}
                    unknownMetricConfig={metricConfig}
                    selectedGroups={selectedTableGroups}
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
