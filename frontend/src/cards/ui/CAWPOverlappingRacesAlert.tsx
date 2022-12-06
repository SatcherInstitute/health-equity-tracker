import { CardContent } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import React from "react";
import { VariableConfig } from "../../data/config/MetricConfig";

interface CAWPOverlappingRacesAlertProps {
  variableConfig: VariableConfig;
}

export default function CAWPOverlappingRacesAlert(
  props: CAWPOverlappingRacesAlertProps
) {
  return (
    <CardContent>
      <Alert severity="info" role="note">
        Percentages reported for{" "}
        <b>{props.variableConfig.variableDisplayName}</b> cannot be summed, as
        these race and ethnicity groupings are not mutually exclusive.
        Individuals who identify with more than one group (e.g. both "White" and
        "Latina") are represented in each corresponding category.
      </Alert>
    </CardContent>
  );
}
