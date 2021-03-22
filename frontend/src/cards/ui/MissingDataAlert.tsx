import React from "react";
import { Alert } from "@material-ui/lab";

function MissingDataAlert(props: {
  dataName: string;
  breakdownString: string;
}) {
  // TODO: populate health equity link
  return (
    <Alert severity="warning">
      We do not currently have <b>{props.dataName}</b> broken down by{" "}
      <b>{props.breakdownString}</b>. Learn more about how this lack of data
      impacts <a href="/">health equity</a>.
    </Alert>
  );
}

export default MissingDataAlert;
