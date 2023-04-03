import React from "react";
import Alert from "@material-ui/lab/Alert";
import { type MetricQueryResponse } from "../../data/query/MetricQuery";
import { type Fips } from "../../data/utils/Fips";
import { urlMap } from "../../utils/externalUrls";
import styles from "./SviAlert.module.scss";
import { HashLink } from "react-router-hash-link";
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
  if (svi >= 0.34 && svi <= 0.66) {
    return "medium";
  }
  if (svi > 0.66) {
    return "high";
  }
  return "Insufficient data";
};

export const findVerboseRating = (svi: number) => {
  const rating = findRating(svi);
  if (rating === "Insufficient data") {
    return "Insufficient data";
  }
  return `${rating[0].toUpperCase() + rating.slice(1)} vulnerability`;
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
          <HashLink to={`${METHODOLOGY_TAB_LINK}#svi`} className={color}>
            <b>{rating} level of vulnerability.</b>
          </HashLink>
        </Alert>
      )}
    </>
  );
}

export default SviAlert;
