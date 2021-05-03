import React from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import styles from "./AboutUsPage.module.scss";
import TheProjectTab from "./TheProjectTab";
import OurTeamTab from "./OurTeamTab";
import ContactUsTab from "./ContactUsTab";
import { TAB_PARAM, useSearchParams } from "../../utils/urlutils";

export const ABOUT_US_PROJECT_TAB_INDEX = 0;
export const ABOUT_US_TEAM_TAB_INDEX = 1;
export const ABOUT_US_CONTACT_TAB_INDEX = 2;

/* TODO - Align with mocks, Clean up CSS */
export function AboutUsPage() {
  const params = useSearchParams();

  const [tabIndex, setTabIndex] = React.useState(
    params[TAB_PARAM] ? Number(params[TAB_PARAM]) : 0
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
      >
        <Tab label="The Project" />
        <Tab label="Our Team" />
        <Tab label="Contact Us" />
      </Tabs>
      {tabIndex === 0 && <TheProjectTab />}
      {tabIndex === 1 && <OurTeamTab />}
      {tabIndex === 2 && <ContactUsTab />}
    </div>
  );
}
