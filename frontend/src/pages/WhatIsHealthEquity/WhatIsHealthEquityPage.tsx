import React from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import styles from "./WhatIsHealthEquityPage.module.scss";
import EquityTab from "./EquityTab";
import FaqTab from "./FaqTab";
import {
  BLOG_TAB_LINK,
  FAQ_TAB_LINK,
  RESOURCES_TAB_LINK,
  WHAT_IS_HEALTH_EQUITY_PAGE_LINK,
  useQuery,
} from "../../utils/urlutils";
import ResourcesTab from "./ResourcesTab";
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useEffect } from "react";
import BlogTab from "./BlogTab";
import { Link, Redirect, Route, Switch } from "react-router-dom";

export interface WhatIsHealthEquityPageProps {
  articles?: any[];
  categories?: any[];
}

export default function WhatIsHealthEquityPage(
  props: WhatIsHealthEquityPageProps
) {
  const { articles, categories } = props;
  const theme = useTheme();
  const pageIsWide = useMediaQuery(theme.breakpoints.up("sm"));
  const [tabLayout, setTabLayout] = React.useState({});

  // TODO use existing width hook instead of duplicating here; responsive tabs layout to fix mobile bug
  // when screen width changes, update tab spacing material UI attribute
  useEffect(() => {
    setTabLayout(pageIsWide ? { centered: true } : { variant: "fullWidth" });
  }, [pageIsWide]);

  return (
    <div className={styles.WhatIsHealthEquityPage}>
      {/*  intercept old FAQ via query params for backwards compatible links */}
      {useQuery().get("tab") === "1" && (
        <Redirect
          to={{
            pathname: FAQ_TAB_LINK,
          }}
        />
      )}
      <Route
        path="/"
        render={(history) => (
          <Tabs
            {...tabLayout}
            indicatorColor="primary"
            textColor="primary"
            value={
              history.location.pathname.includes(BLOG_TAB_LINK) &&
              history.location.pathname !== BLOG_TAB_LINK
                ? false
                : history.location.pathname
            }
          >
            <Tab
              value={WHAT_IS_HEALTH_EQUITY_PAGE_LINK}
              label="What Is Health Equity?"
              component={Link}
              to={WHAT_IS_HEALTH_EQUITY_PAGE_LINK}
            />
            <Tab
              value={FAQ_TAB_LINK}
              label="FAQs"
              component={Link}
              to={FAQ_TAB_LINK}
            />
            <Tab
              value={BLOG_TAB_LINK}
              label="Blog"
              component={Link}
              to={BLOG_TAB_LINK}
            />
            <Tab
              value={RESOURCES_TAB_LINK}
              label="Resources"
              component={Link}
              to={RESOURCES_TAB_LINK}
            />
          </Tabs>
        )}
      />

      <Switch>
        <Route path={`${FAQ_TAB_LINK}/`}>
          <FaqTab />
        </Route>
        <Route path={`${BLOG_TAB_LINK}/`}>
          <BlogTab articles={articles!} categories={categories!} />
        </Route>
        <Route path={`${RESOURCES_TAB_LINK}/`}>
          <ResourcesTab />
        </Route>
        <Route path={`${WHAT_IS_HEALTH_EQUITY_PAGE_LINK}/`}>
          <EquityTab />
        </Route>
      </Switch>
    </div>
  );
}
