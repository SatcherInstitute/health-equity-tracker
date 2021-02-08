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
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import Alert from "@material-ui/lab/Alert";
import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { Breakdowns, BreakdownVar } from "../data/query/Breakdowns";
import RaceInfoPopoverContent from "./ui/RaceInfoPopoverContent";
import { usePopover } from "../utils/usePopover";
import { Row } from "../data/utils/DatasetTypes";
import { exclude } from "../data/query/BreakdownFilter";
import { NON_HISPANIC } from "../data/utils/Constants";

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
  const popover = usePopover();

  const geographyBreakdown = props.fips.isUsa()
    ? Breakdowns.byState()
    : Breakdowns.byCounty().withGeoFilter(props.fips);

  const breakdowns = POSSIBLE_BREAKDOWNS.filter(
    (possibleBreakdown) =>
      props.currentBreakdown === possibleBreakdown ||
      props.currentBreakdown === "all"
  );

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
        if (breakdownFilter === "") {
          setBreakdownFilter(breakdownValues[0]);
        }

        const predicates: Array<(row: Row) => boolean> = [
          (row) => row[props.metricConfig.metricId] !== undefined,
          (row) => row[props.metricConfig.metricId] !== null,
          (row: Row) => row[currentlyDisplayedBreakdown] === breakdownFilter,
        ];

        // Remove any row for which we find a filter that returns false.
        const mapData = queryResponse.data.filter((row: Row) =>
          predicates.every((predicate) => predicate(row))
        );

        return (
          <>
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
                  <Grid container>
                    <Grid item style={{ lineHeight: "64px", fontSize: "20px" }}>
                      Filtered by:
                    </Grid>
                    <Grid item>
                      {/* TODO- Clean up UI */}
                      <List component="nav">
                        <ListItem button onClick={popover.open}>
                          <ListItemText primary={breakdownFilter} />
                          <ArrowDropDownIcon />
                        </ListItem>
                      </List>
                      {/* TODO - Align this with the mocks */}
                      <Menu
                        anchorEl={popover.anchor}
                        keepMounted
                        open={popover.isOpen}
                        onClose={popover.close}
                      >
                        {["age", "all"].includes(props.currentBreakdown) && (
                          <MenuItem disabled={true}>Age [unavailable]</MenuItem>
                        )}
                        {["sex", "all"].includes(props.currentBreakdown) && (
                          <MenuItem disabled={true}>Sex [unavailable]</MenuItem>
                        )}
                        {["race_and_ethnicity", "all"].includes(
                          props.currentBreakdown
                        ) && (
                          <>
                            <MenuItem disabled={true}>Races</MenuItem>
                            {breakdownValues.map((option) => (
                              <MenuItem
                                key={option}
                                onClick={(e) => {
                                  popover.close();
                                  setBreakdownFilter(option);
                                }}
                              >
                                {option}
                              </MenuItem>
                            ))}
                          </>
                        )}
                      </Menu>
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
              {props.metricConfig && (
                <ChoroplethMap
                  signalListeners={signalListeners}
                  metric={props.metricConfig}
                  legendTitle={props.metricConfig.fullCardTitleName}
                  data={mapData}
                  hideLegend={queryResponse.dataIsMissing()}
                  showCounties={props.fips.isUsa() ? false : true}
                  fips={props.fips}
                />
              )}
            </CardContent>
          </>
        );
      }}
    </CardWrapper>
  );
}
