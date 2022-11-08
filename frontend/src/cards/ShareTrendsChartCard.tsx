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
} from "../data/utils/Constants";
import MissingDataAlert from "./ui/MissingDataAlert";
import { splitIntoKnownsAndUnknowns } from "../data/utils/datasetutils";
import {
  getNestedData,
  getNestedUnknowns,
} from "../data/utils/DatasetTimeUtils";
import { Alert } from "@material-ui/lab";
import { METHODOLOGY_TAB_LINK } from "../utils/internalRoutes";
import AltTableView from "./ui/AltTableView";
import { reportProviderSteps } from "../reports/ReportProviderSteps";
import { ScrollableHashId } from "../utils/hooks/useStepObserver";
import { Link } from "react-router-dom";

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
    TIME_SERIES
  );
  const pctShareQuery = new MetricQuery(
    metricConfigPctShares.metricId,
    breakdowns,
    TIME_SERIES
  );

  function getTitleText() {
    return `${
      metricConfigInequitable.fullCardTitleName
    } in ${props.fips.getSentenceDisplayName()}`;
  }

  const HASH_ID: ScrollableHashId = "inequities-over-time";
  const cardHeaderTitle = reportProviderSteps[HASH_ID].label;

  return (
    <CardWrapper
      queries={[inequityQuery, pctShareQuery]}
      configs={[metricConfigInequitable]}
      title={<>{cardHeaderTitle}</>}
      minHeight={PRELOAD_HEIGHT}
      scrollToHash={HASH_ID}
    >
      {([queryResponseInequity, queryResponsePctShares]) => {
        const inequityData = queryResponseInequity.getValidRowsForField(
          metricConfigInequitable.metricId
        );
        const [knownInequityData] = splitIntoKnownsAndUnknowns(
          inequityData,
          props.breakdownVar
        );

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
          );

        const nestedInequityData = getNestedData(
          knownInequityData,
          demographicGroups,
          props.breakdownVar,
          metricConfigInequitable.metricId
        );

        const nestedUnknowns = getNestedUnknowns(
          unknownPctShareData,
          metricConfigPctShares.metricId
        );

        return (
          <>
            <CardContent>
              <Alert severity="info" role="note">
                This chart visualizes the disproportionate percent share of a
                condition that is borne by a certain demographic, compared with
                that demographic's share of the entire population (defaulting to
                groups with the highest / lowest historical averages). Read more
                about this calculation in our{" "}
                <Link to={`${METHODOLOGY_TAB_LINK}#metrics`}>methodology</Link>.
              </Alert>
            </CardContent>

            <CardContent>
              {queryResponseInequity.shouldShowMissingDataMessage([
                metricConfigInequitable.metricId,
              ]) || nestedInequityData.length === 0 ? (
                <>
                  <MissingDataAlert
                    dataName={metricConfigInequitable.fullCardTitleName}
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
                    chartTitle={getTitleText()}
                    unknown={nestedUnknowns}
                    axisConfig={{
                      type: metricConfigInequitable.type,
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
                    expandBoxLabel={cardHeaderTitle.toLowerCase()}
                    tableCaption={`${getTitleText()} by ${
                      BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[props.breakdownVar]
                    }`}
                    knownsData={inequityData}
                    unknownsData={unknownPctShareData}
                    breakdownVar={props.breakdownVar}
                    knownMetricConfig={metricConfigInequitable}
                    unknownMetricConfig={metricConfigPctShares}
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
