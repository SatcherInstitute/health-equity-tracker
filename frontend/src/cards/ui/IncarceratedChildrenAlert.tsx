import React from "react";
import { Alert } from "@material-ui/lab";
import { Fips } from "../../data/utils/Fips";
import { urlMap } from "../../utils/externalUrls";

interface IncarceratedChildrenAlertProps {
  prisonCountUnder18: number | undefined;
  fips: Fips;
}

function IncarceratedChildrenAlert(props: IncarceratedChildrenAlertProps) {
  let are = "are";
  let children = "children";
  let adultPrisonFacilities = "adult prison facilities";

  if (props.prisonCountUnder18 === 1) {
    are = "is";
    children = "child";
    adultPrisonFacilities = "an adult prison facility";
  }
  return (
    <Alert severity="error" role="note">
      There {are} currently{" "}
      <b>
        {props.prisonCountUnder18} {children} under the age of eighteen
        incarcerated in {adultPrisonFacilities} in {props.fips.getDisplayName()}
      </b>
      ; distinct from the larger number incarcerated elsewhere including local
      jails or juvenile detention centers. There is no absolute minimum age in
      most states nor federally for sentencing as an adult, and in some cases{" "}
      <b>children as young as 8 years old</b> have been imprisoned in adult
      facilities. Learn more about how this lack of minimum-age sentencing
      requirements{" "}
      <a href={urlMap.childrenInPrison}>
        affects health equity, particularly for Black and Latino youths.
      </a>
    </Alert>
  );
}

export default IncarceratedChildrenAlert;
