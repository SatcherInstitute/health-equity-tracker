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
        {/* 

 */}
        <AlertTitle>988 Suicide & Crisis Lifeline</AlertTitle>
        <p>
          For 24/7, free and confidential support, prevention and crisis
          resources, and professional best practices, call{" "}
          <a href="tel:988">9-8-8</a> or visit{" "}
          <a href={urlMap.lifeline}>988lifeline.org</a>. If you or a loved one
          is experiencing an emergency, call 911 or go to your nearest emergency
          room.
        </p>
      </Alert>
    </div>
  );
}

export default LifelineAlert;
