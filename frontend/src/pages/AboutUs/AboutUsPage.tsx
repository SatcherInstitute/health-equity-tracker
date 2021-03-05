import React from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import styles from "./AboutUsPage.module.scss";
import FaqTab from "./FaqTab";
import TrackerTab from "./TrackerTab";
import OurTeamTab from "./OurTeamTab";
import ContactUsTab from "./ContactUsTab";

/* TODO - Align with mocks, Clean up CSS */
function AboutUsPage() {
  const [tabIndex, setTabIndex] = React.useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newTabIndex: number) => {
    setTabIndex(newTabIndex);
  };

  return (
    <div className={styles.AboutUsPage}>
      <Tabs
        tabIndex={tabIndex}
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
      {tabIndex === 0 && <TrackerTab />}
      {tabIndex === 1 && <OurTeamTab />}
      {tabIndex === 2 && <FaqTab setTabIndexFx={setTabIndex} />}
      {tabIndex === 3 && <ContactUsTab />}
    </div>
  );
}

export default AboutUsPage;
