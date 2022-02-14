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
        <p>
          <b>
            If you or a loved one is experiencing an emergency, call 911 or go
            to your nearest emergency room.
          </b>{" "}
          For 24/7, free and confidential support, prevention and crisis
          resources, and professional best practices, call{" "}
          <a href="tel:1-800-273-8255">1-800-273-TALK (8255)</a> or visit{" "}
          <a href={urlMap.lifeline}>suicidepreventionlifeline.org</a>.
        </p>
      </Alert>
    </div>
  );
}

export default LifelineAlert;
