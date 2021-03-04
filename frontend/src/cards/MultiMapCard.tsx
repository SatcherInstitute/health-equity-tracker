import React from "react";
import { ChoroplethMap, ScaleType } from "../charts/ChoroplethMap";
import { Legend } from "../charts/Legend";
import { LegendThree } from "../charts/LegendThree";
import { LegendOther } from "../charts/LegendOther";
import { Fips } from "../data/utils/Fips";
import styles from "./Card.module.scss";
import MapBreadcrumbs from "./MapBreadcrumbs";
import { Grid } from "@material-ui/core";
import CardWrapper from "./CardWrapper";
import { MetricQuery } from "../data/query/MetricQuery";
import { MetricConfig } from "../data/config/MetricConfig";
import { CardContent } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import Divider from "@material-ui/core/Divider";
import { Breakdowns, BreakdownVar } from "../data/query/Breakdowns";
import RaceInfoPopoverContent from "./ui/RaceInfoPopoverContent";
import { Row } from "../data/utils/DatasetTypes";
import { exclude } from "../data/query/BreakdownFilter";
import { NON_HISPANIC } from "../data/utils/Constants";

const POSSIBLE_BREAKDOWNS: BreakdownVar[] = [
  "race_and_ethnicity",
  "age",
  "sex",
];

type LegendOptions = "individual" | "standard_one" | "standard_multi";

export interface MultiMapCardProps {
  key?: string;
  fips: Fips;
  metricConfig: MetricConfig;
  updateFipsCallback: (fips: Fips) => void;
  currentBreakdown: BreakdownVar | "all";
  legend: LegendOptions;
  scaleType: ScaleType;
}

// This wrapper ensures the proper key is set to create a new instance when required (when the props change and the state needs to be reset) rather than relying on the card caller.
export function MultiMapCard(props: MultiMapCardProps) {
  return (
    <MultiMapCardWithKey
      key={props.currentBreakdown + props.metricConfig.metricId}
      {...props}
    />
  );
}

function MultiMapCardWithKey(props: MultiMapCardProps) {
  const signalListeners: any = {
    click: (...args: any) => {},
  };

  const geographyBreakdown = props.fips.isUsa()
    ? Breakdowns.byState()
    : Breakdowns.byCounty().withGeoFilter(props.fips);

  const breakdowns = POSSIBLE_BREAKDOWNS.filter(
    (possibleBreakdown) =>
      props.currentBreakdown === possibleBreakdown ||
      props.currentBreakdown === "all"
  );
  console.log("breakdowns", breakdowns);

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
    <CardWrapper queries={queries}>
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

        const predicates: Array<(row: Row) => boolean> = [
          (row) => row[props.metricConfig.metricId] !== undefined,
          (row) => row[props.metricConfig.metricId] !== null,
        ];

        // Remove any row for which we find a filter that returns false.
        const filteredData = queryResponse.data.filter((row: Row) =>
          predicates.every((predicate) => predicate(row))
        );

        return (
          <>
            <CardContent>
              {queryResponse.dataIsMissing() && (
                <Alert severity="error">No data available</Alert>
              )}
              {!queryResponse.dataIsMissing() && filteredData.length === 0 && (
                <Alert severity="warning">No data available</Alert>
              )}
              {props.legend === "standard_one" && (
                <Grid container>
                  <Grid item>
                    <h3> Legend option 1</h3>
                    <Legend
                      metric={props.metricConfig}
                      legendTitle={props.metricConfig.fullCardTitleName}
                      legendData={filteredData}
                      scaleType={props.scaleType}
                    />
                  </Grid>
                  <Grid item>
                    <h3> Legend option 2</h3>
                    <LegendThree
                      metric={props.metricConfig}
                      legendTitle={props.metricConfig.fullCardTitleName}
                      legendData={filteredData}
                      scaleType={props.scaleType}
                    />
                  </Grid>
                  <Grid item>
                    <h3> Legend option 3</h3>
                    <LegendOther
                      metric={props.metricConfig}
                      legendTitle={props.metricConfig.fullCardTitleName}
                      legendData={filteredData}
                      scaleType={props.scaleType}
                    />
                  </Grid>
                  <Grid item>
                    <h3> Legend option 4</h3>
                    <LegendOther
                      metric={props.metricConfig}
                      legendTitle={props.metricConfig.fullCardTitleName}
                      legendData={filteredData}
                      scaleType={props.scaleType}
                      sameDotSize={true}
                    />
                  </Grid>
                </Grid>
              )}

              <Grid container>
                {breakdownValues.map((breakdownValue) => {
                  const dataForValue = filteredData.filter(
                    (row: Row) =>
                      row[currentlyDisplayedBreakdown] === breakdownValue
                  );
                  console.log("kkz-breakdownValue", breakdownValue);
                  console.log("kkz-dataForValue", dataForValue);
                  return (
                    <Grid item style={{ height: "300px", width: "300px" }}>
                      <b>{breakdownValue}</b>
                      {props.metricConfig && (
                        <ChoroplethMap
                          key={breakdownValue}
                          signalListeners={signalListeners}
                          metric={props.metricConfig}
                          legendTitle={props.metricConfig.fullCardTitleName}
                          legendData={
                            props.legend === "individual"
                              ? dataForValue
                              : filteredData
                          }
                          data={dataForValue}
                          hideLegend={
                            props.legend === "standard_one" ||
                            queryResponse.dataIsMissing() ||
                            dataForValue.length === 0
                          }
                          showCounties={props.fips.isUsa() ? false : true}
                          fips={props.fips}
                          fieldRange={
                            props.legend === "standard_one" ||
                            props.legend === "standard_multi"
                              ? queryResponse.getFieldRange(
                                  props.metricConfig.metricId
                                )
                              : undefined
                          }
                          hideActions={false}
                          scaleType={props.scaleType}
                        />
                      )}
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </>
        );
      }}
    </CardWrapper>
  );
}
