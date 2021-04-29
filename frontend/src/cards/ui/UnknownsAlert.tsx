import React from "react";
import { Alert } from "@material-ui/lab";
import { Row } from "../../data/utils/DatasetTypes";
import { MetricQueryResponse } from "../../data/query/MetricQuery";
import { MetricConfig } from "../../data/config/MetricConfig";
import { UNKNOWN, UNKNOWN_RACE } from "../../data/utils/Constants";
import styles from "../Card.module.scss";
import { CardContent } from "@material-ui/core";
import {
  BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE,
} from "../../data/query/Breakdowns";
import Divider from "@material-ui/core/Divider";

function UnknownsAlert(props: {
  queryResponse: MetricQueryResponse;
  metricConfig: MetricConfig;
  breakdownVar: BreakdownVar;
  displayType: string; // "chart" or "map" or "maps"
  pluralDisplayType?: Boolean;
  known: Boolean;
  noBottomDivider?: boolean;
}) {
  const unknowns = props.queryResponse
    .getValidRowsForField(props.metricConfig.metricId)
    .filter(
      (row: Row) =>
        row[props.breakdownVar] === UNKNOWN_RACE ||
        row[props.breakdownVar] === UNKNOWN
    );

  const breakdownVarDisplayName =
    BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[props.breakdownVar];

  if (unknowns.length === 1) {
    return (
      <>
        <CardContent className={styles.SmallMarginContent}>
          <Alert severity="warning">
            {unknowns[0][props.metricConfig.metricId]}
            {props.metricConfig.shortVegaLabel} reported unknown{" "}
            {breakdownVarDisplayName}. The {props.displayType} below{" "}
            {props.known ? "only " : ""}
            {props.pluralDisplayType ? "display" : "displays"} data for cases
            where {breakdownVarDisplayName} was{" "}
            {props.known ? "known" : "unknown"}.
          </Alert>
        </CardContent>
        {!props.noBottomDivider && <Divider />}
      </>
    );
  }
  return <></>;
}

export default UnknownsAlert;
