import React from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import TheProjectTab from "./TheProjectTab";
import OurTeamTab from "./OurTeamTab";
import ContactUsTab from "./ContactUsTab";
import {
  ABOUT_US_PAGE_LINK,
  CONTACT_TAB_LINK,
  OURTEAM_TAB_LINK,
} from "../../utils/urlutils";
import styles from "./AboutUsPage.module.scss";
import { Link, Route, Switch } from "react-router-dom";

export default function AboutUsPage() {
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
              value={`${OURTEAM_TAB_LINK}`}
              label="Our Team"
              component={Link}
              to={`${OURTEAM_TAB_LINK}`}
            />
            <Tab
              value={`${CONTACT_TAB_LINK}`}
              label="Contact Us"
              component={Link}
              to={`${CONTACT_TAB_LINK}`}
            />
          </Tabs>
        )}
      />

      <Switch>
        <Route path={`${OURTEAM_TAB_LINK}/`} component={OurTeamTab} />
        <Route path={`${CONTACT_TAB_LINK}/`} component={ContactUsTab} />
        <Route path={`${ABOUT_US_PAGE_LINK}/`} component={TheProjectTab} />
      </Switch>
    </div>
  );
}
