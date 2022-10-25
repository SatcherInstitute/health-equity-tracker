import { Grid } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import React from "react";
import { Link } from "react-router-dom";
import {
  COVID_DEATHS_AGE_USA_SETTING,
  EXPLORE_DATA_PAGE_LINK,
  METHODOLOGY_TAB_LINK,
  PRISON_VS_POVERTY_RACE_GA_SETTING,
  UNINSURANCE_SEX_FL_VS_CA_SETTING,
} from "../../utils/internalRoutes";
import styles from "./OptionsSelector.module.scss";

export default function NoTopicInfoBox() {
  return (
    <Grid container className={styles.NoTopicInfoBox}>
      <Grid
        item
        xs={12}
        // md={6}
        container
      >
        <Alert severity="info">
          <h3>
            Select a topic and location by clicking the menu buttons above, or
            choose some pre-selected reports:
          </h3>

          <ul className={styles.SuggestedReportsList}>
            <li className={styles.SuggestedReportsListItem}>
              <a href={EXPLORE_DATA_PAGE_LINK + COVID_DEATHS_AGE_USA_SETTING}>
                Investigate rates of COVID-19 deaths by age in the United States
              </a>
            </li>
            <li className={styles.SuggestedReportsListItem}>
              <a
                href={
                  EXPLORE_DATA_PAGE_LINK + PRISON_VS_POVERTY_RACE_GA_SETTING
                }
              >
                Explore relationships between prison and poverty by race and
                ethnicity in Georgia
              </a>
            </li>
            <li className={styles.SuggestedReportsListItem}>
              <a
                href={EXPLORE_DATA_PAGE_LINK + UNINSURANCE_SEX_FL_VS_CA_SETTING}
              >
                Compare rates of uninsurance by sex between Florida and
                California
              </a>
            </li>
          </ul>
        </Alert>

        <p>
          To learn more about these topics, and why they were chosen, visit our{" "}
          <Link to={METHODOLOGY_TAB_LINK}>methodology</Link>.
        </p>
      </Grid>
      <Grid
        container
        item
        xs={12}
        direction="column"
        className={styles.NoTopicHelperVideoBox}
        alignItems="center"
      >
        <iframe
          className={styles.ResourceVideoEmbed}
          src="https://www.youtube.com/embed/XBoqT9Jjc8w"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write;
	encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
        <p>
          <i>New to the tracker? Watch a video demo</i>
        </p>
      </Grid>
    </Grid>
  );
}
