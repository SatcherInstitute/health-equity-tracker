import React, { useEffect } from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import styles from "./AboutUsPage.module.scss";
import TheProjectTab from "./TheProjectTab";
import OurTeamTab from "./OurTeamTab";
import ContactUsTab from "./ContactUsTab";
import {
  ABOUT_US_PAGE_LINK,
  TAB_PARAM,
  useSearchParams,
} from "../../utils/urlutils";
import { useHistory } from "react-router-dom";
import { friendlyTabNamesAboutUs } from "../../utils/urlutils";

export const ABOUT_US_PROJECT_TAB_INDEX = 0;
export const ABOUT_US_TEAM_TAB_INDEX = 1;
export const ABOUT_US_CONTACT_TAB_INDEX = 2;

export function AboutUsPage() {
  const history = useHistory();
  const params = useSearchParams();

  const [tabIndex, setTabIndex] = React.useState(
    params[TAB_PARAM]
      ? Number(friendlyTabNamesAboutUs.indexOf(params[TAB_PARAM]))
      : 0
  );

  const [locationKeys, setLocationKeys] = React.useState<
    (string | undefined)[]
  >([]);

  useEffect(() => {
    history.push(
      `${ABOUT_US_PAGE_LINK}?${TAB_PARAM}=${friendlyTabNamesAboutUs[tabIndex]}`
    );
  }, [history, tabIndex]);

  useEffect(() => {
    return history.listen((location) => {
      if (history.action === "POP") {
        if (locationKeys[1] === location.key) {
          // Handle forward event
          setLocationKeys(([_, ...keys]) => keys);
        } else {
          // Handle back event
          setLocationKeys((keys) => [location.key, ...keys]);
        }

        window.location.reload();
      }
    });
  }, [history, locationKeys]);

  const handleChange = (event: React.ChangeEvent<{}>, newTabIndex: number) => {
    setTabIndex(newTabIndex);
  };

  return (
    <div className={styles.AboutUsPage}>
      <Tabs
        tabIndex={tabIndex}
        value={tabIndex}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        centered
      >
        <Tab label="The Project" />
        <Tab label="Our Team" />
        <Tab label="Contact Us" />
      </Tabs>
      {tabIndex === 0 && <TheProjectTab />}
      {tabIndex === 1 && <OurTeamTab />}
      {tabIndex === 2 && <ContactUsTab />}
    </div>
  );
}
