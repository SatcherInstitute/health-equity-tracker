import React from "react";
import { USA_FIPS, USA_DISPLAY_NAME, Fips } from "../../data/utils/Fips";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Button from "@material-ui/core/Button";
import styles from "./MapBreadcrumbs.module.scss";

function MapBreadcrumbs(props: {
  fips: Fips;
  updateFipsCallback: Function;
  ariaLabel?: string;
}) {
  return (
    <Breadcrumbs
      separator="›"
      aria-label={`Breadcrumb navigation for ${
        props.ariaLabel
      } in ${props.fips.getDisplayName()} report`}
    >
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
          isClickable={!props.fips.isStateOrTerritory()}
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
        <Button
          color="primary"
          className={styles.Crumb}
          onClick={() => props.onClick!()}
        >
          {props.text}
        </Button>
      )}
      {!props.isClickable && (
        <Button color="primary" className={styles.CurrentCrumb} disabled>
          {props.text}
        </Button>
      )}
    </>
  );
}

export default MapBreadcrumbs;
