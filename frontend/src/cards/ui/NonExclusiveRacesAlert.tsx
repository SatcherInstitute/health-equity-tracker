import { Alert } from "@material-ui/lab";
import React from "react";

interface NonExclusiveRacesAlertProps {
  variableDisplayName: string;
}

export default function NonExclusiveRacesAlert(
  props: NonExclusiveRacesAlertProps
) {
  return (
    <Alert severity="info" role="note">
      <p>
        Percentages reported for <b>{props.variableDisplayName}</b> cannot be
        summed, as these race and ethnicity groupings are not mutually
        exclusive. Individuals who identify with more than one group (e.g. both
        "White" and "Latina") are represented in each corresponding category.
      </p>
      <p>
        The composite race group{" "}
        <b>American Indian, Alaska Native, Asian & Pacific Islander</b> is our
        best attempt to visualize these underrepresented groups; unfortunately
        the CAWP and ACS use different race groupings, so to accurately compare
        against available population data we must further combine these distinct
        racial groups. There is currently no population data collected by the
        U.S. Census for <b>Middle Eastern & North African</b>, although this
        data equity issue has seen progress in the recent decades. Currently,{" "}
        <b>MENA</b> individuals are counted by the ACS as <b>White</b>.
      </p>
    </Alert>
  );
}
