import React from "react";
import Grid from "@material-ui/core/Grid";
import styles from "./DataCatalogPage.module.scss";
import { Helmet } from "react-helmet-async";
import {
  AGE_ADJ,
  COVID_DEATHS_US_SETTING,
  COVID_HOSP_US_SETTING,
  EXPLORE_DATA_PAGE_LINK,
} from "../../utils/urlutils";
import { Link } from "react-router-dom";
import { Button } from "@material-ui/core";

function AgeAdjustmentTab() {
  return (
    <>
      <Helmet>
        <title>Age Adjustment - Health Equity Tracker</title>
      </Helmet>
      <h2 className={styles.ScreenreaderTitleHeader}>Age Adjustment</h2>
      <Grid
        container
        direction="column"
        justifyContent="space-around"
        alignItems="center"
      >
        <Grid container className={styles.MethodologySection}>
          {/* Age-adjusted Info */}
          <Grid
            item
            className={styles.MethodologyQuestionAndAnswer}
            component="article"
          >
            <h3 className={styles.MethodologyQuestion}>
              Calculating Age-adjusted Ratios
            </h3>

            <div className={styles.MethodologyAnswer}>
              <p>
                We have decided to present age-adjusted ratios when possible in
                order to show a more accurate and equitable view of the impact
                on non-white communities in the United States. Currently, we are
                able to calculate these age-adjusted ratios for{" "}
                <Link
                  to={
                    EXPLORE_DATA_PAGE_LINK +
                    COVID_DEATHS_US_SETTING +
                    "#" +
                    AGE_ADJ
                  }
                >
                  COVID-19 deaths
                </Link>
                {" and "}
                <Link
                  to={
                    EXPLORE_DATA_PAGE_LINK +
                    COVID_HOSP_US_SETTING +
                    "#" +
                    AGE_ADJ
                  }
                >
                  hospitalizations
                </Link>
                , and we present the findings in a distinct, age-adjusted table.
                All of the other data shown on the tracker, including
                visualizations across all topics, are not age-adjusted. Showing
                non-adjusted data can mask disparities, and we are working to
                expand our analysis to provide a more equitable view of the
                impact to racial and ethnic minorities.
              </p>

              <h4 className={styles.MethodologySubsubheaderText}>
                Data Sourcing
              </h4>

              <p>
                In order to do an age adjustment, we needed the following pieces
                of information:
              </p>

              <ol>
                <li>
                  <b>
                    COVID deaths and hospitalizations broken down by age and
                    race:
                  </b>

                  <p>
                    We were able to use the{" "}
                    <a href="https://data.cdc.gov/Case-Surveillance/COVID-19-Case-Surveillance-Restricted-Access-Detai/mbd7-r32t">
                      CDC Case Surveillance Restricted Access Detailed Data
                    </a>{" "}
                    for this. It can break down by race and age to ten year
                    buckets. The age buckets are: <b>0-9</b>, <b>10-19</b>,{" "}
                    <b>20-29</b>, <b>30-39</b>, <b>40-49</b>, <b>50-59</b>,{" "}
                    <b>60-69</b>, <b>70-79</b>, <b>80+</b>
                  </p>
                </li>

                <li>
                  <b>Population numbers broken down by race and age:</b>

                  <p>
                    The most reliable population source we could find with these
                    numbers were the{" "}
                    <a href="https://www.census.gov/data/tables/time-series/demo/popest/2010s-counties-detail.html">
                      County Population by Characteristics
                    </a>{" "}
                    numbers provided by the census. They break down to the
                    correct racial and age groupings that match the cdc
                    restricted dataset.
                  </p>
                </li>
              </ol>

              <h4 className={styles.MethodologySubsubheaderText}>Algorithm</h4>

              <p>
                In order to generate the age adjusted deaths and hospitalization
                ratios, we do the following
              </p>

              <ol>
                <li>
                  <p>
                    <b>
                      For each race and age block, calculate the true death
                      rate:
                    </b>
                  </p>
                  <pre>
                    true_death_rate = (COVID Deaths for race A, age group 1) /
                    (Population of race A, age group 1)
                  </pre>
                </li>

                <li>
                  <p>
                    <b>
                      Calculate the expected deaths for each race/age group:
                    </b>
                  </p>
                  <p>
                    To do this we multiply the true death rate by the population
                    of <b>White (Non-Hispanic)</b> for that age group.
                  </p>
                  <pre>
                    expected_deaths = true_death_rate * (White (Non-Hispanic)
                    Population for age group)
                  </pre>
                </li>

                <li>
                  <p>
                    <b>
                      Calculate the total expected deaths for each racial group:
                    </b>
                  </p>
                  <p>
                    For each racial group, sum together the expected deaths for
                    each age group.
                  </p>
                </li>

                <li>
                  <p>
                    <b>Calculate the age-adjusted death ratios:</b>
                  </p>
                  <p>
                    Divide the total expected deaths of each race by the total
                    white deaths.
                  </p>
                </li>
              </ol>

              <h4 className={styles.MethodologySubsubheaderText}>Edge cases</h4>

              <p>
                If a ratio ends up being less than<code>0.1</code>, we mark it
                on the tracker as <code>Insufficient Data</code>.
              </p>

              <h3 className={styles.MethodologyQuestion}>
                Age-adjustment Example
              </h3>

              <p>
                Here is an example of a single state with two races,{" "}
                <b>Race A</b> and <b>Race B</b>, with three age breakdowns:{" "}
                <b>0-29</b>, <b>30-59</b>, and <b>60+</b>. <b>Race A</b> will be
                the standard race we are comparing against (like{" "}
                <b>White, Non-Hispanic</b>), and <b>Race B</b> is any other
                racial group.
              </p>

              <table className={styles.ExampleTable}>
                <thead>
                  <tr>
                    <td>Race</td>
                    <td>Age-group</td>
                    <td>Deaths</td>
                    <td>Population</td>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>Race A</td>
                    <td>0-29</td>
                    <td>50</td>
                    <td>600,000</td>
                  </tr>

                  <tr>
                    <td>Race A</td>
                    <td>30-59</td>
                    <td>500</td>
                    <td>800,000</td>
                  </tr>

                  <tr>
                    <td>Race A</td>
                    <td>60+</td>
                    <td>5,000</td>
                    <td>200,000</td>
                  </tr>

                  <tr>
                    <td>Race B</td>
                    <td>0-29</td>
                    <td>20</td>
                    <td>200,000</td>
                  </tr>

                  <tr>
                    <td>Race B</td>
                    <td>30-59</td>
                    <td>200</td>
                    <td>300,000</td>
                  </tr>

                  <tr>
                    <td>Race B</td>
                    <td>60+</td>
                    <td>800</td>
                    <td>60,000</td>
                  </tr>
                </tbody>
              </table>

              <h4 className={styles.MethodologySubsubheaderText}>
                First, we calculate the expected deaths for each age/race group:
              </h4>

              <p>
                As noted above, the formula for each row is:{" "}
                <code>
                  (Deaths / Population) * Corresponding Population for Race A
                </code>
              </p>

              <table className={styles.ExampleTable}>
                <thead>
                  <tr>
                    <td>Race</td>
                    <td>Age-group</td>
                    <td>Deaths</td>
                    <td>Population</td>
                    <td>Expected deaths</td>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>Race A</td>
                    <td>0-29</td>
                    <td>50</td>
                    <td>600,000</td>
                    <td>
                      <div className={styles.Calculation}>
                        50 / 600,000 * 600,000
                      </div>
                      <b> = 50</b>
                    </td>
                  </tr>

                  <tr>
                    <td>Race A</td>
                    <td>30-59</td>
                    <td>500</td>
                    <td>800,000</td>
                    <td>
                      <div className={styles.Calculation}>
                        500 / 800,000 * 800,000
                      </div>
                      <b> = 500</b>
                    </td>
                  </tr>

                  <tr>
                    <td>Race A</td>
                    <td>60+</td>
                    <td>5,000</td>
                    <td>200,000</td>
                    <td>
                      <div className={styles.Calculation}>
                        5,000 / 200,000 * 200,000
                      </div>
                      <b> = 5,000</b>
                    </td>
                  </tr>

                  <tr>
                    <td>Race B</td>
                    <td>0-29</td>
                    <td>20</td>
                    <td>200,000</td>
                    <td>
                      <div className={styles.Calculation}>
                        20 / 200,000 * 600,000
                      </div>
                      <b> = 60</b>
                    </td>
                  </tr>

                  <tr>
                    <td>Race B</td>
                    <td>30-59</td>
                    <td>200</td>
                    <td>300,000</td>
                    <td>
                      <div className={styles.Calculation}>
                        200 / 300,000 * 800,000
                      </div>
                      <b> = 533.33</b>
                    </td>
                  </tr>

                  <tr>
                    <td>Race B</td>
                    <td>60+</td>
                    <td>800</td>
                    <td>60,000</td>
                    <td>
                      <div className={styles.Calculation}>
                        800 / 60,000 * 200,000
                      </div>
                      <b> = 2666.67</b>
                    </td>
                  </tr>
                </tbody>
              </table>

              <h4 className={styles.MethodologySubsubheaderText}>
                Second, we sum together the expected deaths for each race to
                calculate the total expected deaths:
              </h4>

              <table className={styles.ExampleTable}>
                <thead>
                  <tr>
                    <td>Race</td>
                    <td>Total expected deaths</td>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>Race A</td>
                    <td>
                      <div className={styles.Calculation}>5,000 + 500 + 50</div>
                      <b>= 5,550</b>
                    </td>
                  </tr>
                  <tr>
                    <td>Race B</td>
                    <td>
                      <div className={styles.Calculation}>
                        60 + 533.33 + 2666.67
                      </div>
                      <b>= 3260</b>
                    </td>
                  </tr>
                </tbody>
              </table>

              <h4 className={styles.MethodologySubsubheaderText}>
                Finally, we will calculate the age adjusted death ratio:
              </h4>

              <table className={styles.ExampleTable}>
                <thead>
                  <tr>
                    <td>Race</td>
                    <td>Total expected deaths</td>
                    <td>Age-adjusted death ratio</td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Race A</td>
                    <td>5,550</td>
                    <td>
                      <div className={styles.Calculation}>5,550 / 5,550</div>
                      <b>= 1.0×</b>
                    </td>
                  </tr>
                  <tr>
                    <td>Race B</td>
                    <td>3260</td>
                    <td>
                      <div className={styles.Calculation}>3,260 / 5,550</div>
                      <b>= 0.6×</b>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Grid>
        </Grid>

        <Grid item xs={12} sm={12} md={8} lg={5}>
          <Button
            variant="contained"
            color="primary"
            className={styles.PrimaryButton}
            href={
              EXPLORE_DATA_PAGE_LINK + COVID_DEATHS_US_SETTING + "#" + AGE_ADJ
            }
          >
            Explore the age-adjusted data
          </Button>
        </Grid>
      </Grid>
    </>
  );
}

export default AgeAdjustmentTab;
