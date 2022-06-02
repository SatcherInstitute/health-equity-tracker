import React from "react";
import { Alert } from "@material-ui/lab";
import { CardContent } from "@material-ui/core";
import {
  BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE,
} from "../../data/query/Breakdowns";

interface IncarcerationAlertProps {
  breakdown: BreakdownVar;
}

function IncarcerationAlert(props: IncarcerationAlertProps) {
  const breakdown = BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[props.breakdown];

  return (
    <>
      <CardContent>
        <Alert severity="warning" role="note">
          The disaggregated <b>{breakdown}</b> data available from the Bureau of
          Justice Statistics{" "}
          {props.breakdown === "age" ? (
            <>
              only include <b>sentenced</b>
            </>
          ) : (
            <>
              include both <b>sentenced</b> and <b>unsentenced</b>
            </>
          )}{" "}
          individuals under the jurisdiction of an adult prison facility.
        </Alert>
      </CardContent>
    </>
  );
}

export default IncarcerationAlert;
