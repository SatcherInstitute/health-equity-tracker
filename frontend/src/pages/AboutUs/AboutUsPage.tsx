import React from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import styles from "./AboutUsPage.module.scss";
import FaqTab from "./FaqTab";
import TheProjectTab from "./TheProjectTab";
import OurTeamTab from "./OurTeamTab";
import ContactUsTab from "./ContactUsTab";
import { ABOUT_US_TAB_PARAM, useSearchParams } from "../../utils/urlutils";

export const ABOUT_US_PROJECT_TAB_INDEX = 0;
export const ABOUT_US_TEAM_TAB_INDEX = 1;
export const ABOUT_US_FAQ_TAB_INDEX = 2;
export const ABOUT_US_CONTACT_TAB_INDEX = 3;

/* TODO - Align with mocks, Clean up CSS */
export function AboutUsPage() {
  const params = useSearchParams();

  const [tabIndex, setTabIndex] = React.useState(
    params[ABOUT_US_TAB_PARAM] ? Number(params[ABOUT_US_TAB_PARAM]) : 0
  );

  const handleChange = (event: React.ChangeEvent<{}>, newTabIndex: number) => {
    setTabIndex(newTabIndex);
  };

  return (
    <div className={styles.AboutUsPage}>
      <Tabs
        tabIndex={tabIndex}
        value={tabIndex}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        centered
        style={{ marginTop: "40px" }}
      >
        <Tab label="The Project" />
        <Tab label="Our Team" />
        <Tab label="Frequently Asked Questions" />
        <Tab label="Contact Us" />
      </Tabs>
      {tabIndex === 0 && <TheProjectTab />}
      {tabIndex === 1 && <OurTeamTab />}
      {tabIndex === 2 && <FaqTab />}
      {tabIndex === 3 && <ContactUsTab />}
    </div>
  );
}
