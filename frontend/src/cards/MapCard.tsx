import React, { useState } from "react";
import Alert from "@material-ui/lab/Alert";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import { CardContent } from "@material-ui/core";
import { Grid } from "@material-ui/core";
import styles from "./Card.module.scss";
import CardWrapper from "./CardWrapper";
import DropDownMenu from "./ui/DropDownMenu";
import MapBreadcrumbs from "./ui/MapBreadcrumbs";
import MissingDataAlert from "./ui/MissingDataAlert";
import { Breakdowns, BreakdownVar } from "../data/query/Breakdowns";
import { ChoroplethMap } from "../charts/ChoroplethMap";
import { Fips } from "../data/utils/Fips";
import { MetricQuery } from "../data/query/MetricQuery";
import { MetricConfig } from "../data/config/MetricConfig";
import { MultiMapDialog } from "./ui/MultiMapDialog";
import { Row } from "../data/utils/DatasetTypes";
import { exclude } from "../data/query/BreakdownFilter";
import { useAutoFocusDialog } from "../utils/useAutoFocusDialog";
import {
  NON_HISPANIC,
  UNKNOWN,
  UNKNOWN_RACE,
  ALL,
} from "../data/utils/Constants";
import {
  BREAKDOWN_VAR_DISPLAY_NAMES,
  BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE,
} from "../data/query/Breakdowns";

const POSSIBLE_BREAKDOWNS: BreakdownVar[] = [
  "race_and_ethnicity",
  "age",
  "sex",
];

export interface MapCardProps {
  key?: string;
  fips: Fips;
  metricConfig: MetricConfig;
  updateFipsCallback: (fips: Fips) => void;
  currentBreakdown: BreakdownVar;
}

// This wrapper ensures the proper key is set to create a new instance when required (when
// the props change and the state needs to be reset) rather than relying on the card caller.
export function MapCard(props: MapCardProps) {
  return (
    <MapCardWithKey
      key={props.currentBreakdown + props.metricConfig.metricId}
      {...props}
    />
  );
}

function MapCardWithKey(props: MapCardProps) {
  const signalListeners: any = {
    click: (...args: any) => {
      const clickedData = args[1];
      props.updateFipsCallback(new Fips(clickedData.id));
    },
  };

  const [activeBreakdownFilter, setActiveBreakdownFilter] = useState<string>(
    ""
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
        props.metricConfig.metricId,
        geographyBreakdown
          .copy()
          .addBreakdown(
            breakdown,
            breakdown === "race_and_ethnicity"
              ? exclude(NON_HISPANIC, UNKNOWN, UNKNOWN_RACE)
              : undefined
          )
      )
  );

  return (
    <CardWrapper
      queries={queries}
      title={<>{props.metricConfig.fullCardTitleName}</>}
    >
      {(queryResponses, metadata) => {
        // Look up query at the same index as the breakdown.
        // TODO: we might consider returning a map of id to response from
        // CardWrapper so we don't need to rely on index order.
        const queryResponse =
          queryResponses[requestedBreakdowns.indexOf(activeBreakdownVar)];
        const breakdownValues = queryResponse
          .getUniqueFieldValues(activeBreakdownVar)
          .sort();
        if (
          activeBreakdownFilter === "" ||
          activeBreakdownFilter === undefined
        ) {
          setActiveBreakdownFilter(ALL || breakdownValues[0]);
        }

        const dataForActiveBreakdownFilter = queryResponse
          .getValidRowsForField(props.metricConfig.metricId)
          .filter(
            (row: Row) => row[activeBreakdownVar] === activeBreakdownFilter
          );

        // Create and populate a map of breakdown display name to options
        let filterOptions: Record<string, string[]> = {};
        const getBreakdownOptions = (breakdown: BreakdownVar) => {
          return queryResponses[requestedBreakdowns.indexOf(breakdown)]
            .getUniqueFieldValues(breakdown)
            .sort();
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
              metricConfig={props.metricConfig}
              data={queryResponse.getValidRowsForField(
                props.metricConfig.metricId
              )}
              breakdown={activeBreakdownVar}
              handleClose={() => setSmallMultiplesDialogOpen(false)}
              open={smallMultiplesDialogOpen}
              breakdownValues={breakdownValues}
              fieldRange={queryResponse.getFieldRange(
                props.metricConfig.metricId
              )}
              queryResponses={queryResponses} // TODO
              metadata={metadata}
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
                          // Get breakdownVar (ex. race_and_ethnicity) from display name (ex. Race and Ethnicity)
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
                  dataName={props.metricConfig.fullCardTitleName}
                  breakdownString={
                    BREAKDOWN_VAR_DISPLAY_NAMES[activeBreakdownVar]
                  }
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
              props.metricConfig && (
                <CardContent>
                  <Alert severity="info">
                    <Button
                      onClick={() => setSmallMultiplesDialogOpen(true)}
                      color="primary"
                      className={styles.SmallMarginButton}
                    >
                      Click to view a breakdown of all{" "}
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
            {props.metricConfig && (
              <CardContent>
                <ChoroplethMap
                  signalListeners={signalListeners}
                  metric={props.metricConfig}
                  legendTitle={props.metricConfig.fullCardTitleName}
                  data={dataForActiveBreakdownFilter}
                  hideLegend={
                    queryResponse.dataIsMissing() ||
                    dataForActiveBreakdownFilter.length <= 1
                  }
                  showCounties={props.fips.isUsa() ? false : true}
                  fips={props.fips}
                  scaleType="quantile"
                />
              </CardContent>
            )}
          </>
        );
      }}
    </CardWrapper>
  );
}
