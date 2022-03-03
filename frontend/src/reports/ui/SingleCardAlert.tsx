import React from "react";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";
import styles from "./SingleCardAlert.module.scss";
// import FlagIcon from "@material-ui/icons/Flag";
import AssessmentIcon from "@material-ui/icons/Assessment";

export default function SingleCardAlert() {
  return (
    <Alert
      severity="success"
      className={styles.ReportAlert}
      icon={<AssessmentIcon />}
      role="note"
    >
      <AlertTitle>You are viewing a partial report</AlertTitle>
      To expand the report to include multiple maps, charts and data tables with
      a more complete picture of Health Equity, please{" "}
      <a href={window.location.href.replace(window.location.hash, "")}>
        expand the full report
      </a>
      <span aria-hidden>.</span>
    </Alert>
  );
}
