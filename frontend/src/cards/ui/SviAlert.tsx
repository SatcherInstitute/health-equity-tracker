import React from "react";
import Alert from "@material-ui/lab/Alert";
import variables from "../../styles/variables.module.scss";
import { MetricQueryResponse } from "../../data/query/MetricQuery";

interface SviAlertProps {
  svi: number;
  sviQueryResponse: MetricQueryResponse;
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
    <Alert severity="info" style={{ margin: "10px" }}>
      This county has a social vulnerability index of <b>{props.svi}</b>; which
      indicates a{" "}
      <a href="testing" style={{ textDecorationColor: color }}>
        <span style={{ color: color, fontWeight: "bold" }}>
          {rating} level of vulernability.
        </span>
      </a>
    </Alert>
  );
}

export default SviAlert;
