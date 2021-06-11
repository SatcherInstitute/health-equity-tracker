import React from "react";
import { Alert } from "@material-ui/lab";
import {
  LinkWithStickyParams,
  WHAT_IS_HEALTH_EQUITY_PAGE_LINK,
} from "../../utils/urlutils";

function MissingDataAlert(props: {
  dataName: string;
  breakdownString: string;
  geoLevel: string;
}) {
  return (
    <Alert severity="warning">
      We do not currently have <b>{props.dataName}</b> broken down by{" "}
      <b>{props.breakdownString}</b> at the <b>{props.geoLevel}</b> level. Learn
      more about how this lack of data impacts{" "}
      <LinkWithStickyParams to={WHAT_IS_HEALTH_EQUITY_PAGE_LINK}>
        health equity
      </LinkWithStickyParams>
    </Alert>
  );
}

export default MissingDataAlert;
