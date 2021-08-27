import React from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import styles from "./WhatIsHealthEquityPage.module.scss";
import EquityTab from "./EquityTab";
import FaqTab from "./FaqTab";
import { TAB_PARAM, useSearchParams } from "../../utils/urlutils";
import ResourcesTab from "./ResourcesTab";
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useEffect } from "react";

export const WIHE_HEALTH_EQUITY_TAB_INDEX = 0;
export const WIHE_FAQ_TAB_INDEX = 1;
export const WIHE_JOIN_THE_EFFORT_SECTION_ID = "join";

export function WhatIsHealthEquityPage() {
  const params = useSearchParams();

  // responsive tabs layout to fix mobile bug
  const theme = useTheme();
  const pageIsWide = useMediaQuery(theme.breakpoints.up("sm"));
  const [tabLayout, setTabLayout] = React.useState({});

  const [tabIndex, setTabIndex] = React.useState(
    params[TAB_PARAM] ? Number(params[TAB_PARAM]) : 0
  );

  const handleChange = (event: React.ChangeEvent<{}>, newTabIndex: number) => {
    setTabIndex(newTabIndex);
  };

  // when screen width changes, update tab spacing material UI attribute
  useEffect(() => {
    setTabLayout(pageIsWide ? { centered: true } : { variant: "fullWidth" });
  }, [pageIsWide]);

  return (
    <div className={styles.WhatIsHealthEquityPage}>
      <Tabs
        tabIndex={tabIndex}
        value={tabIndex}
        {...tabLayout}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab
          className={styles.WhatIsHealthEquityTab}
          label="What is Health Equity?"
        />
        <Tab
          className={styles.WhatIsHealthEquityTab}
          label="Frequently Asked Questions"
        />
        <Tab
          className={styles.WhatIsHealthEquityTab}
          label="Health Equity Resources"
        />
      </Tabs>
      {tabIndex === 0 && <EquityTab />}
      {tabIndex === 1 && <FaqTab />}
      {tabIndex === 2 && <ResourcesTab />}
    </div>
  );
}
