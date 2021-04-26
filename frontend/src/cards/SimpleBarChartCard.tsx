import React from "react";
import { SimpleHorizontalBarChart } from "../charts/SimpleHorizontalBarChart";
import styles from "./Card.module.scss";
import { CardContent } from "@material-ui/core";
import { Fips } from "../data/utils/Fips";
import {
  Breakdowns,
  BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES,
} from "../data/query/Breakdowns";
import { MetricQuery } from "../data/query/MetricQuery";
import { MetricConfig } from "../data/config/MetricConfig";
import CardWrapper from "./CardWrapper";
import { exclude } from "../data/query/BreakdownFilter";
import { NON_HISPANIC } from "../data/utils/Constants";
import MissingDataAlert from "./ui/MissingDataAlert";

export interface SimpleBarChartCardProps {
  key?: string;
  breakdownVar: BreakdownVar;
  metricConfig: MetricConfig;
  fips: Fips;
}

// This wrapper ensures the proper key is set to create a new instance when
// required rather than relying on the card caller.
export function SimpleBarChartCard(props: SimpleBarChartCardProps) {
  return (
    <SimpleBarChartCardWithKey
      key={props.metricConfig.metricId + props.breakdownVar}
      {...props}
    />
  );
}

function SimpleBarChartCardWithKey(props: SimpleBarChartCardProps) {
  const breakdowns = Breakdowns.forFips(props.fips).addBreakdown(
    props.breakdownVar,
    exclude(NON_HISPANIC)
  );

  const query = new MetricQuery([props.metricConfig.metricId], breakdowns);

  function CardTitle() {
    return (
      <>
        Disparities in {props.metricConfig.fullCardTitleName} by{" "}
        <b>{BREAKDOWN_VAR_DISPLAY_NAMES[props.breakdownVar]}</b> in{" "}
        {props.fips.getFullDisplayName()}
      </>
    );
  }

  return (
    <CardWrapper queries={[query]} title={<CardTitle />}>
      {([queryResponse]) => {
        return (
          <>
            {queryResponse.shouldShowMissingDataMessage([
              props.metricConfig.metricId,
            ]) && (
              <CardContent className={styles.Breadcrumbs}>
                <MissingDataAlert
                  dataName={props.metricConfig.fullCardTitleName}
                  breakdownString={
                    BREAKDOWN_VAR_DISPLAY_NAMES[props.breakdownVar]
                  }
                />
              </CardContent>
            )}
            {!queryResponse.shouldShowMissingDataMessage([
              props.metricConfig.metricId,
            ]) && (
              <CardContent className={styles.Breadcrumbs}>
                <SimpleHorizontalBarChart
                  data={queryResponse.getValidRowsForField(
                    props.metricConfig.metricId
                  )}
                  breakdownVar={props.breakdownVar}
                  metric={props.metricConfig}
                  showLegend={false}
                />
              </CardContent>
            )}
          </>
        );
      }}
    </CardWrapper>
  );
}
