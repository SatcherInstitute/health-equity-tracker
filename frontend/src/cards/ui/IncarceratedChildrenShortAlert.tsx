import React from "react";
import { Alert } from "@material-ui/lab";
import { Fips } from "../../data/utils/Fips";
import { urlMap } from "../../utils/externalUrls";
import { MetricQueryResponse } from "../../data/query/MetricQuery";
import { Row } from "../../data/utils/DatasetTypes";
import { ALL } from "../../data/utils/Constants";
import FlagIcon from "@material-ui/icons/Flag";
import { BreakdownVar } from "../../data/query/Breakdowns";

let children = "children";
let are = "are";
let adultFacilities = "adult prison and jail facilities";

interface IncarceratedChildrenShortAlertProps {
  queryResponse: MetricQueryResponse;
  fips: Fips;
  breakdownVar: BreakdownVar;
}

function IncarceratedChildrenShortAlert(
  props: IncarceratedChildrenShortAlertProps
) {
  const count = parseInt(
    props.queryResponse.data.find((row: Row) => row[props.breakdownVar] === ALL)
      ?.total_confined_children
  );

  if (!count) return <></>;

  if (count === 1) {
    children = "child";
    are = "is";
    adultFacilities = "an adult prison or jail facility";
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
      {are} currently confined in {adultFacilities} in{" "}
      <b>{props.fips.getDisplayName()}</b>.{" "}
      <a href={urlMap.childrenInPrison}>Learn more.</a>
    </Alert>
  );
}

export default IncarceratedChildrenShortAlert;
