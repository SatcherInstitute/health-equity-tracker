import React from "react";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";
import styles from "./IncarceratedChildrenLongAlert.module.scss";
import { Link } from "react-router-dom";
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
          more in <Link to={METHODOLOGY_TAB_LINK}>our methodology</Link>.
        </p>
        {/* <p>
          <b>Where are Justice involved individuals confined?</b> A Prison or a
          Jail.
        </p>
        <p>
          <b>
            What determines the type of facility where a justice involved
            individual is confined?
          </b>
        </p>
        <ul>
          <li>
            <b>Prison</b>: when the justice-involved individual is serving a
            sentence of more than one year.
          </li>
          <li>
            <b>Jail</b>: when the justice-involved individual is either awaiting
            trial for certain crimes or serving a sentence of one year or less.
          </li>
        </ul>

        <p>
          <b>Why are there Children in Adult Prison and Jail Facilities?</b>{" "}
          There are children in adult prisons and jails because some state laws{" "}
          <a target="_blank" rel="noreferrer" href={urlMap.prisonPolicy}>
            enable children to be prosecuted as adults
          </a>{" "}
          in certain circumstances. Such children are more exposed to fewer
          age-appropriate services, physical and sexual abuse, and worse health
          outcomes. When reporting on incarceration, we highlight the{" "}
          <b>total number of confined children</b> in adult facilities. Read
          more in <Link to={METHODOLOGY_TAB_LINK}>our methodology</Link>.
        </p> */}
      </Alert>
    </div>
  );
}

export default IncarceratedChildrenLongAlert;
