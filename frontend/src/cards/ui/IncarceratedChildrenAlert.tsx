import React from "react";
import { Alert } from "@material-ui/lab";
import { Fips } from "../../data/utils/Fips";
import { urlMap } from "../../utils/externalUrls";
import { MetricQueryResponse } from "../../data/query/MetricQuery";
import { Row } from "../../data/utils/DatasetTypes";
import { CHILD_AGE_BUCKETS } from "../../data/utils/Constants";

let are = "are";
let children = "children";
let adultPrisonFacilities = "adult prison facilities";

interface IncarceratedChildrenAlertProps {
  queryResponse: MetricQueryResponse;
  fips: Fips;
}

function IncarceratedChildrenAlert(props: IncarceratedChildrenAlertProps) {
  const count = props.queryResponse.data.find((row: Row) =>
    CHILD_AGE_BUCKETS.includes(row.age)
  )?.["prison_estimated_total"];

  if (!count) return <></>;

  if (count === 1) {
    are = "is";
    children = "child";
    adultPrisonFacilities = "an adult prison facility";
  }

  return (
    <Alert severity="error" role="note">
      There {are} currently{" "}
      <b>
        {count} {children} under the age of eighteen incarcerated in{" "}
        {adultPrisonFacilities} in {props.fips.getDisplayName()}
      </b>
      ; distinct from others incarcerated elsewhere including local jails or
      juvenile detention centers. There is no absolute minimum age in most
      states nor federally for sentencing as an adult, and in some cases{" "}
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
