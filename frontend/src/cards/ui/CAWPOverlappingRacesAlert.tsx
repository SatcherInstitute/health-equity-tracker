import { Alert } from "@material-ui/lab";
import React from "react";
import { VariableConfig } from "../../data/config/MetricConfig";
import { urlMap } from "../../utils/externalUrls";

interface CAWPOverlappingRacesAlertProps {
  variableConfig: VariableConfig;
}

export default function CAWPOverlappingRacesAlert(
  props: CAWPOverlappingRacesAlertProps
) {
  return (
    <Alert severity="info" role="note">
      <p>
        Percentages reported for{" "}
        <b>{props.variableConfig.variableDisplayName}</b> cannot be summed, as
        these race and ethnicity groupings are not mutually exclusive.
        Individuals who identify with more than one group (e.g. both "White" and
        "Latina") are represented in each corresponding category.
      </p>

      <p>
        {/* TODO simplify this once both state leg and congress use combo races  */}
        {props.variableConfig.variableId === "women_us_congress" ? (
          <>
            The composite race group{" "}
            <b>American Indian, Alaska Native, Asian & Pacific Islander</b> is
            our best attempt to visualize the impact to these under-represented
            groups; unfortunately CAWP and ACS use different demographic
            groupings, so to accurately compare against available population
            data we must further combine these distinct racial identities.
          </>
        ) : (
          <>
            Unfortunately CAWP and ACS use different race groupings, so we are
            unable to provide population comparison data for{" "}
            <b>Native American, Alaska Native, & Native Hawaiian</b> or{" "}
            <b>Asian American & Pacific Islander</b>.
          </>
        )}
        There is currently no population data collected by the U.S. Census for{" "}
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
