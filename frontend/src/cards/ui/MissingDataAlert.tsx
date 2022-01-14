import React from "react";
import { Alert } from "@material-ui/lab";
import {
  LinkWithStickyParams,
  WHAT_IS_HEALTH_EQUITY_PAGE_LINK,
} from "../../utils/urlutils";
import { Fips } from "../../data/utils/Fips";

function MissingDataAlert(props: {
  dataName: string;
  breakdownString: string;
  noDemographicInfo?: boolean;
  isMapCard?: boolean;
  fips: Fips;
}) {
  // conditionally render the statement based on props
  const demographicPhrase = props.noDemographicInfo
    ? " demographic information for "
    : " ";
  const breakdownPhrase = props.noDemographicInfo
    ? " "
    : ` broken down by ${props.breakdownString} `;

  // supply name of lower level geo needed to create map
  const geoPhrase =
    props.isMapCard && !props.fips.isCounty()
      ? `at the ${props.fips.getChildFipsTypeDisplayName()} level `
      : "";

  return (
    <Alert severity="warning">
      We do not currently have
      {demographicPhrase}
      <b>{props.dataName}</b>
      {breakdownPhrase}
      {geoPhrase}
      for {props.fips.getDisplayName()}. Learn more about how this lack of data
      impacts{" "}
      <LinkWithStickyParams to={WHAT_IS_HEALTH_EQUITY_PAGE_LINK}>
        health equity
      </LinkWithStickyParams>
      .
    </Alert>
  );
}

export default MissingDataAlert;
