import React from "react";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";
import styles from "./LifelineAlert.module.scss";
import PhoneIcon from "@material-ui/icons/Phone";
import { urlMap } from "../../utils/externalUrls";

function LifelineAlert() {
  return (
    <div>
      <Alert
        severity="info"
        className={styles.ReportAlert}
        icon={<PhoneIcon />}
        role="note"
      >
        <AlertTitle>National Suicide Prevention Lifeline</AlertTitle>
        The Lifeline provides 24/7, free and confidential support for people in
        distress, prevention and crisis resources for you or your loved ones,
        and best practices for professionals in the United States. If you need
        help, call <a href="tel:1-800-273-8255">1-800-273-TALK (8255)</a> or
        visit <a href={urlMap.lifeline}>suicidepreventionlifeline.org</a>.
      </Alert>
    </div>
  );
}

export default LifelineAlert;
