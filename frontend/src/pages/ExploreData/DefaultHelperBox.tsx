import { Box, Grid } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import React from "react";
import { Link } from "react-router-dom";
import {
  COVID_DEATHS_AGE_USA_SETTING,
  EXPLORE_DATA_PAGE_LINK,
  METHODOLOGY_TAB_LINK,
  PRISON_VS_POVERTY_RACE_GA_SETTING,
  UNINSURANCE_SEX_FL_VS_CA_SETTING,
  WARM_WELCOME_DEMO_SETTING,
} from "../../utils/internalRoutes";
import styles from "./DefaultHelperBox.module.scss";

export default function DefaultHelperBox() {
  return (
    <Grid
      container
      alignContent="flex-start"
      justifyContent="center"
      className={styles.NoTopicContent}
    >
      <Alert severity="info" icon={<></>} className={styles.NoTopicAlert}>
        <Grid item xs={12} container className={styles.NoTopicBox}>
          <Grid item xs={12} md={6}>
            <h3 className={styles.BigHeadline}>Select a topic above</h3>

            <h3 className={styles.LittleHeadline}>
              ...or explore one of the following reports:
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
            <Box mt={5}>
              <p>
                To learn more about these topics, and why they were chosen,
                visit our <Link to={METHODOLOGY_TAB_LINK}>methodology</Link>.
              </p>
            </Box>
          </Grid>

          <Grid
            container
            item
            xs={12}
            md={6}
            className={styles.NoTopicHelperVideoBoxWithCaption}
            direction="column"
            alignItems="center"
            justifyContent="center"
          >
            <div className={styles.NoTopicHelperVideoBox}>
              <iframe
                className={styles.ResourceVideoEmbed}
                src="https://www.youtube.com/embed/XBoqT9Jjc8w"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write;
	encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <p>
              {/* 
              Watch a{" "}
                <a href="https://www.youtube.com/embed/XBoqT9Jjc8w">
                  video demo
                </a> or 
              */}
              <i>
                New to the tracker? Watch the video above, or take a{" "}
                <a href={EXPLORE_DATA_PAGE_LINK + WARM_WELCOME_DEMO_SETTING}>
                  guided tour of a COVID-19 report.
                </a>
              </i>
            </p>
          </Grid>
        </Grid>
      </Alert>
    </Grid>
  );
}
