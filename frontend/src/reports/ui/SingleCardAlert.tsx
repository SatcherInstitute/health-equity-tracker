import React from "react";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";
import styles from "./DisclaimerAlert.module.scss";
import FlagIcon from "@material-ui/icons/Flag";

export default function SingleCardAlert() {
  return (
    <div>
      <Alert
        severity="warning"
        className={styles.ReportAlert}
        icon={<FlagIcon />}
        role="note"
      >
        <AlertTitle id="onboarding-limits-in-the-data">
          Viewing a Partial Report
        </AlertTitle>
        You are currently viewing an abbreviated report, focused on a single
        card. To expand the report to include multiple maps, charts and data
        tables with a more complete picture of Health Equity, please{" "}
        <a
          href="#top"
          //   onClick={(e) => {
          //     e.preventDefault();
          //     // eslint-disable-next-line no-restricted-globals
          //     history.pushState(
          //       "",
          //       document.title,
          //       window.location.pathname + window.location.search
          //     );
          //   }
          // }
        >
          expand the full report
        </a>
        <span aria-hidden>.</span>
      </Alert>
    </div>
  );
}
