import React from "react";
import { Alert } from "@material-ui/lab";
import { CardContent } from "@material-ui/core";
import { BreakdownVar } from "../../data/query/Breakdowns";

interface IncarcerationAlertProps {
  breakdown: BreakdownVar;
}

function IncarcerationAlert(props: IncarcerationAlertProps) {
  return (
    <>
      <CardContent>
        <Alert severity="warning" role="note">
          The rates on this report{" "}
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
