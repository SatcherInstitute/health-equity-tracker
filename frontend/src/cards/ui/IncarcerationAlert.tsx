import React from "react";
import { Alert, Color } from "@material-ui/lab";
import {
  BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE,
} from "../../data/query/Breakdowns";
import { Fips } from "../../data/utils/Fips";
import { VariableId } from "../../data/config/MetricConfig";
import { AGE } from "../../data/utils/Constants";

interface IncarcerationAlertProps {
  dataType: VariableId;
  breakdown: BreakdownVar;
  fips: Fips;
}

function IncarcerationAlert(props: IncarcerationAlertProps) {
  // we may decide to show this info box on jail as well...
  if (props.dataType === "jail") return <></>;

  const severity: Color =
    props.breakdown === "age" && props.dataType === "prison"
      ? "warning"
      : "info";
  const breakdown = BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[props.breakdown];

  return (
    <Alert severity={severity} role="note">
      The disaggregated <b>{breakdown}</b> dataset available from the Bureau of
      Justice Statistics{" "}
      <IncarcerationDetailsText
        dataType={props.dataType}
        breakdown={props.breakdown}
      />{" "}
      individuals (including children) under the jurisdiction of an adult{" "}
      {props.dataType} facility.
    </Alert>
  );
}

export default IncarcerationAlert;

interface IncarcerationDetailsTextProps {
  dataType: VariableId;
  breakdown: BreakdownVar;
}

function IncarcerationDetailsText(props: IncarcerationDetailsTextProps) {
  if (props.breakdown === AGE && props.dataType === "prison") {
    return (
      <>
        reports only <b>sentenced</b>
      </>
    );
  } else if (props.dataType === "prison") {
    return (
      <>
        reports <b>sentenced</b> and <b>unsentenced</b>
      </>
    );
  }

  // JAIL
  return (
    <>
      reports <b>confined</b>
    </>
  );
}
