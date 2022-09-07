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
  const [value, setValue] = useState(DATA_CATALOG_PAGE_LINK);

  const categories = [
    {
      category: "Data",
      link: DATA_CATALOG_PAGE_LINK,
      value:
        window.location.pathname === DATA_CATALOG_PAGE_LINK
          ? DATA_CATALOG_PAGE_LINK
          : false,
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
      category: "Methodology",
      link: METHODOLOGY_TAB_LINK,
      value:
        window.location.pathname === METHODOLOGY_TAB_LINK
          ? METHODOLOGY_TAB_LINK
          : false,
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
      category: "Glossary",
      link: "/",
      value: false,
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
      category: "Take Action",
      link: "/",
      value: false,
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

  return (
    <>
      <Route path="/">
        <div className={styles.MenuContainer}>
          {categories.map((category) => (
            <Tabs
              className={styles.CategoryContainer}
              indicatorColor={"secondary"}
              key={category.category}
              orientation="vertical"
              value={category.value}
              onChange={(event, value) => setValue(value)}
            >
              <Tab
                className={styles.Category}
                component={Link}
                label={category.category}
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
          ))}
          <Card className={styles.KeyInsights}>
            {siteResources.map((resource) => (
              <a className={styles.Topic} href="/" key={resource.topic}>
                {resource.icon}
                <span className={styles.testing}>{resource.topic}</span>
              </a>
            ))}
          </Card>
        </div>
      </Route>
    </>
  );
};

export default MethodologyBanner;
