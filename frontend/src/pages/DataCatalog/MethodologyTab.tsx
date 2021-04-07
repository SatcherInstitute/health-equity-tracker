import React from "react";
import Grid from "@material-ui/core/Grid";
import styles from "./DataCatalogPage.module.scss";
import {
  LinkWithStickyParams,
  ABOUT_US_TAB_PARAM,
  ABOUT_US_PAGE_LINK,
} from "../../utils/urlutils";
import { ABOUT_US_CONTACT_TAB_INDEX } from "../AboutUs/AboutUsPage";

function MethodologyTab() {
  return (
    <Grid
      container
      className={styles.Grid}
      direction="column"
      justify="space-around"
      alignItems="center"
    >
      <Grid item xs={12} sm={12} md={9}>
        <Grid container className={styles.MethodologySection}>
          <Grid item xs={12} className={styles.MethodologyQuestionAndAnswer}>
            <span className={styles.MethodologyQuestion}>
              How did you ingest and standardize the data?
            </span>
            <div className={styles.MethodologyAnswer}>
              <ul>
                <li>
                  Our data is retrieved via a mix of APIs and manual downloads
                </li>
                <li>
                  Once acquired, this data is converted to tables in Google
                  BigQuery
                </li>
                <li>
                  During this process, values are standardized and normalized to
                  facilitate reporting, comparison and visualization
                </li>
                <li>
                  Sources are refreshed when update notifications are received
                </li>
              </ul>
            </div>
          </Grid>
          <Grid item xs={12} className={styles.MethodologyQuestionAndAnswer}>
            <span className={styles.MethodologyQuestion}>
              What are the limitations of the data?
            </span>
            <div className={styles.MethodologyAnswer}>
              <p>
                Unfortunately, with these publically available data sets, there
                are crucial pieces missing, including but not limited to:
                comprehensive city-, census tract-, and county-level data;
                comprehensive race and ethnicity breakdowns; comprehensive
                gender and age breakdowns by county, etc.
              </p>
              <span className={styles.MethodologySubheaderText}>
                Known limitations in the data
              </span>
              <ul>
                <li>
                  To protect the privacy of affected individuals, COVID-19 data
                  may be hidden in counties with smaller numbers of COVID-19
                  cases, hospitalizations and deaths.
                </li>
                <li>
                  Specific racial and ethnic categories (e.g. “Native Hawaiian,”
                  “Alaska Native”) differ by source and can be inappropriately
                  obscured by broader categories (e.g. “Other,” “Asian”).
                </li>
                <li>
                  National statistics are aggregations of state-wide data. If
                  state data is not available, these aggregations may be
                  incomplete and potentially skewed.
                </li>
                <li>
                  We typically refresh our data sources with newly available
                  data within a few days. Seeking the latest information? Please
                  navigate to the data sources directly.
                </li>
              </ul>
            </div>
          </Grid>
          <Grid item xs={12} className={styles.MethodologyQuestionAndAnswer}>
            <span className={styles.MethodologyQuestion}>
              What data is missing?
            </span>
            <div className={styles.MethodologyAnswer}>
              <p>
                Our tracker is iterating and expanding to include additional
                health variables, social and political determinants of health,
                and increasing coverage at the state, county, and census-tract
                levels
              </p>
            </div>
            <div className={styles.MethodologyInfoBar}>
              <p>
                Do you have information on health outcomes at the state and
                local level?
                <br />
                <LinkWithStickyParams
                  class={styles.MethodologyContactUsLink}
                  to={`${ABOUT_US_PAGE_LINK}?${ABOUT_US_TAB_PARAM}=${ABOUT_US_CONTACT_TAB_INDEX}`}
                >
                  We would love to hear from you
                </LinkWithStickyParams>
              </p>
            </div>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default MethodologyTab;
