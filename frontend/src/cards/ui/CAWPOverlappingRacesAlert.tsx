import { Alert } from "@material-ui/lab";
import React from "react";
import { urlMap } from "../../utils/externalUrls";

interface CAWPOverlappingRacesAlertProps {
  variableDisplayName: string;
}

export default function CAWPOverlappingRacesAlert(
  props: CAWPOverlappingRacesAlertProps
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
        Unfortunately CAWP and ACS use different race groupings, so we are
        unable to provide population comparison data for{" "}
        <b>Native American, Alaska Native, & Native Hawaiian</b> and{" "}
        <b>Asian American & Pacific Islander</b> groupings. Additionally, there
        is no population data collected by the U.S. Census for{" "}
        <b>Middle Eastern & North African</b>, although this data equity issue
        has seen{" "}
        <a href={urlMap.senateMENA} rel="noreferrer" target="_blank">
          some progress
        </a>{" "}
        in recent decades. Currently, <b>MENA</b> individuals are counted by the
        ACS as <b>White</b>.
      </p>
    </Alert>
  );
}
