import { CardContent, Grid } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Alert from "@material-ui/lab/Alert";
import React, { useState } from "react";
import { ChoroplethMap } from "../charts/ChoroplethMap";
import { VariableConfig } from "../data/config/MetricConfig";
import { exclude } from "../data/query/BreakdownFilter";
import {
  Breakdowns,
  BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES,
  BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE,
} from "../data/query/Breakdowns";
import { MetricQuery } from "../data/query/MetricQuery";
import { AgeSorterStrategy } from "../data/sorting/AgeSorterStrategy";
import {
  ALL,
  NON_HISPANIC,
  UNKNOWN,
  UNKNOWN_RACE,
} from "../data/utils/Constants";
import { Row } from "../data/utils/DatasetTypes";
import { getHighestN, getLowestN } from "../data/utils/datasetutils";
import { Fips } from "../data/utils/Fips";
import { useAutoFocusDialog } from "../utils/useAutoFocusDialog";
import styles from "./Card.module.scss";
import CardWrapper from "./CardWrapper";
import DropDownMenu from "./ui/DropDownMenu";
import { HighestLowestList } from "./ui/HighestLowestList";
import MapBreadcrumbs from "./ui/MapBreadcrumbs";
import MissingDataAlert from "./ui/MissingDataAlert";
import { MultiMapDialog } from "./ui/MultiMapDialog";

const POSSIBLE_BREAKDOWNS: BreakdownVar[] = [
  "race_and_ethnicity",
  "age",
  "sex",
];

const SIZE_OF_HIGHEST_LOWEST_RATES_LIST = 5;

export interface MapCardProps {
  key?: string;
  fips: Fips;
  variableConfig: VariableConfig;
  updateFipsCallback: (fips: Fips) => void;
  currentBreakdown: BreakdownVar;
}

// This wrapper ensures the proper key is set to create a new instance when required (when
// the props change and the state needs to be reset) rather than relying on the card caller.
export function MapCard(props: MapCardProps) {
  return (
    <MapCardWithKey
      key={props.currentBreakdown + props.variableConfig.variableId}
      {...props}
    />
  );
}

function MapCardWithKey(props: MapCardProps) {
  const metricConfig = props.variableConfig.metrics["per100k"];

  const signalListeners: any = {
    click: (...args: any) => {
      const clickedData = args[1];
      props.updateFipsCallback(new Fips(clickedData.id));
    },
  };

  const [listExpanded, setListExpanded] = useState(false);

  const [activeBreakdownFilter, setActiveBreakdownFilter] = useState<string>(
    ALL
  );
  const [activeBreakdownVar, setActiveBreakdownVar] = useState<BreakdownVar>(
    props.currentBreakdown
  );

  const [
    smallMultiplesDialogOpen,
    setSmallMultiplesDialogOpen,
  ] = useAutoFocusDialog();

  const geographyBreakdown = props.fips.isUsa()
    ? Breakdowns.byState()
    : Breakdowns.byCounty().withGeoFilter(props.fips);

  const requestedBreakdowns = POSSIBLE_BREAKDOWNS.filter(
    (possibleBreakdown) => props.currentBreakdown === possibleBreakdown
  );
  const queries = requestedBreakdowns.map(
    (breakdown) =>
      new MetricQuery(
        metricConfig.metricId,
        geographyBreakdown
          .copy()
          .addBreakdown(
            breakdown,
            breakdown === "race_and_ethnicity"
              ? exclude(NON_HISPANIC, UNKNOWN, UNKNOWN_RACE)
              : exclude(UNKNOWN)
          )
      )
  );

  return (
    <CardWrapper
      queries={queries}
      title={<>{metricConfig.fullCardTitleName}</>}
      loadGeographies={true}
    >
      {(queryResponses, metadata, geoData) => {
        const sortArgs =
          props.currentBreakdown === "age"
            ? ([new AgeSorterStrategy([ALL]).compareFn] as any)
            : [];

        // Look up query at the same index as the breakdown.
        // TODO: we might consider returning a map of id to response from
        // CardWrapper so we don't need to rely on index order.
        const queryResponse =
          queryResponses[requestedBreakdowns.indexOf(activeBreakdownVar)];
        const breakdownValues = queryResponse.getUniqueFieldValues(
          activeBreakdownVar
        );

        breakdownValues.sort.apply(breakdownValues, sortArgs);

        const dataForActiveBreakdownFilter = queryResponse
          .getValidRowsForField(metricConfig.metricId)
          .filter(
            (row: Row) => row[activeBreakdownVar] === activeBreakdownFilter
          );
        const highestRatesList = getHighestN(
          dataForActiveBreakdownFilter,
          metricConfig.metricId,
          SIZE_OF_HIGHEST_LOWEST_RATES_LIST
        );
        const lowestRatesList = getLowestN(
          dataForActiveBreakdownFilter,
          metricConfig.metricId,
          SIZE_OF_HIGHEST_LOWEST_RATES_LIST
        );

        // Create and populate a map of breakdown display name to options
        let filterOptions: Record<string, string[]> = {};
        const getBreakdownOptions = (breakdown: BreakdownVar) => {
          const values = queryResponses[
            requestedBreakdowns.indexOf(breakdown)
          ].getUniqueFieldValues(breakdown);
          return values.sort.apply(values, sortArgs);
        };
        POSSIBLE_BREAKDOWNS.forEach((breakdown: BreakdownVar) => {
          if ([breakdown].includes(props.currentBreakdown)) {
            filterOptions[
              BREAKDOWN_VAR_DISPLAY_NAMES[breakdown]
            ] = getBreakdownOptions(breakdown);
          }
        });

        return (
          <>
            <MultiMapDialog
              fips={props.fips}
              metricConfig={metricConfig}
              useSmallSampleMessage={
                !queryResponse.dataIsMissing() &&
                (props.variableConfig.surveyCollectedData || false)
              }
              data={queryResponse.getValidRowsForField(metricConfig.metricId)}
              breakdown={activeBreakdownVar}
              handleClose={() => setSmallMultiplesDialogOpen(false)}
              open={smallMultiplesDialogOpen}
              breakdownValues={breakdownValues}
              fieldRange={queryResponse.getFieldRange(metricConfig.metricId)}
              queryResponses={queryResponses} // TODO
              metadata={metadata}
              geoData={geoData}
            />
            <CardContent className={styles.SmallMarginContent}>
              <MapBreadcrumbs
                fips={props.fips}
                updateFipsCallback={props.updateFipsCallback}
              />
            </CardContent>

            {!queryResponse.dataIsMissing() && (
              <>
                <Divider />
                <CardContent className={styles.SmallMarginContent}>
                  <Grid
                    container
                    justify="space-between"
                    align-items="flex-end"
                  >
                    <Grid item>
                      <DropDownMenu
                        value={activeBreakdownFilter}
                        options={filterOptions}
                        onOptionUpdate={(
                          newBreakdownDisplayName,
                          filterSelection
                        ) => {
                          // Get breakdownVar (ex. race_and_ethnicity) from
                          // display name (ex. Race and Ethnicity)
                          const breakdownVar = Object.keys(
                            BREAKDOWN_VAR_DISPLAY_NAMES
                          ).find(
                            (key) =>
                              BREAKDOWN_VAR_DISPLAY_NAMES[
                                key as BreakdownVar
                              ] === newBreakdownDisplayName
                          );
                          if (breakdownVar) {
                            setActiveBreakdownVar(breakdownVar as BreakdownVar);
                          }
                          if (filterSelection) {
                            setActiveBreakdownFilter(filterSelection);
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </>
            )}
            <Divider />
            {queryResponse.dataIsMissing() && (
              <CardContent>
                <MissingDataAlert
                  dataName={metricConfig.fullCardTitleName}
                  breakdownString={
                    BREAKDOWN_VAR_DISPLAY_NAMES[activeBreakdownVar]
                  }
                  geoLevel={props.fips.getChildFipsTypeDisplayName()}
                />
              </CardContent>
            )}
            {!queryResponse.dataIsMissing() &&
              dataForActiveBreakdownFilter.length === 0 && (
                <CardContent>
                  <Alert severity="warning">
                    No data available for filter: <b>{activeBreakdownFilter}</b>
                  </Alert>
                </CardContent>
              )}
            {!queryResponse.dataIsMissing() &&
              dataForActiveBreakdownFilter.length !== 0 &&
              metricConfig && (
                <CardContent>
                  <Alert severity="info">
                    <Button
                      onClick={() => setSmallMultiplesDialogOpen(true)}
                      color="primary"
                      className={styles.SmallMarginButton}
                    >
                      Compare across{" "}
                      {
                        BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[
                          activeBreakdownVar
                        ]
                      }{" "}
                      groups
                    </Button>
                  </Alert>
                </CardContent>
              )}
            {metricConfig && (
              <CardContent>
                <ChoroplethMap
                  useSmallSampleMessage={
                    !queryResponse.dataIsMissing() &&
                    (props.variableConfig.surveyCollectedData || false)
                  }
                  signalListeners={signalListeners}
                  metric={metricConfig}
                  legendTitle={metricConfig.fullCardTitleName}
                  data={
                    listExpanded
                      ? highestRatesList.concat(lowestRatesList)
                      : dataForActiveBreakdownFilter
                  }
                  hideMissingDataTooltip={listExpanded}
                  legendData={dataForActiveBreakdownFilter}
                  hideLegend={
                    queryResponse.dataIsMissing() ||
                    dataForActiveBreakdownFilter.length <= 1
                  }
                  showCounties={props.fips.isUsa() ? false : true}
                  fips={props.fips}
                  scaleType="quantile"
                  geoData={geoData}
                />
                {!queryResponse.dataIsMissing() &&
                  dataForActiveBreakdownFilter.length > 1 && (
                    <HighestLowestList
                      variableConfig={props.variableConfig}
                      metricConfig={metricConfig}
                      listExpanded={listExpanded}
                      setListExpanded={setListExpanded}
                      highestRatesList={highestRatesList}
                      lowestRatesList={lowestRatesList}
                      fipsTypePluralDisplayName={props.fips.getPluralChildFipsTypeDisplayName()}
                    />
                  )}
              </CardContent>
            )}
          </>
        );
      }}
    </CardWrapper>
  );
}
