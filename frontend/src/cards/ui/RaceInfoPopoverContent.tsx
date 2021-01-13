import React from "react";
import styles from "../Card.module.scss";

function RaceInfoPopover(props: {}) {
  return (
    <div className={styles.BarChartCardPopover}>
      <h1>How did you define these categories?</h1>
      <p>
        These racial categories are defined by the ACS and US Census Bureau.
        While it is the most extensive database out there, we understand that
        there are real limitations in how the categories have been defined, as
        well as how these definitions can mask groups.{" "}
        <a href="/">Learn more about limitations in the data</a>
      </p>
    </div>
  );
}

export default RaceInfoPopover;
