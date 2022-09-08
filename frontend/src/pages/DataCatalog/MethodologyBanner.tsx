import React, { Fragment, useState } from "react";
import SearchIcon from "@material-ui/icons/Search";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import { Card } from "@material-ui/core";
import { InsertDriveFile, OndemandVideo } from "@material-ui/icons/";
import { Link, Route } from "react-router-dom";
import styles from "./MethodologyBanner.module.scss";
import {
  AGE_ADJUSTMENT_TAB_LINK,
  DATA_CATALOG_PAGE_LINK,
  METHODOLOGY_TAB_LINK,
} from "../../utils/internalRoutes";

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
        link: AGE_ADJUSTMENT_TAB_LINK,
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
    link: "/",
  },
  {
    topic: "Academic Paper",
    icon: <InsertDriveFile />,
    link: "/",
  },
  {
    topic: "Video Demo",
    icon: <OndemandVideo />,
    link: "/",
  },
];

type Category = {
  name: string;
  link: string;
  topics: { label: string; link: string }[];
};

const MethodologyBanner = () => {
  const urlPath = window.location.pathname;
  const categoriesLength = categories.length - 1;
  const [isActive, setIsActive] = useState(false);

  const selectedTab = (category: Category) => {
    const topics = category.topics;
    const topic = topics.find((topic) => topic.link === urlPath);

    if (urlPath === category.link) {
      return category.link;
    }
    if (topic) {
      return topic.link;
    }
    return false;
  };

  return (
    <>
      <Route path="/">
        <div className={styles.MenuContainer}>
          {categories.map((category, index) => (
            <Fragment key={category.name}>
              <Tabs
                className={styles.CategoryContainer}
                TabIndicatorProps={{
                  style: {
                    width: "100%",
                    opacity: 0.2,
                  },
                }}
                orientation="vertical"
                value={selectedTab(category)}
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
              {index < categoriesLength && <div className={styles.Divider} />}
            </Fragment>
          ))}
          <Card className={styles.Resources}>
            {siteResources.map((resource, index) => (
              <a
                href={resource.link}
                className={styles.ResourceLink}
                key={`${resource.link} + ${index}`}
              >
                {resource.icon}
                <span className={styles.ResourceTopic} key={resource.topic}>
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
