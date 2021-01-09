import React from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import styles from "./AboutUsPage.module.scss";
import FaqTab from "./FaqTab";
import TrackerTab from "./TrackerTab";
import OurTeamTab from "./OurTeamTab";
import ContactUsTab from "./ContactUsTab";

function AboutUsPage() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div className={styles.AboutUsPage}>
      <Tabs
        value={value}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        centered
        style={{ marginTop: "40px" }}
      >
        <Tab label="The Tracker" />
        <Tab label="Our Team" />
        <Tab label="Frequently Asked Questions" />
        <Tab label="Contact Us" />
      </Tabs>
      {value === 0 && <TrackerTab />}
      {value === 1 && <OurTeamTab />}
      {value === 2 && <FaqTab />}
      {value === 3 && <ContactUsTab />}
    </div>
  );
}

export default AboutUsPage;
