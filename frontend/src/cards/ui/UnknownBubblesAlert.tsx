import React from "react";
import { Alert } from "@material-ui/lab";
import styles from "./UnknownBubblesAlert.module.scss";

import {
  BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE,
} from "../../data/query/Breakdowns";

interface UnknownBubblesAlertProps {
  breakdownVar: BreakdownVar;
  variableDisplayName: string;
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
}

export default function UnknownBubblesAlert(props: UnknownBubblesAlertProps) {
  const changeUnknownState = (event: any) => {
    event.preventDefault();
    props.setExpanded(!props.expanded);
  };

  const groupTerm = BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[props.breakdownVar];

  return (
    <Alert severity="info" role="note">
      Missing and unknown data impacts Health Equity. Please consider the impact
      of {props.variableDisplayName} with an unknown {groupTerm}.{" "}
      {props.expanded && (
        <>
          The <b>unknown percentage</b> along the bottom of this chart expresses
          the share of total {props.variableDisplayName} per month that did not
          include {groupTerm} information.
        </>
      )}{" "}
      <button
        onClick={changeUnknownState}
        className={styles.UnknownBubblesLink}
        aria-label={
          "View the share of " +
          props.variableDisplayName +
          " with an unknown " +
          groupTerm
        }
      >
        {!props.expanded ? "Show unknowns" : "Hide unknowns"}
      </button>
    </Alert>
  );
}
