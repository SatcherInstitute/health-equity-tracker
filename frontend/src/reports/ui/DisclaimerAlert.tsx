import React from "react";
import Alert from "@material-ui/lab/Alert";
import Button from "@material-ui/core/Button";
import styles from "./DisclaimerAlert.module.scss";
import FlagIcon from "@material-ui/icons/Flag";

function DisclaimerAlert(props: { jumpToData: () => void }) {
  return (
    <Alert
      severity="warning"
      className={styles.ReportAlert}
      icon={<FlagIcon />}
    >
      <b>Major gaps in the data</b>
      <p>
        Structural racism and oppression create health inequities, which leads
        to missing data. The maps and tables below reflect the best data we
        have, but there are major known gaps in the data. We're working to close
        these gaps which, in turn, will help us create more effective health
        policies in the United States.
        <Button
          onClick={() => props.jumpToData()}
          className={styles.LinkButton}
        >
          Read more about missing and misidentified people.
        </Button>
      </p>
    </Alert>
  );
}

export default DisclaimerAlert;
