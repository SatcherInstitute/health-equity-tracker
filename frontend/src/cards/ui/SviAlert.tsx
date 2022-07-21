import React from "react";
import Alert from "@material-ui/lab/Alert";
import { MetricQueryResponse } from "../../data/query/MetricQuery";
import { Fips } from "../../data/utils/Fips";
import { urlMap } from "../../utils/externalUrls";
import styles from "./SviAlert.module.scss";
import { HashLink as Link } from "react-router-hash-link";
import { METHODOLOGY_TAB_LINK } from "../../utils/internalRoutes";

interface SviAlertProps {
  svi: number;
  sviQueryResponse: MetricQueryResponse;
  fips: Fips;
}

export const findRating = (svi: number) => {
  if (svi < 0.34) {
    return "low";
  }
  if (svi > 0.67) {
    return "high";
  }
  return "medium";
};

export const findColor = (rating: string) => {
  if (rating === "high") {
    return styles.High;
  }
  if (rating === "low") {
    return styles.Low;
  }
  return styles.Medium;
};

function SviAlert(props: SviAlertProps) {
  const rating = findRating(props.svi);
  const color = findColor(rating);

  return (
    <>
      {props.svi === undefined || props.svi === null ? (
        <Alert severity="warning" className={styles.Alert}>
          We do not currently have the <b>social vulnerability index</b> for{" "}
          <b>{props.fips.getDisplayName()}</b>. Learn more about how this lack
          of data impacts <a href={urlMap.cdcSvi}>health equity.</a>
        </Alert>
      ) : (
        <Alert severity="info" className={styles.Alert}>
          This county has a social vulnerability index of <b>{props.svi}</b>;
          which indicates a{" "}
          <Link to={`${METHODOLOGY_TAB_LINK}#svi`} className={color}>
            <b>{rating} level of vulnerability.</b>
          </Link>
        </Alert>
      )}
    </>
  );
}

export default SviAlert;
