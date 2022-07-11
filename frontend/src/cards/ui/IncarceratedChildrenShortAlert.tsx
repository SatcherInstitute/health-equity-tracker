import React from "react";
import { Alert } from "@material-ui/lab";
import { Fips } from "../../data/utils/Fips";
import { urlMap } from "../../utils/externalUrls";
import { MetricQueryResponse } from "../../data/query/MetricQuery";
import { Row } from "../../data/utils/DatasetTypes";
import { ALL } from "../../data/utils/Constants";
import FlagIcon from "@material-ui/icons/Flag";
import { BreakdownVar } from "../../data/query/Breakdowns";
import { CardContent } from "@material-ui/core";

interface IncarceratedChildrenShortAlertProps {
  queryResponse: MetricQueryResponse;
  fips: Fips;
  breakdownVar: BreakdownVar;
}

function IncarceratedChildrenShortAlert(
  props: IncarceratedChildrenShortAlertProps
) {
  let count = props.queryResponse.data.find(
    (row: Row) => row[props.breakdownVar] === ALL
  )?.total_confined_children;
  if (count) count = parseInt(count);
  if (count == null) return <></>;

  let children = "children";
  let adultFacilities = "adult facilities";
  if (count === 1) {
    children = "child";
    adultFacilities = "an adult facility";
  }

  return (
    <CardContent>
      <Alert
        severity={count === 0 ? "info" : "error"}
        role="note"
        icon={count !== 0 ? <FlagIcon /> : null}
      >
        <b>
          {count.toLocaleString()} {children}
        </b>{" "}
        confined in {adultFacilities} in <b>{props.fips.getDisplayName()}</b>.{" "}
        <a href={urlMap.childrenInPrison}>Learn more.</a>
      </Alert>
    </CardContent>
  );
}

export default IncarceratedChildrenShortAlert;
