import React from "react";
import { CardContent } from "@material-ui/core";
import { ChoroplethMap } from "../charts/ChoroplethMap";
import { Fips } from "../data/utils/Fips";
import { MetricConfig } from "../data/config/MetricConfig";
import MapBreadcrumbs from "./ui/MapBreadcrumbs";
import { Row } from "../data/utils/DatasetTypes";
import CardWrapper from "./CardWrapper";
import { MetricQuery } from "../data/query/MetricQuery";
import MissingDataAlert from "./ui/MissingDataAlert";
import {
  Breakdowns,
  BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES,
} from "../data/query/Breakdowns";
import { UNKNOWN, UNKNOWN_RACE } from "../data/utils/Constants";
import styles from "./Card.module.scss";
import Divider from "@material-ui/core/Divider";
import Alert from "@material-ui/lab/Alert";

export interface UnknownsMapCardProps {
  // Metric the map will evaluate for unknowns
  metricConfig: MetricConfig;
  // Breakdown value to evaluate for unknowns
  currentBreakdown: BreakdownVar;
  // Geographic region of maps
  fips: Fips;
  // Updates the madlib
  updateFipsCallback: (fips: Fips) => void;
}

// This wrapper ensures the proper key is set to create a new instance when required (when
// the props change and the state needs to be reset) rather than relying on the card caller.
export function UnknownsMapCard(props: UnknownsMapCardProps) {
  return (
    <UnknownsMapCardWithKey
      key={props.currentBreakdown + props.metricConfig.metricId}
      {...props}
    />
  );
}

function UnknownsMapCardWithKey(props: UnknownsMapCardProps) {
  const signalListeners: any = {
    click: (...args: any) => {
      const clickedData = args[1];
      props.updateFipsCallback(new Fips(clickedData.id));
    },
  };

  // TODO Debug why onlyInclude(UNKNOWN, UNKNOWN_RACE) isn't working
  const breakdowns = Breakdowns.forParentFips(props.fips).addBreakdown(
    props.currentBreakdown
  );

  // Population Comparison Metric is required
  const query = new MetricQuery(
    [
      props.metricConfig.metricId,
      props.metricConfig.populationComparisonMetric!.metricId,
    ],
    breakdowns
  );

  return (
    <CardWrapper
      queries={[query]}
      title={
        <>{`Unknown ${
          BREAKDOWN_VAR_DISPLAY_NAMES[props.currentBreakdown]
        } for ${props.metricConfig.fullCardTitleName}`}</>
      }
    >
      {([queryResponse]) => {
        const unknowns = queryResponse
          .getValidRowsForField(props.currentBreakdown)
          .filter(
            (row: Row) =>
              row[props.currentBreakdown] === UNKNOWN_RACE ||
              row[props.currentBreakdown] === UNKNOWN
          );

        return (
          <>
            <CardContent className={styles.SmallMarginContent}>
              <MapBreadcrumbs
                fips={props.fips}
                updateFipsCallback={props.updateFipsCallback}
              />
            </CardContent>
            <Divider />
            <CardContent>
              {queryResponse.dataIsMissing() && (
                <MissingDataAlert
                  dataName={props.metricConfig.fullCardTitleName}
                  breakdownString={
                    BREAKDOWN_VAR_DISPLAY_NAMES[props.currentBreakdown]
                  }
                />
              )}
              {!queryResponse.dataIsMissing() && unknowns.length === 0 && (
                <Alert severity="info">
                  No unknown values for{" "}
                  {BREAKDOWN_VAR_DISPLAY_NAMES[props.currentBreakdown]} reported
                  in this dataset.
                </Alert>
              )}
              {!queryResponse.dataIsMissing() && unknowns.length > 0 && (
                <ChoroplethMap
                  signalListeners={signalListeners}
                  metric={props.metricConfig}
                  legendTitle={props.metricConfig.fullCardTitleName}
                  data={unknowns}
                  showCounties={props.fips.isUsa() ? false : true}
                  fips={props.fips}
                  scaleType="quantile"
                  scaleColorScheme="warmgreys"
                  hideLegend={
                    queryResponse.dataIsMissing() || unknowns.length <= 1
                  }
                />
              )}
            </CardContent>
          </>
        );
      }}
    </CardWrapper>
  );
}
