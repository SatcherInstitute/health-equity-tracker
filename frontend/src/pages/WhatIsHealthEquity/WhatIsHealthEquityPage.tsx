import React from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import styles from "./WhatIsHealthEquityPage.module.scss";
import EquityTab from "./EquityTab";
import FaqTab from "./FaqTab";
// import { TAB_PARAM, useSearchParams } from "../../utils/urlutils";
import ResourcesTab from "./ResourcesTab";
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useEffect } from "react";
import BlogTab from "./BlogTab";
import { Link, Route, Switch } from "react-router-dom";

export const WIHE_HEALTH_EQUITY_TAB_INDEX = 0;
export const WIHE_FAQ_TAB_INDEX = 1;
export const WIHE_JOIN_THE_EFFORT_SECTION_ID = "join";

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
            // tabIndex={tabIndex}
            // value={tabIndex}
            {...tabLayout}
            // onChange={handleChange}
            indicatorColor="primary"
            textColor="primary"
            value={history.location.pathname}
          >
            <Tab
              value={"/whatishealthequity"}
              label="What Is Health Equity?"
              component={Link}
              to={"/whatishealthequity"}
            />
            <Tab
              value={"/whatishealthequity/faqs"}
              label="FAQs"
              component={Link}
              to={"/whatishealthequity/faqs"}
            />
            <Tab
              value={"/whatishealthequity/resources"}
              label="Resources"
              component={Link}
              to={"/whatishealthequity/resources"}
            />
            <Tab
              value={"/whatishealthequity/blog"}
              label="Blog"
              component={Link}
              to={"/whatishealthequity/blog"}
            />
          </Tabs>
        )}
      />

      <Switch>
        <Route path="/whatishealthequity/blog" component={BlogTab} />
        <Route path="/whatishealthequity/faqs" component={FaqTab} />
        <Route path="/whatishealthequity/resources" component={ResourcesTab} />
        <Route path="/whatishealthequity/" component={EquityTab} />
      </Switch>
    </div>
  );
}
