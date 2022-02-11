import React from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import {
  ABOUT_US_PAGE_LINK,
  CONTACT_TAB_LINK,
  OURTEAM_TAB_LINK,
  useUrlSearchParams,
} from "../../utils/urlutils";
import styles from "./AboutUsPage.module.scss";
import { Link, Redirect, Route, Switch } from "react-router-dom";
import OurTeamTab from "./OurTeamTab";
import ContactUsTab from "./ContactUsTab";
import TheProjectTab from "./TheProjectTab";

export default function AboutUsPage() {
  return (
    <div className={styles.AboutUsPage}>
      {/*  intercept old CONTACT via query params for backwards compatible links */}
      {useUrlSearchParams().get("tab") === "2" && (
        <Redirect
          to={{
            pathname: CONTACT_TAB_LINK,
          }}
        />
      )}
      <Route path="/">
        <Tabs
          indicatorColor="primary"
          textColor="primary"
          centered
          value={window.location.pathname}
        >
          <Tab
            value={ABOUT_US_PAGE_LINK}
            label="The Project"
            component={Link}
            to={ABOUT_US_PAGE_LINK}
          />
          <Tab
            value={OURTEAM_TAB_LINK}
            label="Our Team"
            component={Link}
            to={OURTEAM_TAB_LINK}
          />
          <Tab
            value={CONTACT_TAB_LINK}
            label="Contact Us"
            component={Link}
            to={CONTACT_TAB_LINK}
          />
        </Tabs>
      </Route>

      <Switch>
        <Route path={`${OURTEAM_TAB_LINK}/`}>
          <OurTeamTab />
        </Route>
        <Route path={`${CONTACT_TAB_LINK}/`}>
          <ContactUsTab />
        </Route>
        <Route path={`${ABOUT_US_PAGE_LINK}/`}>
          <TheProjectTab />
        </Route>
      </Switch>
    </div>
  );
}
