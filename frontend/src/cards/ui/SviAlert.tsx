import React from "react";
import Alert from "@material-ui/lab/Alert";
import variables from "../../styles/variables.module.scss";
import { MetricQueryResponse } from "../../data/query/MetricQuery";
import { Fips } from "../../data/utils/Fips";

interface SviAlertProps {
  svi: number;
  sviQueryResponse: MetricQueryResponse;
  fips: Fips;
}

const findRating = (svi: number) => {
  if (svi < 0.34) {
    return "low";
  }
  if (svi > 0.67) {
    return "high";
  } else return "medium";
};

const findColor = (rating: string) => {
  if (rating === "high") {
    return "#d32f2f";
  }
  if (rating === "low") {
    return variables.altGreen;
  } else return "#d85c47";
};

function SviAlert(props: SviAlertProps) {
  const rating = findRating(props.svi);
  const color = findColor(rating);

  return (
    <>
      {props.svi === undefined || props.svi === null ? (
        <Alert severity="warning" style={{ margin: "10px " }}>
          We do not currently have the{" "}
          <span style={{ fontWeight: "bold" }}>social vulnerability index</span>{" "}
          for{" "}
          <span style={{ fontWeight: "bold" }}>
            {props.fips.getDisplayName()}
          </span>
          . Learn more about how this lack of data impacts{" "}
          <a href="link">health equity.</a>
        </Alert>
      ) : (
        <Alert severity="info" style={{ margin: "10px" }}>
          This county has a social vulnerability index of <b>{props.svi}</b>;
          which indicates a{" "}
          <a href="testing" style={{ textDecorationColor: color }}>
            <span style={{ color: color, fontWeight: "bold" }}>
              {rating} level of vulernability.
            </span>
          </a>
        </Alert>
      )}
    </>
  );
}

export default SviAlert;
