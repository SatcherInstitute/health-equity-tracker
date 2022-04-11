import React from "react";
import { Alert } from "@material-ui/lab";
import { Row } from "../../data/utils/DatasetTypes";
import { MetricQueryResponse } from "../../data/query/MetricQuery";
import { MetricConfig } from "../../data/config/MetricConfig";
import {
  UNKNOWN,
  UNKNOWN_RACE,
  UNKNOWN_ETHNICITY,
} from "../../data/utils/Constants";
import styles from "../Card.module.scss";
import { CardContent, Divider } from "@material-ui/core";
import {
  BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE,
} from "../../data/query/Breakdowns";
import { Fips } from "../../data/utils/Fips";
import { VisualizationType } from "../../charts/utils";

export const RACE_OR_ETHNICITY = "race or ethnicity";

interface UnknownsAlertProps {
  queryResponse: MetricQueryResponse;
  metricConfig: MetricConfig;
  breakdownVar: BreakdownVar;
  displayType: VisualizationType;
  known: Boolean;
  overrideAndWithOr?: Boolean;
  raceEthDiffMap?: Boolean;
  noDemographicInfoMap?: Boolean;
  showingVisualization?: Boolean;
  fips: Fips;
  jumpToData?: Function;
}

function UnknownsAlert(props: UnknownsAlertProps) {
  const unknowns = props.queryResponse
    .getValidRowsForField(props.metricConfig.metricId)
    .filter(
      (row: Row) =>
        row[props.breakdownVar] === UNKNOWN_RACE ||
        row[props.breakdownVar] === UNKNOWN ||
        row[props.breakdownVar] === UNKNOWN_ETHNICITY
    );

  const breakdownVarDisplayName =
    BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[props.breakdownVar];

  if (unknowns.length === 0) {
    return <></>;
  }
  const raceEthnicityDiff =
    unknowns.length === 2 &&
    unknowns[0][props.metricConfig.metricId] !==
      unknowns[1][props.metricConfig.metricId];

  const cardHelperText = props.known
    ? `The ${
        props.displayType
      } below only displays data for cases where ${breakdownVarDisplayName} ${
        props.overrideAndWithOr ? "were both" : "was"
      } known.`
    : `The ${props.displayType} below displays data for cases where ${
        props.overrideAndWithOr
          ? ` either ${RACE_OR_ETHNICITY}`
          : breakdownVarDisplayName
      } was unknown.`;

  const raceEthDiffMapText = `In cases where race and ethnicity are reported
    separately, the map shows the higher of the two metrics.`;

  const percentageUnknown = unknowns[0][props.metricConfig.metricId];

  const diffRaceEthnicityText = raceEthnicityDiff
    ? `This state reports race and ethnicity separately.
    ${unknowns[0][props.metricConfig.metricId]}${
        props.metricConfig.shortLabel
      } reported an
    ${unknowns[0][props.breakdownVar].toLowerCase()} and
    ${unknowns[1][props.metricConfig.metricId]}${
        props.metricConfig.knownBreakdownComparisonMetric!.shortLabel
      } reported an
    ${unknowns[1][props.breakdownVar].toLowerCase()}.`
    : "";

  const showCardHelperText =
    /* for DISPARITY CHART  */ (props.displayType === "chart" &&
      percentageUnknown !== 100 &&
      !props.noDemographicInfoMap) ||
    /* for UNKNOWNS MAP */ (percentageUnknown !== 100 &&
      percentageUnknown !== 0 &&
      props.showingVisualization);
  /* for AGE-ADJUSTMENT TABLE */
  const showDataGapsRisk = props.displayType === "table";

  // In the case we have unknowns for race and ethnicity reported separately,
  // show the higher one on the map
  return raceEthnicityDiff ? (
    <>
      <CardContent className={styles.SmallMarginContent}>
        <Alert severity="warning" role="note">
          {diffRaceEthnicityText}
        </Alert>
      </CardContent>
      <Divider />
    </>
  ) : (
    <>
      <CardContent className={styles.SmallMarginContent}>
        <Alert severity="warning" role="note">
          {percentageUnknown}
          {props.metricConfig.knownBreakdownComparisonMetric!.shortLabel}
          {" in "}
          {props.fips.getDisplayName()}
          {" reported "}
          {props.overrideAndWithOr && "an"} unknown{" "}
          {props.overrideAndWithOr
            ? RACE_OR_ETHNICITY
            : breakdownVarDisplayName}
          . {showCardHelperText && cardHelperText}
          {props.raceEthDiffMap && raceEthDiffMapText}
          {showDataGapsRisk && (
            <>
              Consider the possible impact of{" "}
              <a
                href="#missingDataInfo"
                onClick={(e) => {
                  e.preventDefault();
                  props.jumpToData && props.jumpToData();
                }}
              >
                data reporting gaps
              </a>{" "}
              when interpreting age-adjusted risk.
            </>
          )}
        </Alert>
      </CardContent>
      <Divider />
    </>
  );
}

export default UnknownsAlert;
