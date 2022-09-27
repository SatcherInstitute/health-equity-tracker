import React, { useEffect } from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import { useUrlSearchParams } from "../../utils/urlutils";
import {
  NEWS_TAB_LINK,
  FAQ_TAB_LINK,
  RESOURCES_TAB_LINK,
  WHAT_IS_HEALTH_EQUITY_PAGE_LINK,
} from "../../utils/internalRoutes";
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { Link, Redirect, Route, Switch } from "react-router-dom";

const EquityTab = React.lazy(() => import("./EquityTab"));
const FaqTab = React.lazy(() => import("./FaqTab"));
const NewsTab = React.lazy(() => import("./NewsTab"));
const ResourcesTab = React.lazy(() => import("./ResourcesTab"));

export default function WhatIsHealthEquityPage() {
  const theme = useTheme();
  const pageIsWide = useMediaQuery(theme.breakpoints.up("sm"));
  const [tabLayout, setTabLayout] = React.useState({});

  // when screen width changes, update tab spacing material UI attribute
  useEffect(() => {
    setTabLayout(pageIsWide ? { centered: true } : { variant: "fullWidth" });
  }, [pageIsWide]);

  return (
    <div>
      {/*  intercept old FAQ via query params for backwards compatible links */}
      {useUrlSearchParams().get("tab") === "1" && (
        <Redirect
          to={{
            pathname: FAQ_TAB_LINK,
          }}
        />
      )}
      <Route path="/">
        <Tabs
          {...tabLayout}
          indicatorColor="primary"
          textColor="primary"
          value={
            window.location.pathname.includes(NEWS_TAB_LINK) &&
            window.location.pathname !== NEWS_TAB_LINK
              ? false
              : window.location.pathname
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
            value={NEWS_TAB_LINK}
            label="News"
            component={Link}
            to={NEWS_TAB_LINK}
          />
          <Tab
            value={RESOURCES_TAB_LINK}
            label="Resources"
            component={Link}
            to={RESOURCES_TAB_LINK}
          />
        </Tabs>
      </Route>

      <Switch>
        <Route path={`${FAQ_TAB_LINK}/`}>
          <FaqTab />
        </Route>
        <Route path={`${NEWS_TAB_LINK}/`}>
          <NewsTab />
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
