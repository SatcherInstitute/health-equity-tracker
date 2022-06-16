import React from "react";
import { Alert } from "@material-ui/lab";
import { Fips } from "../../data/utils/Fips";
import { urlMap } from "../../utils/externalUrls";
import { MetricQueryResponse } from "../../data/query/MetricQuery";
import { Row } from "../../data/utils/DatasetTypes";
import { CHILD_AGE_BUCKETS } from "../../data/utils/Constants";
import FlagIcon from "@material-ui/icons/Flag";

let children = "children";
let are = "are";
let adultPrisonFacilities = "adult prison and jail facilities";

interface IncarceratedChildrenShortAlertProps {
  queryResponse: MetricQueryResponse;
  fips: Fips;
}

function IncarceratedChildrenShortAlert(
  props: IncarceratedChildrenShortAlertProps
) {
  const count =
    props.queryResponse.data.find((row: Row) =>
      CHILD_AGE_BUCKETS.includes(row.age)
    )?.["total_confined_children"] || 0;

  if (count === 1) {
    children = "child";
    are = "is";
    adultPrisonFacilities = "an adult prison or jail facility";
  }

  return (
    <Alert
      severity={count === 0 ? "info" : "error"}
      role="note"
      icon={count !== 0 ? <FlagIcon /> : null}
    >
      <b>
        {count.toLocaleString()} {children}
      </b>{" "}
      {are} currently confined in {adultPrisonFacilities} in{" "}
      <b>{props.fips.getDisplayName()}</b>.{" "}
      <a href={urlMap.childrenInPrison}>Learn more.</a>
    </Alert>
  );
}

export default IncarceratedChildrenShortAlert;
