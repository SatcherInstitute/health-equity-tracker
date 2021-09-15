import React from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import styles from "./WhatIsHealthEquityPage.module.scss";
import EquityTab from "./EquityTab";
import FaqTab from "./FaqTab";
import { WHAT_IS_HEALTH_EQUITY_PAGE_LINK } from "../../utils/urlutils";
import ResourcesTab from "./ResourcesTab";
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useEffect } from "react";
import { Link, Route, Switch } from "react-router-dom";

export default function WhatIsHealthEquityPage() {
  // responsive tabs layout to fix mobile bug
  const theme = useTheme();
  const pageIsWide = useMediaQuery(theme.breakpoints.up("sm"));
  const [tabLayout, setTabLayout] = React.useState({});

  // when screen width changes, update tab spacing material UI attribute
  useEffect(() => {
    setTabLayout(pageIsWide ? { centered: true } : { variant: "fullWidth" });
  }, [pageIsWide]);

  return (
    <div className={styles.WhatIsHealthEquityPage}>
      <Route
        path="/"
        render={(history) => (
          <Tabs
            {...tabLayout}
            indicatorColor="primary"
            textColor="primary"
            value={history.location.pathname}
          >
            <Tab
              value={WHAT_IS_HEALTH_EQUITY_PAGE_LINK}
              label="What Is Health Equity?"
              component={Link}
              to={WHAT_IS_HEALTH_EQUITY_PAGE_LINK}
            />
            <Tab
              value={`${WHAT_IS_HEALTH_EQUITY_PAGE_LINK}/faqs`}
              label="FAQs"
              component={Link}
              to={`${WHAT_IS_HEALTH_EQUITY_PAGE_LINK}/faqs`}
            />
            <Tab
              value={`${WHAT_IS_HEALTH_EQUITY_PAGE_LINK}/resources`}
              label="Resources"
              component={Link}
              to={`${WHAT_IS_HEALTH_EQUITY_PAGE_LINK}/resources`}
            />
          </Tabs>
        )}
      />

      <Switch>
        <Route
          path={`${WHAT_IS_HEALTH_EQUITY_PAGE_LINK}/faqs`}
          component={FaqTab}
        />
        <Route
          path={`${WHAT_IS_HEALTH_EQUITY_PAGE_LINK}/resources`}
          component={ResourcesTab}
        />
        <Route
          path={`${WHAT_IS_HEALTH_EQUITY_PAGE_LINK}/`}
          component={EquityTab}
        />
      </Switch>
    </div>
  );
}
