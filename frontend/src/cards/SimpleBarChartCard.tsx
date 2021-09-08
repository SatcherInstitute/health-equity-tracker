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
import { VariableConfig } from "../data/config/MetricConfig";
import CardWrapper from "./CardWrapper";
import { exclude } from "../data/query/BreakdownFilter";
import { NON_HISPANIC } from "../data/utils/Constants";
import MissingDataAlert from "./ui/MissingDataAlert";

export interface SimpleBarChartCardProps {
  key?: string;
  breakdownVar: BreakdownVar;
  variableConfig: VariableConfig;
  fips: Fips;
}

// This wrapper ensures the proper key is set to create a new instance when
// required rather than relying on the card caller.
export function SimpleBarChartCard(props: SimpleBarChartCardProps) {
  return (
    <SimpleBarChartCardWithKey
      key={props.variableConfig.variableId + props.breakdownVar}
      {...props}
    />
  );
}

function SimpleBarChartCardWithKey(props: SimpleBarChartCardProps) {
  const metricConfig = props.variableConfig.metrics["per100k"];

  const breakdowns = Breakdowns.forFips(props.fips).addBreakdown(
    props.breakdownVar,
    exclude(NON_HISPANIC)
  );

  const query = new MetricQuery([metricConfig.metricId], breakdowns);

  function getTitleText() {
    return `${metricConfig.fullCardTitleName} By ${
      BREAKDOWN_VAR_DISPLAY_NAMES[props.breakdownVar]
    } In ${props.fips.getFullDisplayName()}`;
  }
  function CardTitle() {
    return <>{getTitleText()}</>;
  }

  return (
    <CardWrapper queries={[query]} title={<CardTitle />}>
      {([queryResponse]) => {
        return (
          <>
            {queryResponse.shouldShowMissingDataMessage([
              metricConfig.metricId,
            ]) && (
              <CardContent className={styles.Breadcrumbs}>
                <MissingDataAlert
                  dataName={metricConfig.fullCardTitleName}
                  breakdownString={
                    BREAKDOWN_VAR_DISPLAY_NAMES[props.breakdownVar]
                  }
                  geoLevel={props.fips.getFipsTypeDisplayName()}
                />
              </CardContent>
            )}
            {!queryResponse.shouldShowMissingDataMessage([
              metricConfig.metricId,
            ]) && (
              <CardContent className={styles.Breadcrumbs}>
                <SimpleHorizontalBarChart
                  data={queryResponse.getValidRowsForField(
                    metricConfig.metricId
                  )}
                  breakdownVar={props.breakdownVar}
                  metric={metricConfig}
                  showLegend={false}
                  filename={getTitleText()}
                />
              </CardContent>
            )}
          </>
        );
      }}
    </CardWrapper>
  );
}
