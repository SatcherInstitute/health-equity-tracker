import React from "react";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/lab/AlertTitle";
import styles from "./DisclaimerAlert.module.scss";
import FlagIcon from "@mui/icons-material/Flag";
import { WHAT_DATA_ARE_MISSING_ID } from "../../utils/internalRoutes";

function DisclaimerAlert() {
  return (
    <div>
      <Alert
        severity="warning"
        className={styles.ReportAlert}
        icon={<FlagIcon />}
        role="note"
        id="onboarding-limits-in-the-data"
      >
        <AlertTitle>Major gaps in the data</AlertTitle>
        Structural racism and oppression create health inequities, and lead to
        missing data. The maps and tables below reflect the best data we have,
        but there are major known gaps in the data. We're working to close these
        gaps which, in turn, will help us create more effective health policies
        in the United States.{" "}
        <a href={`#${WHAT_DATA_ARE_MISSING_ID}`}>
          Read more about missing and misidentified people
        </a>
        <span aria-hidden>.</span>
      </Alert>
    </div>
  );
}

export default DisclaimerAlert;
