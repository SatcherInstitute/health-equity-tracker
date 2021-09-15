import React from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import TheProjectTab from "./TheProjectTab";
import OurTeamTab from "./OurTeamTab";
import ContactUsTab from "./ContactUsTab";
import {
  ABOUT_US_PAGE_LINK,
  CONTACT_TAB,
  useSearchParams,
} from "../../utils/urlutils";
import styles from "./AboutUsPage.module.scss";
import { Link, Route, Switch } from "react-router-dom";

export default function AboutUsPage() {
  const params = useSearchParams();

  return (
    <div className={styles.AboutUsPage}>
      <Route
        path="/"
        render={(history) => (
          <Tabs
            indicatorColor="primary"
            textColor="primary"
            centered
            value={history.location.pathname}
          >
            <Tab
              value={ABOUT_US_PAGE_LINK}
              label="The Project"
              component={Link}
              to={ABOUT_US_PAGE_LINK}
            />
            <Tab
              value={`${ABOUT_US_PAGE_LINK}/team`}
              label="Our Team"
              component={Link}
              to={`${ABOUT_US_PAGE_LINK}/team`}
            />
            <Tab
              value={`${ABOUT_US_PAGE_LINK}${CONTACT_TAB}`}
              label="Contact Us"
              component={Link}
              to={`${ABOUT_US_PAGE_LINK}${CONTACT_TAB}`}
            />
          </Tabs>
        )}
      />

      <Switch>
        <Route path={`${ABOUT_US_PAGE_LINK}/team`} component={OurTeamTab} />
        <Route
          path={`${ABOUT_US_PAGE_LINK}/contact`}
          component={ContactUsTab}
        />
        <Route path={`${ABOUT_US_PAGE_LINK}/`} component={TheProjectTab} />
      </Switch>
    </div>
  );
}
