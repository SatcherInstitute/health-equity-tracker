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
          and children, individual states have transfer laws that remove
          children from the protective cover of these distinctions. Children in
          adult prisons are more exposed to physical and sexual abuse, fewer
          age-appropriate services, and worse health outcomes. Lower
          socio-economic status and the inability to properly understand and
          navigate the criminal justice system are some of the reasons why
          children of color are overrepresented in adult prisons. These racial
          disparities are an unfortunate reflection of the inequities that
          plague the broader criminal justice system.
        </p>
        <p>
          When showing reports filtered by age, we have highlighted the{" "}
          <b>total count of these imprisoned children</b>, rather than
          presenting a per 100k rate which would need to be calculated using an
          ambiguous population base. Read more in{" "}
          <Link to={METHODOLOGY_TAB_LINK}>our methodology</Link>.
        </p>
      </Alert>
    </div>
  );
}

export default IncarceratedChildrenLongAlert;
