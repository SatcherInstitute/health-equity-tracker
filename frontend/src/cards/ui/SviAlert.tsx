import React from "react";
import Alert from "@material-ui/lab/Alert";
import { MetricQueryResponse } from "../../data/query/MetricQuery";
import { Fips } from "../../data/utils/Fips";
import { urlMap } from "../../utils/externalUrls";
import styles from "./SviAlert.module.scss";

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

export const findVerboseRating = (svi: number) => {
  const rating = findRating(svi);
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
          This county has a social vulnerability index (SVI) of{" "}
          <b>{props.svi}</b>; which indicates a{" "}
          <a href={urlMap.cdcSvi} className={color}>
            <b>{rating} level of vulnerability.</b>
          </a>
        </Alert>
      )}
    </>
  );
}

export default SviAlert;
