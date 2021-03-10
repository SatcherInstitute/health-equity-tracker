import React from "react";
import { SimpleHorizontalBarChart } from "../charts/SimpleHorizontalBarChart";
import styles from "./Card.module.scss";
import { Alert } from "@material-ui/lab";
import { CardContent } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import { Fips } from "../data/utils/Fips";
import {
  Breakdowns,
  BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES,
} from "../data/query/Breakdowns";
import { MetricQuery } from "../data/query/MetricQuery";
import { MetricConfig } from "../data/config/MetricConfig";
import CardWrapper from "./CardWrapper";
import RaceInfoPopoverContent from "./ui/RaceInfoPopoverContent";
import DisparityInfoPopover from "./ui/DisparityInfoPopover";
import { usePopover } from "../utils/usePopover";
import { exclude } from "../data/query/BreakdownFilter";
import { NON_HISPANIC, TOTAL } from "../data/utils/Constants";

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
    exclude(TOTAL, NON_HISPANIC)
  );

  const query = new MetricQuery([props.metricConfig.metricId], breakdowns);

  function CardTitle() {
    const popover = usePopover();

    return (
      <>
        <DisparityInfoPopover popover={popover} />
        <Button onClick={popover.open} className={styles.TermInfoButton}>
          Disparities
        </Button>{" "}
        in {props.metricConfig.fullCardTitleName} by{" "}
        <b>{BREAKDOWN_VAR_DISPLAY_NAMES[props.breakdownVar]}</b> in{" "}
        {props.fips.getFullDisplayName()}
      </>
    );
  }

  return (
    <CardWrapper
      queries={[query]}
      title={<CardTitle />}
      infoPopover={
        props.breakdownVar === "race_and_ethnicity" ? (
          <RaceInfoPopoverContent />
        ) : undefined
      }
    >
      {([queryResponse]) => {
        return (
          <>
            {queryResponse.shouldShowMissingDataMessage([
              props.metricConfig.metricId,
            ]) && (
              <CardContent className={styles.Breadcrumbs}>
                <Alert severity="warning">
                  Missing data means that we don't know the full story.
                </Alert>
              </CardContent>
            )}
            {!queryResponse.shouldShowMissingDataMessage([
              props.metricConfig.metricId,
            ]) && (
              <CardContent className={styles.Breadcrumbs}>
                <SimpleHorizontalBarChart
                  data={queryResponse.data}
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
