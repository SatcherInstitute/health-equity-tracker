import React from "react";
import { DisparityBarChart } from "../charts/DisparityBarChart";
import styles from "./Card.module.scss";
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
import MissingDataAlert from "./ui/MissingDataAlert";
import { usePopover } from "../utils/usePopover";
import { exclude } from "../data/query/BreakdownFilter";
import { NON_HISPANIC, TOTAL } from "../data/utils/Constants";

export interface DisparityBarChartCardProps {
  key?: string;
  breakdownVar: BreakdownVar;
  metricConfig: MetricConfig;
  fips: Fips;
}

// This wrapper ensures the proper key is set to create a new instance when
// required rather than relying on the card caller.
export function DisparityBarChartCard(props: DisparityBarChartCardProps) {
  return (
    <DisparityBarChartCardWithKey
      key={props.metricConfig.metricId + props.breakdownVar}
      {...props}
    />
  );
}

function DisparityBarChartCardWithKey(props: DisparityBarChartCardProps) {
  const breakdowns = Breakdowns.forFips(props.fips).addBreakdown(
    props.breakdownVar,
    exclude(TOTAL, NON_HISPANIC)
  );

  // Population Comparison Metric is required for the Disparity Bar Chart.
  const query = new MetricQuery(
    [
      props.metricConfig.metricId,
      props.metricConfig.populationComparisonMetric!.metricId,
    ],
    breakdowns
  );

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
                <DisparityBarChart
                  data={queryResponse.data}
                  lightMetric={props.metricConfig.populationComparisonMetric!}
                  darkMetric={props.metricConfig}
                  breakdownVar={props.breakdownVar}
                  metricDisplayName={props.metricConfig.shortVegaLabel}
                />
              </CardContent>
            )}
          </>
        );
      }}
    </CardWrapper>
  );
}
