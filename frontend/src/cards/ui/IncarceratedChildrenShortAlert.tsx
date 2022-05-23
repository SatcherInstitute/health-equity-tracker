import React from "react";
import { Alert } from "@material-ui/lab";
import { Fips } from "../../data/utils/Fips";
import { urlMap } from "../../utils/externalUrls";
import { MetricQueryResponse } from "../../data/query/MetricQuery";
import { Row } from "../../data/utils/DatasetTypes";
import { CHILD_AGE_BUCKETS } from "../../data/utils/Constants";

let childrenAre = "children";
let adultPrisonFacilities = "adult prison facilities";

interface IncarceratedChildrenShortAlertProps {
  queryResponse: MetricQueryResponse;
  fips: Fips;
}

function IncarceratedChildrenShortAlert(
  props: IncarceratedChildrenShortAlertProps
) {
  const count = props.queryResponse.data.find((row: Row) =>
    CHILD_AGE_BUCKETS.includes(row.age)
  )?.["prison_estimated_total"];

  if (!count) return <></>;

  if (count === 1) {
    childrenAre = "child is";
    adultPrisonFacilities = "an adult prison facility";
  }

  return (
    <Alert severity="error" role="note">
      <b>
        {count} {childrenAre} are currently incarcerated in{" "}
        {adultPrisonFacilities} in {props.fips.getDisplayName()}
      </b>
      . <a href={urlMap.childrenInPrison}>Learn more.</a>
    </Alert>
  );
}

export default IncarceratedChildrenShortAlert;
