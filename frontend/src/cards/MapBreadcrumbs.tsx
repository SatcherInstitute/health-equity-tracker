import React from "react";
import { USA_FIPS, USA_DISPLAY_NAME, Fips } from "../data/utils/Fips";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Link from "@material-ui/core/Link";
import Button from "@material-ui/core/Button";

function MapBreadcrumbs(props: { fips: Fips; updateFipsCallback: Function }) {
  return (
    <Breadcrumbs separator="›" aria-label="breadcrumb">
      <Crumb
        text={USA_DISPLAY_NAME}
        isClickable={!props.fips.isUsa()}
        onClick={() => {
          props.updateFipsCallback(new Fips(USA_FIPS));
        }}
      />
      {!props.fips.isUsa() && (
        <Crumb
          text={props.fips.getStateDisplayName()}
          isClickable={!props.fips.isState()}
          onClick={() => {
            props.updateFipsCallback(props.fips.getParentFips());
          }}
        />
      )}
      {props.fips.isCounty() && (
        <Crumb text={props.fips.getDisplayName()} isClickable={false} />
      )}
    </Breadcrumbs>
  );
}

function Crumb(props: {
  text: string;
  isClickable: boolean;
  onClick?: () => void;
}) {
  return (
    <>
      {props.isClickable && (
        <Button color="primary" style={{ padding: "3px" }}>
          <Link color="inherit" onClick={() => props.onClick!()}>
            {props.text}
          </Link>
        </Button>
      )}
      {!props.isClickable && (
        <Button style={{ padding: "3px" }} disabled>
          {props.text}
        </Button>
      )}
    </>
  );
}

export default MapBreadcrumbs;
