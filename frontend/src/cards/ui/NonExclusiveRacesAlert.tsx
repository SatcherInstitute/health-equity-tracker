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
      Percentages reported for <b>{props.variableDisplayName}</b> cannot be
      summed, as these racial categories are not mutually exclusive. Individuals
      who identify with multiple specific races (e.g. both "White" and "Black")
      are represented multiple times in the visualization: across each
      corresponding category, and also as "Two or more races & Unrepresented
      race".
    </Alert>
  );
}
