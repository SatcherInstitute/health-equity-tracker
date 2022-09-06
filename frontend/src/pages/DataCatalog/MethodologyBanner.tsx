import React from "react";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import { Card } from "@material-ui/core";
import {
  DATA_CATALOG_PAGE_LINK,
  METHODOLOGY_TAB_LINK,
} from "../../utils/internalRoutes";
import { Link, Route } from "react-router-dom";
import SearchIcon from "@material-ui/icons/Search";
import { InsertDriveFile, OndemandVideo } from "@material-ui/icons/";
import styles from "./MethodologyBanner.module.scss";

const dataCategory = [
  "Sources & Downloads",
  "Limitations",
  "Suggest Data Source",
];

const methCategory = [
  "Acquisition & Standardization",
  "Age Adjustment",
  "Disclaimers & Alerts",
];

const glossCategory = [
  "Topics",
  "Key Terms & Definitions",
  "Tools & Resources",
];

const takeAction = [
  "Cite the Tracker",
  "Supporting Research",
  "Share Feedback",
];

const keyInsights = [
  {
    topic: "Key Insights",
    icon: <SearchIcon />,
  },
  {
    topic: "Academic Paper",
    icon: <InsertDriveFile />,
  },
  {
    topic: "Video Demo",
    icon: <OndemandVideo />,
  },
];

const MethodologyBanner = () => {
  console.log(window.location.pathname);
  return (
    <>
      <Route path="/">
        <Tabs centered className={styles.Menu} value={window.location.pathname}>
          <Card className={styles.Category}>
            <Tab
              className={styles.Tab}
              label="Data"
              component={Link}
              value={DATA_CATALOG_PAGE_LINK}
              to={DATA_CATALOG_PAGE_LINK}
            />
            {dataCategory.map((topic) => (
              <a className={styles.Topic} href="/">
                {topic}
              </a>
            ))}
            <div className={styles.Divider}></div>
          </Card>
          <Card className={styles.Category}>
            <Tab
              className={styles.Tab}
              label="Methodology"
              component={Link}
              value={METHODOLOGY_TAB_LINK}
              to={METHODOLOGY_TAB_LINK}
            />
            {methCategory.map((topic) => (
              <a className={styles.Topic} href="/">
                {topic}
              </a>
            ))}
            <div className={styles.Divider}></div>
          </Card>
          <Card className={styles.Category}>
            <Tab
              className={styles.Tab}
              label="Glossary"
              component={Link}
              value={METHODOLOGY_TAB_LINK}
              to={METHODOLOGY_TAB_LINK}
            />
            {glossCategory.map((topic) => (
              <a className={styles.Topic} href="/">
                {topic}
              </a>
            ))}
            <div className={styles.Divider}></div>
          </Card>
          <Card className={styles.Category}>
            <Tab
              className={styles.Tab}
              label="Take Action"
              component={Link}
              value={METHODOLOGY_TAB_LINK}
              to={METHODOLOGY_TAB_LINK}
            />
            {takeAction.map((topic) => (
              <a className={styles.Topic} href="/">
                {topic}
              </a>
            ))}
          </Card>
          <Card className={styles.KeyInsights}>
            {keyInsights.map((topic) => (
              <a className={styles.Topic} href="/">
                {topic.icon}
                <span className={styles.testing}>{topic.topic}</span>
              </a>
            ))}
          </Card>
        </Tabs>
      </Route>
    </>
  );
};

export default MethodologyBanner;
