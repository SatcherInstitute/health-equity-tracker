import React from "react";
import { Alert } from "@material-ui/lab";
import {
  COMBINED_INCARCERATION_STATES_LIST,
  COMBINED_INCARCERATION_STATES_MESSAGE,
  MISSING_PRISON_DATA,
} from "../../data/variables/BjsProvider";
import { CardContent } from "@material-ui/core";
import { Fips } from "../../data/utils/Fips";

interface IncarcerationAlertProps {
  fips: Fips;
}

function IncarcerationAlert(props: IncarcerationAlertProps) {
  const showMissingNational = props.fips.isUsa();
  const showComboStates =
    showMissingNational ||
    COMBINED_INCARCERATION_STATES_LIST.includes(props.fips.getDisplayName());

  if (!showMissingNational && !showComboStates) return <></>;

  return (
    <>
      <CardContent>
        <Alert severity="warning" role="note">
          {props.fips.isUsa() && MISSING_PRISON_DATA}

          {showComboStates && ` ${COMBINED_INCARCERATION_STATES_MESSAGE}`}
        </Alert>
      </CardContent>
    </>
  );
}

export default IncarcerationAlert;
