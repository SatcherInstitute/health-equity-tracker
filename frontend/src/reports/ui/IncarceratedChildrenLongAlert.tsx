import React from "react";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";
import styles from "./IncarceratedChildrenLongAlert.module.scss";
import FlagIcon from "@material-ui/icons/Flag";
import { METHODOLOGY_TAB_LINK } from "../../utils/internalRoutes";
import { urlMap } from "../../utils/externalUrls";

function IncarceratedChildrenLongAlert() {
  return (
    <div>
      <Alert
        severity="error"
        className={styles.ReportAlert}
        icon={<FlagIcon />}
        role="note"
      >
        {/* <AlertTitle>The 3 Ws of Incarceration: Where, What and Why</AlertTitle> */}
        <AlertTitle>Children in Adult Jails and Prisons</AlertTitle>

        <p>
          Although the criminal justice system makes distinctions between adults
          and children, individual states have laws that remove children from
          the protective cover of these distinctions and{" "}
          <a target="_blank" rel="noreferrer" href={urlMap.prisonPolicy}>
            enable the incarceration of children in adult institutions
          </a>
          . Such children are more exposed to physical and sexual abuse, fewer
          age-appropriate services, and worse health outcomes. When reporting on
          incarceration, we highlight the{" "}
          <b>total number of confined children</b> in adult facilities. Read
          more in <a href={METHODOLOGY_TAB_LINK}>our methodology.</a>
        </p>
      </Alert>
    </div>
  );
}

export default IncarceratedChildrenLongAlert;
