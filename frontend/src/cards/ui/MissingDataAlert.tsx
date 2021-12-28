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
  // conditionally render the statement based on props
  const demoPhrase = props.noDemographicInfo
    ? " demographic information for "
    : " ";
  const breakdownPhrase = props.noDemographicInfo
    ? " "
    : ` broken down by ${props.breakdownString} `;
  const geo = props.geoLevel || "city"; // if no props.geoLevel, it's coming from a county view, meaning the level down would be city

  return (
    <Alert severity="warning">
      We do not currently have
      {demoPhrase}
      <b>{props.dataName}</b>
      {breakdownPhrase}
      at the <b>{geo}</b> level. Learn more about how this lack of data impacts{" "}
      <LinkWithStickyParams to={WHAT_IS_HEALTH_EQUITY_PAGE_LINK}>
        health equity
      </LinkWithStickyParams>
      .
    </Alert>
  );
}

export default MissingDataAlert;
