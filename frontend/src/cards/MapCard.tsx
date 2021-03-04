import React, { useState } from "react";
import { ChoroplethMap } from "../charts/ChoroplethMap";
import { Fips } from "../data/utils/Fips";
import styles from "./Card.module.scss";
import MapBreadcrumbs from "./MapBreadcrumbs";
import CardWrapper from "./CardWrapper";
import { MetricQuery } from "../data/query/MetricQuery";
import { MetricConfig } from "../data/config/MetricConfig";
import { CardContent } from "@material-ui/core";
import { Grid } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import Divider from "@material-ui/core/Divider";
import { Breakdowns, BreakdownVar } from "../data/query/Breakdowns";
import RaceInfoPopoverContent from "./ui/RaceInfoPopoverContent";
import { Row } from "../data/utils/DatasetTypes";
import { exclude } from "../data/query/BreakdownFilter";
import { NON_HISPANIC } from "../data/utils/Constants";
import Button from "@material-ui/core/Button";
import { MultiMapDialog } from "./ui/MultiMapDialog";
import Filter from "./ui/Filter";

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
  currentBreakdown: BreakdownVar | "all";
}

// This wrapper ensures the proper key is set to create a new instance when required (when the props change and the state needs to be reset) rather than relying on the card caller.
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

  // TODO - make sure the legends are all the same
  const [breakdownFilter, setBreakdownFilter] = useState<string>("");

  const geographyBreakdown = props.fips.isUsa()
    ? Breakdowns.byState()
    : Breakdowns.byCounty().withGeoFilter(props.fips);

  const breakdowns = POSSIBLE_BREAKDOWNS.filter(
    (possibleBreakdown) =>
      props.currentBreakdown === possibleBreakdown ||
      props.currentBreakdown === "all"
  );
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const descriptionElementRef = React.useRef<HTMLElement>(null);
  React.useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);
  const queries = breakdowns.map(
    (breakdown) =>
      new MetricQuery(
        props.metricConfig.metricId,
        geographyBreakdown
          .copy()
          .addBreakdown(
            breakdown,
            breakdown === "race_and_ethnicity"
              ? exclude(NON_HISPANIC)
              : undefined
          )
      )
  );

  return (
    <CardWrapper
      queries={queries}
      title={
        <>{`${
          props.metricConfig.fullCardTitleName
        } in ${props.fips.getFullDisplayName()}`}</>
      }
      infoPopover={
        ["race_and_ethnicity", "all"].includes(props.currentBreakdown) ? (
          <RaceInfoPopoverContent />
        ) : undefined
      }
    >
      {(queryResponses) => {
        const currentlyDisplayedBreakdown: BreakdownVar =
          props.currentBreakdown === "all"
            ? "race_and_ethnicity"
            : props.currentBreakdown;
        // Look up query at the same index as the breakdown.
        // TODO: we might consider returning a map of id to response from
        // CardWrapper so we don't need to rely on index order.
        const queryIndex = breakdowns.indexOf(currentlyDisplayedBreakdown);
        const queryResponse = queryResponses[queryIndex];
        const breakdownValues = queryResponse
          .getUniqueFieldValues(currentlyDisplayedBreakdown)
          .sort();
        if (breakdownFilter === "" || breakdownFilter === undefined) {
          setBreakdownFilter(breakdownValues[0]);
        }
        console.log("breakdownFilter", breakdownFilter);

        const validData = queryResponse.data.filter(
          (row: Row) =>
            row[props.metricConfig.metricId] !== undefined &&
            row[props.metricConfig.metricId] !== null
        );

        const predicates: Array<(row: Row) => boolean> = [
          (row) => row[props.metricConfig.metricId] !== undefined,
          (row) => row[props.metricConfig.metricId] !== null,
          (row: Row) => row[currentlyDisplayedBreakdown] === breakdownFilter,
        ];

        // Remove any row for which we find a filter that returns false.
        const filteredData = queryResponse.data.filter((row: Row) =>
          predicates.every((predicate) => predicate(row))
        );
        console.log(queryResponse.data);
        console.log(filteredData);

        let filterOptions: any = {};
        if (["race_and_ethnicity", "all"].includes(props.currentBreakdown)) {
          filterOptions["race_and_ethnicity"] = breakdownValues;
        }
        if (["age", "all"].includes(props.currentBreakdown)) {
          filterOptions["age"] = [];
        }
        if (["sex", "all"].includes(props.currentBreakdown)) {
          filterOptions["sex"] = [];
        }

        return (
          <>
            <MultiMapDialog
              fips={props.fips}
              metricConfig={props.metricConfig}
              validData={validData}
              currentlyDisplayedBreakdown={currentlyDisplayedBreakdown}
              handleClose={handleClose}
              open={open}
              breakdownValues={breakdownValues}
              queryResponse={queryResponse}
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
                <CardContent
                  className={styles.SmallMarginContent}
                  style={{ textAlign: "left" }}
                >
                  <Grid
                    container
                    justify="space-between"
                    align-items="flex-end"
                  >
                    <Grid item>
                      <Filter
                        value={breakdownFilter} // TODO
                        options={filterOptions}
                        onOptionUpdate={(option) => setBreakdownFilter(option)}
                      />
                    </Grid>
                    <Grid item>
                      <Button onClick={handleClickOpen}>
                        show full breakdown by {currentlyDisplayedBreakdown}
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </>
            )}
            <Divider />
            <CardContent>
              {queryResponse.dataIsMissing() && (
                <Alert severity="error">No data available</Alert>
              )}
              {!queryResponse.dataIsMissing() && filteredData.length === 0 && (
                <Alert severity="warning">
                  No data available for filter: <b>{breakdownFilter}</b>
                </Alert>
              )}
              {!queryResponse.dataIsMissing() &&
                filteredData.length !== 0 &&
                props.metricConfig && (
                  <Alert severity="info">
                    Note that legend changes between races. To see races with
                    common legend, use show all breakdowns button.
                  </Alert>
                )}
              {props.metricConfig && (
                <ChoroplethMap
                  signalListeners={signalListeners}
                  metric={props.metricConfig}
                  legendTitle={props.metricConfig.fullCardTitleName}
                  data={filteredData}
                  hideLegend={
                    queryResponse.dataIsMissing() || filteredData.length === 0
                  }
                  showCounties={props.fips.isUsa() ? false : true}
                  fips={props.fips}
                  scaleType="quantile"
                />
              )}
            </CardContent>
          </>
        );
      }}
    </CardWrapper>
  );
}
