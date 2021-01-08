import React from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Tabs from "@material-ui/core/Tabs";
import Button from "@material-ui/core/Button";
import Tab from "@material-ui/core/Tab";
import styles from "./AboutUsPage.module.scss";
import AboutUsFaqTab from "./ui/AboutUsFaqTab";
import AboutUsTrackerTab from "./ui/AboutUsTrackerTab";
import AboutUsOurTeamTab from "./ui/AboutUsOurTeamTab";
import AboutUsContactUsTab from "./ui/AboutUsContactUsTab";

function AboutUsPage() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div className={styles.AboutUsPage}>
      <Grid container justify="space-around" className={styles.Grid}>
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
        {value === 0 && <AboutUsTrackerTab />}
        {value === 1 && <AboutUsOurTeamTab />}
        {value === 2 && <AboutUsFaqTab />}
        {value === 3 && <AboutUsContactUsTab />}
      </Grid>
    </div>
  );
}

export default AboutUsPage;
