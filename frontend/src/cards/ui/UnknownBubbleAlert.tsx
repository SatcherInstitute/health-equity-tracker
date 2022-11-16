import React from "react";
import { Alert } from "@material-ui/lab";

import {
  BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE,
} from "../../data/query/Breakdowns";

interface UnknownBubbleAlertProps {
  breakdownVar: BreakdownVar;
  variableDisplayName: string;
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
}

export default function UnknownBubbleAlert(props: UnknownBubbleAlertProps) {
  const changeUnknownState = (event: any) => {
    event.preventDefault();
    props.setExpanded(!props.expanded);
  };

  return (
    <Alert severity="info" role="note">
      Missing and unknown data impacts Health Equity. Please consider the impact
      of {props.variableDisplayName} with an unknown{" "}
      {BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[props.breakdownVar]}.{" "}
      {props.expanded && (
        <>
          The <b>unknown percentage</b> along the bottom of this chart expresses
          the share of total {props.variableDisplayName} per month that did not
          include {BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[props.breakdownVar]}{" "}
          information.
        </>
      )}{" "}
      <a href="#main" onClick={changeUnknownState}>
        {!props.expanded ? "Show unknowns" : "Hide unknowns"}
      </a>
    </Alert>
  );
}
