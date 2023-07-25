import Grid from '@mui/material/Grid'
import styles from './DataCatalogPage.module.scss'
import { Helmet } from 'react-helmet-async'
import {
  AGE_ADJUST_COVID_DEATHS_US_SETTING,
  AGE_ADJUST_COVID_HOSP_US_SETTING,
  AGE_ADJUST_HIV_DEATHS_US_SETTING,
  EXPLORE_DATA_PAGE_LINK,
} from '../../utils/internalRoutes'
import { Button } from '@mui/material'
import { Link } from 'react-router-dom'

function AgeAdjustmentTab() {
  return (
    <>
      <Helmet>
        <title>Age-Adjustment - Health Equity Tracker</title>
      </Helmet>
      <h2 className={styles.ScreenreaderTitleHeader}>Age-Adjustment</h2>
      <Grid
        container
        direction="column"
        justifyContent="space-around"
        alignItems="center"
      >
        <Grid container className={styles.AgeAdjustmentSection}>
          {/* Age-adjusted Info */}
          <Grid
            item
            className={styles.MethodologyQuestionAndAnswer}
            component="article"
          >
            <h3 className={styles.AgeAdjustmentHeader} id="main">
              Calculating Age-Adjusted Ratios
            </h3>

            <div className={styles.MethodologyAnswer}>
              <p>
                We have decided to present <b>age-adjusted ratios</b> when
                possible in order to show a more accurate and equitable view of
                the impact on non-White communities in the United States.
              </p>
              <p>
                As of{' '}
                {new Date().toLocaleString('default', {
                  month: 'long',
                  year: 'numeric',
                })}
                {', '}we are able to calculate these age-adjusted ratios for{' '}
                <Link
                  to={EXPLORE_DATA_PAGE_LINK + AGE_ADJUST_HIV_DEATHS_US_SETTING}
                >
                  HIV deaths
                </Link>
                {', '}
                <Link
                  to={
                    EXPLORE_DATA_PAGE_LINK + AGE_ADJUST_COVID_DEATHS_US_SETTING
                  }
                >
                  COVID-19 deaths
                </Link>
                {' and '}
                <Link
                  to={EXPLORE_DATA_PAGE_LINK + AGE_ADJUST_COVID_HOSP_US_SETTING}
                >
                  COVID-19 hospitalizations
                </Link>
                , and we present the findings in a distinct, age-adjusted table.
                All of the other data shown on the tracker, including
                visualizations across all topics, are not age-adjusted, or
                ‘crude rates’. Showing non-adjusted data can mask disparities,
                and we are working to expand our analysis to provide a more
                equitable view of the impact to racial and ethnic minorities.
              </p>
              <p>
                We use a <b>direct standardization method</b>, with the{' '}
                <b>internal standard population</b> for each state being that
                state's total population. Finally, the ratios we present for
                each race group is that race's age-adjusted count, divided by
                the age-adjusted count for White, non-Hispanic individuals in
                the same location. Thus, our age-adjusted ratios can only be
                used to compare race groups within each state, and <b>not</b> to
                compare race groups between states. For COVID-19 reports, we
                source the standard population numbers from the 2019 population
                numbers from{' '}
                <a href="https://www.census.gov/data/tables/time-series/demo/popest/2010s-counties-detail.html">
                  County Population by Characteristics
                </a>
                . For HIV reports, the population data is provided along with
                the condition rates from the same{' '}
                <a href="https://gis.cdc.gov/grasp/nchhstpatlas/tables.html">
                  CDC Atlas data tables
                </a>
                .
              </p>
              <h4 className={styles.MethodologySubsubheaderText}>
                Data Sourcing
              </h4>
              <p>
                In order to do an age-adjustment, we needed the following pieces
                of information:
              </p>
              <ol>
                <li>
                  <b>Condition counts broken down by both age and race:</b>

                  <ul>
                    <li>
                      For COVID-19, we use the{' '}
                      <a href="https://data.cdc.gov/Case-Surveillance/COVID-19-Case-Surveillance-Restricted-Access-Detai/mbd7-r32t">
                        CDC Case Surveillance Restricted Access Detailed Data
                      </a>{' '}
                      for this. It can break down by race and age to ten-year
                      buckets. The age buckets are: <b>0-9</b>, <b>10-19</b>,{' '}
                      <b>20-29</b>, <b>30-39</b>, <b>40-49</b>, <b>50-59</b>,{' '}
                      <b>60-69</b>, <b>70-79</b>, <b>80+</b>
                    </li>

                    <li>
                      For HIV, we use the{' '}
                      <a href="https://gis.cdc.gov/grasp/nchhstpatlas/tables.html">
                        CDC Atlas data tables
                      </a>
                    </li>
                  </ul>
                </li>

                <li>
                  <b>Population counts broken down by both race and age:</b>

                  <ul>
                    <li>
                      For COVID-19, the most reliable population source we could
                      find with these particular age and race groupings were the{' '}
                      <a href="https://www.census.gov/data/tables/time-series/demo/popest/2010s-counties-detail.html">
                        County Population by Characteristics
                      </a>{' '}
                      numbers provided by the census
                    </li>
                    <li>
                      For HIV, the CDC Atlas provides population counts in the
                      same tables as the condition counts
                    </li>
                  </ul>
                </li>
              </ol>
              <h4 className={styles.MethodologySubsubheaderText}>Algorithm</h4>
              <p>
                In order to generate the age-adjusted ratios, we do the
                following
              </p>
              <ol>
                <li>
                  <p>
                    <b>
                      For each race/age combination, calculate the ‘age-specific
                      rate’
                    </b>
                  </p>
                  <pre>
                    age_specific_rate = (Condition count for race A, age group
                    1) / (Population count of race A, age group 1)
                  </pre>
                </li>

                <li>
                  <p>
                    <b>
                      For each age group, calculate the ‘standard population’
                    </b>
                  </p>
                  <pre>
                    standard_population_age_group_1 = Population count Race A,
                    Age group 1 + Population count Race B, Age group 1
                  </pre>
                </li>

                <li>
                  <p>
                    <b>
                      Calculate the expected count for each race/age
                      combination:
                    </b>
                  </p>
                  <p>
                    To do this we multiply the age-specific rate by the
                    location's total population for that age group. The expected
                    condition counts are the number of people of the race group
                    who would have been expected to have this condition if the
                    race group had the same age breakdown as the population as a
                    whole.
                  </p>
                  <pre>
                    expected_condition_count = age_specific_rate *
                    standard_population (for corresponding age group)
                  </pre>
                </li>

                <li>
                  <p>
                    <b>
                      Calculate the total expected condition count for each race
                      group:
                    </b>
                  </p>
                  <p>
                    For each race group, sum together the expected condition
                    counts for each of that race's age groups.
                  </p>
                </li>

                <li>
                  <p>
                    <b>Calculate the age-adjusted condition ratios:</b>
                  </p>
                  <p>
                    For each non-White NH race, divide the total expected
                    condition counts for that race by the expected White (NH)
                    condition counts.
                  </p>
                </li>
                <li>
                  <p>
                    <b>Edge cases:</b>
                  </p>
                  <p>
                    If a ratio ends up being less than <b>0.1</b>, we report it
                    on the tracker as <b>Insufficient Data</b> to prevent
                    sharing potentially unreliable data.
                  </p>
                </li>
              </ol>

              <h3 className={styles.MethodologyQuestion}>
                Age-Adjustment Example: HIV Deaths
              </h3>
              <p>
                Here is an example of a single state with two races,{' '}
                <b>Race A</b> and <b>Race B</b>, with three age breakdowns:{' '}
                <b>0-29</b>, <b>30-59</b>, and <b>60+</b>. <b>Race A</b> will be
                the race we divide against to obtain our ratios (like{' '}
                <b>White, Non-Hispanic</b>), and <b>Race B</b> is any other race
                group.
              </p>
              <table className={styles.ExampleTable}>
                <thead>
                  <tr>
                    <td>Race Group</td>
                    <td>Age Group</td>
                    <td>HIV Deaths</td>
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
                1) Calculate the <b>age-specific HIV death rates</b> which will
                be each race/age group's death count divided by its population.
              </h4>

              {/* CALCULATE AGE SPECIFIC DEATH RATES TABLE */}
              <table className={styles.ExampleTable}>
                <thead>
                  <tr>
                    <td>Race Group</td>
                    <td>Age Group</td>
                    <td>HIV Deaths</td>
                    <td>Population</td>
                    <td>Age-Specific HIV Death Rate</td>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>Race A</td>
                    <td>0-29</td>
                    <td>50</td>
                    <td>600,000</td>
                    <td>
                      <div className={styles.Calculation}>(50 / 600,000)</div>
                      <b> = 0.00008333</b>
                    </td>
                  </tr>

                  <tr>
                    <td>Race A</td>
                    <td>30-59</td>
                    <td>500</td>
                    <td>800,000</td>
                    <td>
                      <div className={styles.Calculation}>(500 / 800,000)</div>
                      <b> = 0.000625</b>
                    </td>
                  </tr>

                  <tr>
                    <td>Race A</td>
                    <td>60+</td>
                    <td>5,000</td>
                    <td>200,000</td>
                    <td>
                      <div className={styles.Calculation}>
                        (5,000 / 200,000)
                      </div>
                      <b> = 0.025</b>
                    </td>
                  </tr>

                  <tr>
                    <td>Race B</td>
                    <td>0-29</td>
                    <td>20</td>
                    <td>200,000</td>
                    <td>
                      <div className={styles.Calculation}>(20 / 200,000)</div>
                      <b> = 0.0001</b>
                    </td>
                  </tr>

                  <tr>
                    <td>Race B</td>
                    <td>30-59</td>
                    <td>200</td>
                    <td>300,000</td>
                    <td>
                      <div className={styles.Calculation}>(200 / 300,000)</div>
                      <b> = 0.00066667</b>
                    </td>
                  </tr>

                  <tr>
                    <td>Race B</td>
                    <td>60+</td>
                    <td>800</td>
                    <td>60,000</td>
                    <td>
                      <div className={styles.Calculation}>(800 / 60,000)</div>
                      <b> = 0.01333333</b>
                    </td>
                  </tr>
                </tbody>
              </table>

              <h4 className={styles.MethodologySubsubheaderText}>
                2) Get the <b>standard population</b> per age group, which will
                be the summed population of all race/age groups within that age
                group.
              </h4>

              {/* A + B TABLE */}
              <table className={styles.ExampleTable}>
                <thead>
                  <tr>
                    <td>Race Group</td>
                    <td>Age Group</td>
                    <td>Standard Population</td>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>Total (A & B)</td>
                    <td>0-29</td>
                    <td>
                      <div className={styles.Calculation}>
                        600,000 + 200,000
                      </div>
                      <b>= 800,000</b>
                    </td>
                  </tr>

                  <tr>
                    <td>Total (A & B)</td>
                    <td>30-59</td>
                    <td>
                      <div className={styles.Calculation}>
                        800,000 + 300,000
                      </div>
                      <b>= 1,100,000</b>
                    </td>
                  </tr>

                  <tr>
                    <td>Total (A & B)</td>
                    <td>60+</td>
                    <td>
                      <div className={styles.Calculation}>200,000 + 60,000</div>
                      <b>= 260,000</b>
                    </td>
                  </tr>
                </tbody>
              </table>

              <h4 className={styles.MethodologySubsubheaderText}>
                3) Calculate the expected deaths for each age/race group:
              </h4>
              <p>As noted above, the formula for each row is:</p>
              <pre>
                (HIV Deaths / Population) X Standard Population for
                Corresponding Age Group
              </pre>
              <table className={styles.ExampleTable}>
                <thead>
                  <tr>
                    <td>Race Group</td>
                    <td>Age Group</td>
                    <td>Age-Specific HIV Death Rate</td>
                    <td>Standard Population</td>
                    <td>Expected HIV Deaths</td>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>Race A</td>
                    <td>0-29</td>
                    <td>0.00008333</td>
                    <td>
                      <div className={styles.Calculation}>for Ages 0-29:</div>
                      800,000
                    </td>
                    <td>
                      <div className={styles.Calculation}>
                        0.00008333 * 800,000
                      </div>
                      <b> = 66.67</b>
                    </td>
                  </tr>

                  <tr>
                    <td>Race A</td>
                    <td>30-59</td>

                    <td>0.000625</td>
                    <td>
                      <div className={styles.Calculation}>for Ages 30-59:</div>
                      1,100,000
                    </td>

                    <td>
                      <div className={styles.Calculation}>
                        0.000625 * 1,100,000
                      </div>
                      <b> = 687.5</b>
                    </td>
                  </tr>

                  <tr>
                    <td>Race A</td>
                    <td>60+</td>
                    <td>0.025</td>
                    <td>
                      <div className={styles.Calculation}>for Ages 60+:</div>
                      260,000
                    </td>

                    <td>
                      <div className={styles.Calculation}>0.025 * 260,000</div>
                      <b> = 6,500</b>
                    </td>
                  </tr>

                  <tr>
                    <td>Race B</td>
                    <td>0-29</td>

                    <td>0.0001</td>
                    <td>
                      <div className={styles.Calculation}>for Ages 0-29:</div>
                      800,000
                    </td>

                    <td>
                      <div className={styles.Calculation}>0.0001 * 800,000</div>
                      <b> = 80</b>
                    </td>
                  </tr>

                  <tr>
                    <td>Race B</td>
                    <td>30-59</td>
                    <td>0.00066667</td>
                    <td>
                      <div className={styles.Calculation}>for Ages 30-59:</div>
                      1,100,000
                    </td>
                    <td>
                      <div className={styles.Calculation}>
                        0.00066667 * 1,100,000
                      </div>
                      <b> = 733.33</b>
                    </td>
                  </tr>

                  <tr>
                    <td>Race B</td>
                    <td>60+</td>
                    <td>0.01333333</td>
                    <td>
                      <div className={styles.Calculation}>for Ages 60+:</div>
                      260,000
                    </td>
                    <td>
                      <div className={styles.Calculation}>
                        0.01333333 * 260,000
                      </div>
                      <b> = 3466.67</b>
                    </td>
                  </tr>
                </tbody>
              </table>
              <h4 className={styles.MethodologySubsubheaderText}>
                4) For each race, we sum together the expected HIV deaths from
                each of its age groups to calculate the total expected HIV
                deaths for that race:
              </h4>
              <table className={styles.ExampleTable}>
                <thead>
                  <tr>
                    <td>Race Group</td>
                    <td>Total Expected HIV Deaths</td>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>Race A</td>
                    <td>
                      <div className={styles.Calculation}>
                        66.67 + 687.5 + 6,500
                      </div>
                      <b>= 7,254.17</b>
                    </td>
                  </tr>
                  <tr>
                    <td>Race B</td>
                    <td>
                      <div className={styles.Calculation}>
                        80 + 733.33 + 3466.67
                      </div>
                      <b>= 4,280</b>
                    </td>
                  </tr>
                </tbody>
              </table>
              <h4 className={styles.MethodologySubsubheaderText}>
                5) Calculate the age-adjusted death ratio:
              </h4>
              <table className={styles.ExampleTable}>
                <thead>
                  <tr>
                    <td>Race Group</td>
                    <td>Total Expected HIV Deaths</td>
                    <td>Age-Adjusted Death Ratio</td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Race A</td>
                    <td>7,254.17</td>
                    <td>
                      <div className={styles.Calculation}>
                        7,254.17 / 7,254.17
                      </div>
                      <b>= 1.0×</b>
                    </td>
                  </tr>
                  <tr>
                    <td>Race B</td>
                    <td>4,280</td>
                    <td>
                      <div className={styles.Calculation}>4,280 / 7,254.17</div>
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
            href={EXPLORE_DATA_PAGE_LINK + AGE_ADJUST_HIV_DEATHS_US_SETTING}
          >
            Explore age-adjusted ratios
          </Button>
        </Grid>
      </Grid>
    </>
  )
}

export default AgeAdjustmentTab
