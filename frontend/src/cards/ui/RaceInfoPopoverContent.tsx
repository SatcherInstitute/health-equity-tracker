import React from "react";
import styles from "../Card.module.scss";

/*
This popover may be used to add an info icon to a Card title that opens additional race info
*/
function RaceInfoPopoverContent(props: {}) {
  return (
    <div className={styles.BarChartCardPopover}>
      <h1>How did you define these categories?</h1>
      <p>
        These racial categories are defined by the ACS and US Census Bureau.
        While it is the most extensive database out there, we understand that
        there are real limitations in how the categories have been defined, as
        well as how these definitions can mask groups.
      </p>
    </div>
  );
}

export default RaceInfoPopoverContent;
