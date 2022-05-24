import React from "react";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";
import styles from "./IncarceratedChildrenLongAlert.module.scss";
import { Link } from "react-router-dom";
import { METHODOLOGY_TAB_LINK } from "../../utils/urlutils";

function IncarceratedChildrenLongAlert() {
  return (
    <div>
      <Alert severity="error" className={styles.ReportAlert} role="note">
        <AlertTitle>Children in Adult Prisons</AlertTitle>
        Although the criminal justice system makes distinctions between adults
        and children, individual states have transfer laws that remove children
        from the protective cover of these distinctions. Children in adult
        prisons are more exposed to physical and sexual abuse, fewer
        age-appropriate services, and worse health outcomes. When showing
        reports filtered by age, we have highlighted the <b>total number</b> of
        these imprisoned children, rather than presenting a rate per 100k
        calculated using an ambiguous population base. Read more in{" "}
        <Link to={METHODOLOGY_TAB_LINK}>our methodology</Link>.
      </Alert>
    </div>
  );
}

export default IncarceratedChildrenLongAlert;
