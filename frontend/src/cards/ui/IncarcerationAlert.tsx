import React from "react";
import { Alert, Color } from "@material-ui/lab";
import { CardContent } from "@material-ui/core";
import {
  BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE,
} from "../../data/query/Breakdowns";
import { Fips } from "../../data/utils/Fips";

interface IncarcerationAlertProps {
  breakdown: BreakdownVar;
  fips: Fips;
}

function IncarcerationAlert(props: IncarcerationAlertProps) {
  // let severity: Color = "info"

  // if (props.breakdown === "age") {
  //   if (props.fips.isStateOrTerritory()) return <></>
  //   else severity = "warning"
  // }
  const severity: Color = props.breakdown === "age" ? "warning" : "info";

  const breakdown = BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[props.breakdown];

  return (
    <>
      <CardContent>
        <Alert severity={severity} role="note">
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
