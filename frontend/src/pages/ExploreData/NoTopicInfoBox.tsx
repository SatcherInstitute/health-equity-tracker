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
import styles from "./ExploreDataPage.module.scss";

export default function NoTopicInfoBox() {
  return (
    <div className={styles.NoTopicContent}>
      <Alert severity="info">
        <Grid container className={styles.NoTopicBox}>
          <Grid item xs={12} md={7}>
            <h3 className={styles.BigHeadline}>Select a topic above</h3>

            <h3 className={styles.LittleHeadline}>
              ...or take a look at some interesting reports:
            </h3>

            <ul className={styles.SuggestedReportsList}>
              <li className={styles.SuggestedReportsListItem}>
                <a href={EXPLORE_DATA_PAGE_LINK + COVID_DEATHS_AGE_USA_SETTING}>
                  COVID-19 deaths by age
                </a>
              </li>
              <li className={styles.SuggestedReportsListItem}>
                <a
                  href={
                    EXPLORE_DATA_PAGE_LINK + PRISON_VS_POVERTY_RACE_GA_SETTING
                  }
                >
                  Prison & poverty by race in Georgia
                </a>
              </li>
              <li className={styles.SuggestedReportsListItem}>
                <a
                  href={
                    EXPLORE_DATA_PAGE_LINK + UNINSURANCE_SEX_FL_VS_CA_SETTING
                  }
                >
                  Uninsurance by sex in Florida and California
                </a>
              </li>
            </ul>

            <p>
              To learn more about these topics, and why they were chosen, visit
              our <Link to={METHODOLOGY_TAB_LINK}>methodology</Link>.
            </p>
          </Grid>

          <Grid
            container
            item
            xs={12}
            md={5}
            direction="column"
            className={styles.NoTopicHelperVideoBox}
            alignItems="center"
            justifyContent="center"
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
      </Alert>
    </div>
  );
}
