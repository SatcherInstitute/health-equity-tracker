import React, { useState } from "react";
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

const categories = [
  {
    name: "Data",
    link: DATA_CATALOG_PAGE_LINK,
    topics: [
      {
        label: "Sources & Downloads",
        link: "/",
      },
      {
        label: "Limitations",
        link: "/",
      },
      {
        label: "Suggest Data Source",
        link: "/",
      },
    ],
  },
  {
    name: "Methodology",
    link: METHODOLOGY_TAB_LINK,
    topics: [
      {
        label: "Acquisition & Standardization",
        link: "/",
      },
      {
        label: "Age Adjustment",
        link: "/",
      },
      {
        label: "Disclaimers & Alerts",
        link: "/",
      },
    ],
  },
  {
    name: "Glossary",
    link: "/",
    topics: [
      {
        label: "Topics",
        link: "/",
      },
      {
        label: "Key Terms & Definitions",
        link: "/",
      },
      {
        label: "Tools & Resources",
        link: "/",
      },
    ],
  },
  {
    name: "Take Action",
    link: "/",
    topics: [
      {
        label: "Cite the Tracker",
        link: "/",
      },
      {
        label: "Supporting Research",
        link: "/",
      },
      {
        label: "Share Feedback",
        link: "/",
      },
    ],
  },
];

const siteResources = [
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
  const urlPath = window.location.pathname;
  const arrayLength = categories.length - 1;

  const selectedTab = (link: string) => {
    if (urlPath === link) {
      return link;
    }
    return false;
  };

  return (
    <>
      <Route path="/">
        <div className={styles.MenuContainer}>
          {categories.map((category, index) => (
            <>
              <Tabs
                className={styles.CategoryContainer}
                TabIndicatorProps={{
                  style: {
                    width: "100%",
                    opacity: 0.2,
                  },
                }}
                key={category.name}
                orientation="vertical"
                value={selectedTab(category.link)}
              >
                <Tab
                  className={styles.Category}
                  component={Link}
                  label={category.name}
                  to={category.link}
                  value={category.link}
                />
                {category.topics.map((topic) => (
                  <Tab
                    key={topic.label}
                    className={styles.Topic}
                    component={Link}
                    label={topic.label}
                    to={topic.link}
                    value={topic.link}
                  />
                ))}
              </Tabs>
              {index < arrayLength && (
                <div className={styles.Divider} key={index} />
              )}
            </>
          ))}
          <Card className={styles.Resources}>
            {siteResources.map((resource, index) => (
              <a href="/" className={styles.ResourceLink} key={resource.topic}>
                {resource.icon}
                <span className={styles.ResourceTopic} key={index}>
                  {resource.topic}
                </span>
              </a>
            ))}
          </Card>
        </div>
      </Route>
    </>
  );
};

export default MethodologyBanner;
