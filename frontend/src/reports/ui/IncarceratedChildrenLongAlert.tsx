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
          Although the criminal justice system makes distinctions between
          children and adults, there are state-level laws that remove children
          from the protective cover of these distinctions and enable the
          incarceration of children in adult correctional institutions.
        </p>
        <p>
          When showing prison reports filtered by age, we highlight the{" "}
          <b>total number of confined children</b>, rather than a ‘per 100k’
          rate calculated using an ambiguous population base. Read more in{" "}
          <Link to={METHODOLOGY_TAB_LINK}>our methodology</Link>.
        </p>
      </Alert>
    </div>
  );
}

export default IncarceratedChildrenLongAlert;
