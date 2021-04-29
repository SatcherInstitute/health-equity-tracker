import React from "react";
import { Alert } from "@material-ui/lab";
import { Row } from "../../data/utils/DatasetTypes";
import { MetricQueryResponse } from "../../data/query/MetricQuery";
import { MetricConfig } from "../../data/config/MetricConfig";
import { UNKNOWN, UNKNOWN_RACE } from "../../data/utils/Constants";
import styles from "../Card.module.scss";
import { CardContent, Divider } from "@material-ui/core";
import {
  BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE,
} from "../../data/query/Breakdowns";

function UnknownsAlert(props: {
  queryResponse: MetricQueryResponse;
  metricConfig: MetricConfig;
  breakdownVar: BreakdownVar;
  displayType: string; // "chart" or "map"
  known: Boolean;
}) {
  const unknowns = props.queryResponse
    .getValidRowsForField(props.metricConfig.metricId)
    .filter(
      (row: Row) =>
        row[props.breakdownVar] === UNKNOWN_RACE ||
        row[props.breakdownVar] === UNKNOWN
    );
  if (unknowns.length === 0) {
    return <></>;
  }

  const breakdownVarDisplayName =
    BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[props.breakdownVar];

  const cardHelperText = props.known
    ? `The ${props.displayType} below only displays data for cases where ${breakdownVarDisplayName} was known.`
    : `The ${props.displayType} below displays data for cases where ${breakdownVarDisplayName} was unknown.`;

  const percentageUnknown = unknowns[0][props.metricConfig.metricId];

  return (
    <>
      <CardContent className={styles.SmallMarginContent}>
        <Alert severity="warning">
          {percentageUnknown}
          {props.metricConfig.shortVegaLabel} reported unknown{" "}
          {breakdownVarDisplayName}.{" "}
          {percentageUnknown !== 100 && cardHelperText}
        </Alert>
      </CardContent>
      <Divider />
    </>
  );
}

export default UnknownsAlert;
