import React from "react";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";
import styles from "./IncarceratedChildrenLongAlert.module.scss";
import { Link } from "react-router-dom";
import FlagIcon from "@material-ui/icons/Flag";
import { METHODOLOGY_TAB_LINK } from "../../utils/internalRoutes";

function IncarceratedChildrenLongAlert() {
  return (
    <div>
      <Alert
        severity="error"
        className={styles.ReportAlert}
        icon={<FlagIcon />}
        role="note"
      >
        <AlertTitle>Children in Adult Jails and Prisons</AlertTitle>

        <p>
          Although the criminal justice system makes distinctions between
          children and adults, there are state-level laws that remove children
          from the protective cover of these distinctions and enable the{" "}
          <Link to="https://www.prisonpolicy.org/reports/youth2019.html">
            incarceration of children in adult correctional institutions
          </Link>
          .
        </p>
        <p>
          When showing incarceration reports filtered by age, we highlight the{" "}
          <b>total number of confined children</b>, rather than ‘per 100k’ rates
          calculated using an ambiguous population base. Read more in{" "}
          <Link to={METHODOLOGY_TAB_LINK}>our methodology</Link>.
        </p>
      </Alert>
    </div>
  );
}

export default IncarceratedChildrenLongAlert;
