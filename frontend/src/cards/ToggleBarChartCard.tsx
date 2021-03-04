import React, { useState } from "react";
import { DisparityBarChart } from "../charts/DisparityBarChart";
import styles from "./Card.module.scss";
import { Alert } from "@material-ui/lab";
import { CardContent } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import { SimpleHorizontalBarChart } from "../charts/SimpleHorizontalBarChart";
import { Fips } from "../data/utils/Fips";
import {
  Breakdowns,
  BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES,
} from "../data/query/Breakdowns";
import { MetricQuery } from "../data/query/MetricQuery";
import {
  MetricConfig,
  MetricId,
  VariableConfig,
} from "../data/config/MetricConfig";
import CardWrapper from "./CardWrapper";
import RaceInfoPopoverContent from "./ui/RaceInfoPopoverContent";
import DisparityInfoPopover from "./ui/DisparityInfoPopover";
import { usePopover } from "../utils/usePopover";
import { exclude } from "../data/query/BreakdownFilter";
import { NON_HISPANIC, TOTAL } from "../data/utils/Constants";

const VALID_METRIC_TYPES = ["pct_share", "per100k"];
export interface ToggleBarChartCardProps {
  key?: string;
  breakdownVar: BreakdownVar;
  variableConfig: VariableConfig;
  fips: Fips;
}

// This wrapper ensures the proper key is set to create a new instance when required rather than relying on the card caller.
export function ToggleBarChartCard(props: ToggleBarChartCardProps) {
  return (
    <ToggleBarChartCardWithKey
      key={props.variableConfig.variableId + props.breakdownVar}
      {...props}
    />
  );
}

function ToggleBarChartCardWithKey(props: ToggleBarChartCardProps) {
  const [metricConfig, setMetricConfig] = useState<MetricConfig>(
    props.variableConfig.metrics["pct_share"] ||
      props.variableConfig.metrics["per100k"]
  );

  const breakdowns = Breakdowns.forFips(props.fips).addBreakdown(
    props.breakdownVar,
    exclude(TOTAL, NON_HISPANIC)
  );

  // TODO - what if there are no valid types at all? What do we show?
  const validDisplayMetricConfigs: MetricConfig[] = Object.values(
    props.variableConfig.metrics
  ).filter((metricConfig) => VALID_METRIC_TYPES.includes(metricConfig.type));

  let metricIds: MetricId[] = [];
  Object.values(props.variableConfig.metrics).forEach(
    (metricConfig: MetricConfig) => {
      metricIds.push(metricConfig.metricId);
      if (metricConfig.populationComparisonMetric) {
        metricIds.push(metricConfig.populationComparisonMetric.metricId);
      }
    }
  );

  const query = new MetricQuery(metricIds, breakdowns);

  function CardTitle() {
    const popover = usePopover();

    return (
      <>
        <DisparityInfoPopover popover={popover} />
        <Button onClick={popover.open} className={styles.TermInfoButton}>
          Disparities
        </Button>{" "}
        in {metricConfig.fullCardTitleName} by{" "}
        <b>{BREAKDOWN_VAR_DISPLAY_NAMES[props.breakdownVar]}</b> in{" "}
        {props.fips.getFullDisplayName()}
      </>
    );
  }

  // TODO - we want to bold the breakdown name in the card title
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
              metricConfig.metricId,
            ]) && (
              <CardContent className={styles.Breadcrumbs}>
                <Alert severity="warning">
                  Missing data means that we don't know the full story.
                </Alert>
              </CardContent>
            )}
            {!queryResponse.shouldShowMissingDataMessage([
              metricConfig.metricId,
            ]) &&
              validDisplayMetricConfigs.length > 1 && (
                <CardContent className={styles.Breadcrumbs}>
                  <ToggleButtonGroup
                    value={metricConfig.type}
                    exclusive
                    onChange={(e, metricType) => {
                      if (metricType !== null) {
                        setMetricConfig(
                          props.variableConfig.metrics[metricType]
                        );
                      }
                    }}
                  >
                    {validDisplayMetricConfigs.map((metricConfig) => (
                      <ToggleButton value={metricConfig.type}>
                        {metricConfig.type === "pct_share" && " vs. Population"}
                        {metricConfig.type === "per100k" &&
                          "per 100,000 people"}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </CardContent>
              )}
            {!queryResponse.shouldShowMissingDataMessage([
              metricConfig.metricId,
            ]) && (
              <CardContent className={styles.Breadcrumbs}>
                {metricConfig.type === "pct_share" && (
                  <DisparityBarChart
                    data={queryResponse.data}
                    thickMetric={metricConfig.populationComparisonMetric!}
                    thinMetric={metricConfig}
                    breakdownVar={props.breakdownVar}
                    metricDisplayName={metricConfig.shortVegaLabel}
                  />
                )}
                {metricConfig.type === "per100k" && (
                  <SimpleHorizontalBarChart
                    data={queryResponse.data}
                    breakdownVar={props.breakdownVar}
                    metric={metricConfig}
                    showLegend={false}
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
