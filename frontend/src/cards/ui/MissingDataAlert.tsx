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
  noDemographicInfo?: boolean;
}) {
  return props.noDemographicInfo ? (
    <Alert severity="warning">
      We do not currently have demographic information for{" "}
      <b>{props.dataName}</b> at the <b>{props.geoLevel}</b> level. Learn more
      about how this lack of data impacts{" "}
      <LinkWithStickyParams to={WHAT_IS_HEALTH_EQUITY_PAGE_LINK}>
        health equity.
      </LinkWithStickyParams>
    </Alert>
  ) : (
    <Alert severity="warning">
      We do not currently have
      {props.noDemographicInfo ? " demographic information for " : " "}
      <b>{props.dataName}</b> {props.noDemographicInfo ? "" : "broken down by"}
      {props.noDemographicInfo ? "" : <b> {props.breakdownString} </b>}
      at the {props.geoLevel ? <b>{props.geoLevel}</b> : "selected"} level.
      Learn more about how this lack of data impacts{" "}
      <LinkWithStickyParams to={WHAT_IS_HEALTH_EQUITY_PAGE_LINK}>
        health equity
      </LinkWithStickyParams>
      .
    </Alert>
  );
}

export default MissingDataAlert;
