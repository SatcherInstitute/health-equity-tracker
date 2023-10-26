import Grid from '@mui/material/Grid'
import styles from '../methodologyComponents/MethodologyPage.module.scss'
import { Helmet } from 'react-helmet-async'
import {
  AGE_ADJUST_COVID_DEATHS_US_SETTING,
  AGE_ADJUST_COVID_HOSP_US_SETTING,
  AGE_ADJUST_HIV_DEATHS_US_SETTING,
  EXPLORE_DATA_PAGE_LINK,
} from '../../../utils/internalRoutes'
import { Alert, Button } from '@mui/material'
import { Link } from 'react-router-dom'
import KeyTerms from '../methodologyComponents/KeyTerms'
import { ageAdjustmentDefinitionsArray } from '../methodologyContent/AgeAdjustmentDefinitions'
import AgeAdjustmentExampleTable from '../methodologyComponents/AgeAdjustmentExampleTable'
import { CodeBlock } from '../methodologyComponents/CodeBlock'
import { ArrowForward } from '@mui/icons-material'

import {
  ageAdjustedRatiosTooltip,
  ageSpecificRateTooltip,
  crudeRatesTooltip,
  directStandardizationMethodTooltip,
  edgeCasesTooltip,
  expectedConditionCountsTooltip,
  internalStandardPopulationTooltip,
  standardPopulationTooltip,
} from '../methodologyContent/TooltipLibrary'

const AgeAdjustmentLink = () => {
  return (
    <section id="#age-adjusted-ratios">
      <article>
        <Helmet>
          <title>Age-Adjustment - Health Equity Tracker</title>
        </Helmet>
        <h2 className={styles.ScreenreaderTitleHeader}>Age-Adjustment</h2>

        <div>
          <p>
            We have decided to present
            {ageAdjustedRatiosTooltip}
            when possible in order to show a more accurate and equitable view of
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
              to={EXPLORE_DATA_PAGE_LINK + AGE_ADJUST_COVID_DEATHS_US_SETTING}
            >
              COVID-19 deaths
            </Link>
            {' and '}
            <Link
              to={EXPLORE_DATA_PAGE_LINK + AGE_ADJUST_COVID_HOSP_US_SETTING}
            >
              COVID-19 hospitalizations
            </Link>
            , and we present the findings in a distinct, age-adjusted table. All
            of the other data shown on the tracker, including visualizations
            across all topics, are not age-adjusted, or
            {crudeRatesTooltip}. Showing non-adjusted data can mask disparities,
            and we are working to expand our analysis to provide a more
            equitable view of the impact to racial and ethnic minorities.
          </p>
          <p>
            We use a {directStandardizationMethodTooltip} with the{' '}
            {internalStandardPopulationTooltip} for each state being that
            state's total population. Finally, the ratios we present for each
            race group is that race's age-adjusted count, divided by the
            age-adjusted count for White, non-Hispanic individuals in the same
            location.
          </p>
          <Alert severity="warning" role="note">
            Thus, our age-adjusted ratios can only be used to compare race
            groups within each state, and <b>not</b> to compare race groups
            between states.
          </Alert>
          <p>
            For COVID-19 reports, we source the standard population numbers from
            the 2019 population numbers from{' '}
            <a href="https://www.census.gov/data/tables/time-series/demo/popest/2010s-counties-detail.html">
              County Population by Characteristics
            </a>
            . For HIV reports, the population data is provided along with the
            condition rates from the same{' '}
            <a href="https://gis.cdc.gov/grasp/nchhstpatlas/tables.html">
              CDC Atlas data tables
            </a>
            .
          </p>

          <h3 id="#data-sourcing">Data Sourcing</h3>
          <p>
            In order to do an age-adjustment, we needed the following pieces of
            information:
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
                  buckets. The age buckets are:
                  <CodeBlock
                    rowData={[
                      {
                        content: (
                          <>
                            <b>0-9</b>,
                          </>
                        ),
                      },
                      {
                        content: (
                          <>
                            <b>10-19</b>,
                          </>
                        ),
                      },
                      {
                        content: (
                          <>
                            <b>20-29</b>,
                          </>
                        ),
                      },
                      {
                        content: (
                          <>
                            <b>30-39</b>,
                          </>
                        ),
                      },
                      {
                        content: (
                          <>
                            <b>40-49</b>,
                          </>
                        ),
                      },
                      {
                        content: (
                          <>
                            <b>50-59</b>,
                          </>
                        ),
                      },
                      {
                        content: (
                          <>
                            <b>60-69</b>,
                          </>
                        ),
                      },
                      {
                        content: (
                          <>
                            <b>70-79</b>,
                          </>
                        ),
                      },
                      {
                        content: (
                          <>
                            <b>80+</b>
                          </>
                        ),
                      },
                    ]}
                  />
                </li>

                <li>
                  For HIV, we use the{' '}
                  <a href="https://gis.cdc.gov/grasp/nchhstpatlas/tables.html">
                    CDC Atlas data tables.
                  </a>
                </li>
              </ul>
            </li>
            <br />
            <li>
              <b>Population counts broken down by both race and age:</b>

              <ul>
                <li>
                  For COVID-19, the most reliable population source we could
                  find with these particular age and race groupings were the{' '}
                  <a href="https://www.census.gov/data/tables/time-series/demo/popest/2010s-counties-detail.html">
                    County Population by Characteristics
                  </a>{' '}
                  numbers provided by the census.
                </li>
                <li>
                  For HIV, the CDC Atlas provides population counts in the same
                  tables as the condition counts.
                </li>
              </ul>
            </li>
          </ol>
          <h3 id="#algorithm">Algorithm</h3>
          <p>
            In order to generate the age-adjusted ratios, we do the following:
          </p>
          <ol>
            <li>
              <p>
                <b>
                  For each race/age combination, calculate the
                  {ageSpecificRateTooltip}
                </b>
              </p>
              <CodeBlock
                rowData={[
                  {
                    content: (
                      <>
                        <b>age_specific_rate</b>
                      </>
                    ),
                  },
                  { content: '=' },
                  {
                    content: (
                      <>
                        (Condition count for race A, age group 1) /<br />{' '}
                        (Population count of race A, age group 1){' '}
                      </>
                    ),
                  },
                ]}
              />
            </li>

            <li>
              <p>
                <b>
                  For each age group, calculate the
                  {standardPopulationTooltip}:
                </b>
              </p>

              <CodeBlock
                rowData={[
                  {
                    content: (
                      <>
                        <b>standard_population_age_group_1</b>
                      </>
                    ),
                  },
                  { content: '=' },
                  {
                    content: (
                      <>
                        (Population count Race A, Age group 1) +<br />
                        (Population count Race B, Age group 1)
                      </>
                    ),
                  },
                ]}
              />
            </li>

            <li>
              <p>
                <b>
                  Calculate the
                  {expectedConditionCountsTooltip}
                  for each race/age combination:
                </b>
              </p>
              <p>
                To do this we multiply the age-specific rate by the location's
                total population for that age group. The expected condition
                counts are the number of people of the race group who would have
                been expected to have this condition if the race group had the
                same age breakdown as the population as a whole.
              </p>

              <CodeBlock
                rowData={[
                  {
                    content: (
                      <>
                        <b>expected_condition_count</b>
                      </>
                    ),
                  },
                  { content: '=' },
                  {
                    content: (
                      <>
                        (age_specific_rate) *<br />
                        (standard_population (for corresponding age group))
                      </>
                    ),
                  },
                ]}
              />
            </li>

            <li>
              <p>
                <b>
                  Calculate the total expected condition count for each race
                  group:
                </b>
              </p>
              <p>
                For each race group, sum together the expected condition counts
                for each of that race's age groups.
              </p>
            </li>

            <li>
              <p>
                <b>Calculate the age-adjusted condition ratios:</b>
              </p>
              <p>
                For each non-White NH race, divide the total expected condition
                counts for that race by the expected White (NH) condition
                counts.
              </p>
            </li>
            <li>
              <p>
                <b>
                  Account for
                  {edgeCasesTooltip}:
                </b>
              </p>
              <p>
                If a ratio ends up being less than <b>0.1</b>, we report it on
                the tracker as <b>Insufficient Data</b> to prevent sharing
                potentially unreliable data.
              </p>
            </li>
          </ol>

          <h3 id="#age-adjustment-examples">
            Age-Adjustment Example: HIV Deaths
          </h3>
          <div className={styles.ExampleDiv}>
            <p>
              Here is an example of a single state with two races,
              <CodeBlock
                rowData={[
                  {
                    content: (
                      <>
                        <b>Race A</b> and <b>Race B</b>
                      </>
                    ),
                  },
                ]}
              />
              with three age breakdowns:
              <CodeBlock
                rowData={[
                  {
                    content: (
                      <>
                        <b>0-29</b>,
                      </>
                    ),
                  },
                  {
                    content: (
                      <>
                        <b>30-59</b>, and
                      </>
                    ),
                  },
                  {
                    content: (
                      <>
                        <b>60+</b>.
                      </>
                    ),
                  },
                ]}
              />
              <b>Race A</b> will be the race we divide against to obtain our
              ratios (like <b>White, Non-Hispanic</b>), and <b>Race B</b> is any
              other race group.
            </p>
            <AgeAdjustmentExampleTable
              columns={[
                { header: 'Race Groups by Age', accessor: 'race' },
                { header: 'HIV Deaths', accessor: 'condition' },
                { header: 'Population', accessor: 'population' },
              ]}
              rows={[
                {
                  race: `Race A (ages 0 - 29)`,
                  condition: `50`,
                  population: `600,000`,
                },
                {
                  race: `Race B (ages 0 - 29)`,
                  condition: `20`,
                  population: `200,000`,
                },
                {
                  race: `Race A (ages 30 - 59)`,
                  condition: `500`,
                  population: `800,000`,
                },
                {
                  race: `Race B (ages 30 - 59)`,
                  condition: `200`,
                  population: `300,000`,
                },
                {
                  race: `Race A (ages 60+)`,
                  condition: `5,000`,
                  population: `200,000`,
                },
                {
                  race: `Race B (ages 60+)`,
                  condition: `800`,
                  population: `60,000`,
                },
              ]}
            />
          </div>
          <br />
          <div className={styles.ExampleDiv}>
            <ol start="1">
              <li>
                <p>
                  Calculate the <b>age-specific HIV death rates</b> which will
                  be each race/age group's death count divided by its
                  population.
                </p>
              </li>
            </ol>

            {/* CALCULATE AGE SPECIFIC DEATH RATES TABLE */}
            <AgeAdjustmentExampleTable
              columns={[
                { header: 'Race Groups by Age', accessor: 'race' },
                { header: 'HIV Deaths', accessor: 'condition' },
                { header: 'Population', accessor: 'population' },
                { header: 'Age-Specific HIV Death Rate', accessor: 'rate' },
              ]}
              rows={[
                {
                  race: `Race A (ages 0 - 29)`,
                  condition: `50`,
                  population: `600,000`,
                  rate: (
                    <CodeBlock
                      border={false}
                      rowData={[
                        {
                          content: <>(50 / 600,000)</>,
                        },
                        {
                          content: <>=</>,
                        },
                        {
                          content: (
                            <>
                              <b>0.00008333</b>
                            </>
                          ),
                        },
                      ]}
                    />
                  ),
                },
                {
                  race: `Race B (ages 0 - 29)`,
                  condition: `20`,
                  population: `200,000`,
                  rate: (
                    <CodeBlock
                      border={false}
                      rowData={[
                        {
                          content: <>(20 / 200,000)</>,
                        },
                        {
                          content: <>=</>,
                        },
                        {
                          content: (
                            <>
                              <b>0.0001</b>
                            </>
                          ),
                        },
                      ]}
                    />
                  ),
                },
                {
                  race: `Race A (ages 30 - 59)`,
                  condition: `500`,
                  population: `800,000`,
                  rate: (
                    <CodeBlock
                      border={false}
                      rowData={[
                        {
                          content: <>(500 / 800,000)</>,
                        },
                        {
                          content: <>=</>,
                        },
                        {
                          content: (
                            <>
                              <b>0.000625</b>
                            </>
                          ),
                        },
                      ]}
                    />
                  ),
                },
                {
                  race: `Race B (ages 30 - 59)`,
                  condition: `200`,
                  population: `300,000`,
                  rate: (
                    <CodeBlock
                      border={false}
                      rowData={[
                        {
                          content: <>(200 / 300,000)</>,
                        },
                        {
                          content: <>=</>,
                        },
                        {
                          content: (
                            <>
                              <b>0.00066667</b>
                            </>
                          ),
                        },
                      ]}
                    />
                  ),
                },
                {
                  race: `Race A (ages 60+)`,
                  condition: `5,000`,
                  population: `200,000`,
                  rate: (
                    <CodeBlock
                      border={false}
                      rowData={[
                        {
                          content: <>(5,000 / 200,000)</>,
                        },
                        {
                          content: <>=</>,
                        },
                        {
                          content: (
                            <>
                              <b>0.025</b>
                            </>
                          ),
                        },
                      ]}
                    />
                  ),
                },
                {
                  race: `Race B (ages 60+)`,
                  condition: `800`,
                  population: `60,000`,
                  rate: (
                    <CodeBlock
                      border={false}
                      rowData={[
                        {
                          content: <>(800 / 60,000)</>,
                        },
                        {
                          content: <>=</>,
                        },
                        {
                          content: (
                            <>
                              <b>0.01333333</b>
                            </>
                          ),
                        },
                      ]}
                    />
                  ),
                },
              ]}
            />
          </div>
          <br />
          <div className={styles.ExampleDiv}>
            <ol start="2">
              <li>
                Get the <b>standard population</b> per age group, which will be
                the summed population of all race/age groups within that age
                group.
              </li>
            </ol>

            {/* A + B TABLE */}
            <AgeAdjustmentExampleTable
              columns={[
                { header: 'Race Groups by Age', accessor: 'race' },

                { header: 'Standard Population', accessor: 'population' },
              ]}
              rows={[
                {
                  race: `Race A (ages 0 - 29)`,
                  population: (
                    <CodeBlock
                      border={false}
                      rowData={[
                        {
                          content: <>(600,000 + 200,000)</>,
                        },
                        {
                          content: <>=</>,
                        },
                        {
                          content: (
                            <>
                              <b>800,000</b>
                            </>
                          ),
                        },
                      ]}
                    />
                  ),
                },
                {
                  race: `Race B (ages 0 - 29)`,
                  population: (
                    <CodeBlock
                      border={false}
                      rowData={[
                        {
                          content: <>(800,000 + 300,000)</>,
                        },
                        {
                          content: <>=</>,
                        },
                        {
                          content: (
                            <>
                              <b>1,100,000</b>
                            </>
                          ),
                        },
                      ]}
                    />
                  ),
                },
                {
                  race: `Race A (ages 30 - 59)`,
                  population: (
                    <CodeBlock
                      border={false}
                      rowData={[
                        {
                          content: <>(200,000 + 60,000)</>,
                        },
                        {
                          content: <>=</>,
                        },
                        {
                          content: (
                            <>
                              <b>260,000</b>
                            </>
                          ),
                        },
                      ]}
                    />
                  ),
                },
              ]}
            />
          </div>
          <br />
          <div className={styles.ExampleDiv}>
            <ol start="3">
              <li>Calculate the expected deaths for each age/race group:</li>
            </ol>
            <p>As noted above, the formula for each row is:</p>
            <CodeBlock
              rowData={[
                { content: '(HIV Deaths / Population)' },
                { content: 'x' },
                {
                  content: ` Standard Population for Corresponding Age Group`,
                },
              ]}
            />

            <AgeAdjustmentExampleTable
              columns={[
                { header: 'Race Groups by Age', accessor: 'race' },
                {
                  header: 'Age-Specific HIV Death Rate',
                  accessor: 'condition',
                },
                { header: 'Standard Population', accessor: 'population' },
                { header: 'Expected HIV Death Rate', accessor: 'rate' },
              ]}
              rows={[
                {
                  race: `Race A (ages 0 - 29)`,
                  condition: `0.00008333`,
                  population: `800,000`,
                  rate: (
                    <CodeBlock
                      border={false}
                      rowData={[
                        {
                          content: <>(0.00008333 * 800,000)</>,
                        },
                        {
                          content: <>=</>,
                        },
                        {
                          content: (
                            <>
                              <b>66.67</b>
                            </>
                          ),
                        },
                      ]}
                    />
                  ),
                },
                {
                  race: `Race B (ages 0 - 29)`,
                  condition: `0.0001`,
                  population: `800,000`,
                  rate: (
                    <CodeBlock
                      border={false}
                      rowData={[
                        {
                          content: <>(0.0001 * 800,000)</>,
                        },
                        {
                          content: <>=</>,
                        },
                        {
                          content: (
                            <>
                              <b>80</b>
                            </>
                          ),
                        },
                      ]}
                    />
                  ),
                },
                {
                  race: `Race A (ages 30 - 59)`,
                  condition: `0.000625`,
                  population: `1,100,000`,
                  rate: (
                    <CodeBlock
                      border={false}
                      rowData={[
                        {
                          content: <>(0.000625 * 1,100,000)</>,
                        },
                        {
                          content: <>=</>,
                        },
                        {
                          content: (
                            <>
                              <b>687.5</b>
                            </>
                          ),
                        },
                      ]}
                    />
                  ),
                },
                {
                  race: `Race B (ages 30 - 59)`,
                  condition: `0.00066667`,
                  population: `1,100,000`,
                  rate: (
                    <CodeBlock
                      border={false}
                      rowData={[
                        {
                          content: <>(0.00066667 * 1,100,000)</>,
                        },
                        {
                          content: <>=</>,
                        },
                        {
                          content: (
                            <>
                              <b>733.33</b>
                            </>
                          ),
                        },
                      ]}
                    />
                  ),
                },
                {
                  race: `Race A (ages 60+)`,
                  condition: `0.025`,
                  population: `260,000`,
                  rate: (
                    <CodeBlock
                      border={false}
                      rowData={[
                        {
                          content: <>(0.025 * 260,000)</>,
                        },
                        {
                          content: <>=</>,
                        },
                        {
                          content: (
                            <>
                              <b>6,500</b>
                            </>
                          ),
                        },
                      ]}
                    />
                  ),
                },
                {
                  race: `Race B (ages 60+)`,
                  condition: `0.01333333`,
                  population: `260,000`,
                  rate: (
                    <CodeBlock
                      border={false}
                      rowData={[
                        {
                          content: <>(0.01333333 * 260,000)</>,
                        },
                        {
                          content: <>=</>,
                        },
                        {
                          content: (
                            <>
                              <b>3466.67</b>
                            </>
                          ),
                        },
                      ]}
                    />
                  ),
                },
              ]}
            />
          </div>
          <br />
          <div className={styles.ExampleDiv}>
            <ol start="4">
              <li>
                For each race, we sum together the expected HIV deaths from each
                of its age groups to calculate the total expected HIV deaths for
                that race:
              </li>
            </ol>

            <AgeAdjustmentExampleTable
              columns={[
                { header: 'Race Groups by All Ages', accessor: 'race' },
                { header: 'Total Expected HIV Deaths', accessor: 'rate' },
              ]}
              rows={[
                {
                  race: `Race A (all ages)`,
                  rate: (
                    <CodeBlock
                      border={false}
                      rowData={[
                        {
                          content: <>(66.67 + 687.5 + 6,500)</>,
                        },
                        {
                          content: <>=</>,
                        },
                        {
                          content: (
                            <>
                              <b>7,254.17</b>
                            </>
                          ),
                        },
                      ]}
                    />
                  ),
                },
                {
                  race: `Race B (all ages)`,
                  rate: (
                    <CodeBlock
                      border={false}
                      rowData={[
                        {
                          content: <>(80 + 733.33 + 3466.67)</>,
                        },
                        {
                          content: <>=</>,
                        },
                        {
                          content: (
                            <>
                              <b>4,280</b>
                            </>
                          ),
                        },
                      ]}
                    />
                  ),
                },
              ]}
            />
          </div>
          <br />
          <div className={styles.ExampleDiv}>
            <ol start="5">
              <li>Calculate the age-adjusted death ratio:</li>
            </ol>

            <AgeAdjustmentExampleTable
              columns={[
                { header: 'Race Groups by All Ages', accessor: 'race' },
                { header: 'Total Expected HIV Deaths', accessor: 'rate' },
                { header: 'Age-Adjusted Death Ratio', accessor: 'ratio' },
              ]}
              rows={[
                {
                  race: `Race A (all ages)`,
                  rate: '7,254.17',
                  ratio: (
                    <CodeBlock
                      border={false}
                      rowData={[
                        {
                          content: <>(7,254.17 / 7,254.17)</>,
                        },
                        {
                          content: <>=</>,
                        },
                        {
                          content: (
                            <>
                              <b>1.0×</b>
                            </>
                          ),
                        },
                      ]}
                    />
                  ),
                },
                {
                  race: `Race B (all ages)`,
                  rate: '4,280',
                  ratio: (
                    <CodeBlock
                      border={false}
                      rowData={[
                        {
                          content: <>(4,280 / 7,254.17)</>,
                        },
                        {
                          content: <>=</>,
                        },
                        {
                          content: (
                            <>
                              <b>0.6×</b>
                            </>
                          ),
                        },
                      ]}
                    />
                  ),
                },
              ]}
            />
          </div>
          <br />
          <KeyTerms
            definitionsArray={ageAdjustmentDefinitionsArray}
            id="#age-adjustment-terms"
          />
        </div>

        <Button
          className={styles.TextButton}
          variant="text"
          color="primary"
          href={EXPLORE_DATA_PAGE_LINK + AGE_ADJUST_HIV_DEATHS_US_SETTING}
          id="#age-adjustment-explore"
        >
          <>
            <span>Explore age-adjusted ratios</span>
            <ArrowForward />
          </>
        </Button>
      </article>
    </section>
  )
}

export default AgeAdjustmentLink
