import React from "react";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";
import styles from "./IncarceratedChildrenLongAlert.module.scss";
import { Link } from "react-router-dom";
import { METHODOLOGY_TAB_LINK } from "../../utils/urlutils";
// import GavelIcon from "@material-ui/icons/Gavel";
import FlagIcon from "@material-ui/icons/Flag";

function IncarceratedChildrenLongAlert() {
  return (
    <div>
      <Alert
        severity="error"
        className={styles.ReportAlert}
        // icon={<GavelIcon />}
        icon={<FlagIcon />}
        role="note"
      >
        <AlertTitle>Children in Adult Prisons</AlertTitle>
        <p>
          Although the criminal justice system makes distinctions between adults
          and children, individual states have laws that remove children from
          the protective cover of these distinctions and enable the
          incarceration of children in adult facilities. Such children are more
          exposed to physical and sexual abuse, fewer age-appropriate services,
          and worse health outcomes. Lower socioeconomic status and the
          inability to properly understand and navigate the criminal justice
          process amongst others are responsible for the overrepresentation of
          children of color in adult facilities and are reflective of the
          inequities that plague the entire criminal justice system.
        </p>
        <p>
          When showing reports filtered by age, we have highlighted the{" "}
          <b>total number of these imprisoned children</b>, rather than
          presenting a per 100k rate calculated using an ambiguous population
          base. Read more in{" "}
          <Link to={METHODOLOGY_TAB_LINK}>our methodology</Link>.
        </p>
      </Alert>
    </div>
  );
}

export default IncarceratedChildrenLongAlert;
