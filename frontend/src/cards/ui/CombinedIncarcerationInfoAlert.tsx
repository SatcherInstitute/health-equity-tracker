import React from "react";
import { Alert } from "@material-ui/lab";
import { COMBINED_INCARCERATION_STATES_MESSAGE } from "../../data/variables/BjsProvider";
import { CardContent } from "@material-ui/core";

interface CombinedIncarcerationInfoAlertProps {}

function CombinedIncarcerationInfoAlert(
  props: CombinedIncarcerationInfoAlertProps
) {
  return (
    <>
      {/* <Divider /> */}
      <CardContent>
        <Alert severity="warning" role="note">
          {COMBINED_INCARCERATION_STATES_MESSAGE}
        </Alert>
      </CardContent>
    </>
  );
}

export default CombinedIncarcerationInfoAlert;
