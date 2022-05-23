import React from "react";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";
import styles from "./IncarceratedChildrenLongAlert.module.scss";
// import FlagIcon from "@material-ui/icons/Flag";
import { urlMap } from "../../utils/externalUrls";

function IncarceratedChildrenLongAlert() {
  return (
    <div>
      <Alert
        severity="error"
        className={styles.ReportAlert}
        // icon={<FlagIcon />}
        role="note"
      >
        <AlertTitle>Children in Adult Prisons</AlertTitle>
        There is no absolute minimum age in most states nor federally for
        sentencing as an adult, and in some cases{" "}
        <b>children as young as 8 years old</b> have been imprisoned in adult
        facilities. This type incarceration is distinct from the much larger
        numbers held in adult jails and juveniles detention centers. When
        showing reports filtered by age, we have highlighted the{" "}
        <b>total count</b> of these imprisoned children, rather than presenting
        a rate per 100k.{" "}
        <a href={urlMap.childrenInPrison}>
          Learn more about the lack of minimum-age sentencing requirements
        </a>{" "}
        and how it affects health equity, particularly for Black and Latino
        youths.
      </Alert>
    </div>
  );
}

export default IncarceratedChildrenLongAlert;
