import React from "react";
import { Alert } from "@material-ui/lab";
import { type Fips } from "../../data/utils/Fips";
import { urlMap } from "../../utils/externalUrls";
import { type MetricQueryResponse } from "../../data/query/MetricQuery";
import { type Row } from "../../data/utils/DatasetTypes";
import { ALL } from "../../data/utils/Constants";
import FlagIcon from "@material-ui/icons/Flag";
import { type BreakdownVar } from "../../data/query/Breakdowns";
import { CardContent } from "@material-ui/core";

interface IncarceratedChildrenShortAlertProps {
  queryResponse: MetricQueryResponse
  fips: Fips
  breakdownVar: BreakdownVar
}

function IncarceratedChildrenShortAlert(
  props: IncarceratedChildrenShortAlertProps
) {
  let count = props.queryResponse.data.find(
    (row: Row) => row[props.breakdownVar] === ALL
  )?.total_confined_children;
  if (count) count = parseInt(count);
  if (count == null) return <></>;

  const children = count === 1 ? "child" : "children";
  const adultFacilities =
    count === 1 ? "an adult facility" : "adult facilities";

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
        confined in {adultFacilities} in{" "}
        <b>{props.fips.getSentenceDisplayName()}</b>.{" "}
        <a href={urlMap.childrenInPrison}>Learn more.</a>
      </Alert>
    </CardContent>
  );
}

export default IncarceratedChildrenShortAlert;
