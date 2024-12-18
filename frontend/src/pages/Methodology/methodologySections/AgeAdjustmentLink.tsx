import { Helmet } from 'react-helmet-async'
import {
  AGE_ADJUST_COVID_DEATHS_US_SETTING,
  AGE_ADJUST_COVID_HOSP_US_SETTING,
  AGE_ADJUST_HIV_DEATHS_US_SETTING,
  EXPLORE_DATA_PAGE_LINK,
} from '../../../utils/internalRoutes'
import { Link } from 'react-router-dom'
import KeyTermsAccordion from '../methodologyComponents/KeyTermsAccordion'
import Resources from '../methodologyComponents/Resources'
import HetNotice from '../../../styles/HetComponents/HetNotice'
import HetCTABig from '../../../styles/HetComponents/HetCTABig'
import HetTerm from '../../../styles/HetComponents/HetTerm'
import FormulaFormat from '../methodologyComponents/FormulaFormat'
import { metricDefinitions } from '../methodologyContent/MetricsDefinitions'
import { termDefinitions } from '../methodologyContent/TermDefinitions'

const ageAdjustTerms = [
  metricDefinitions['Age-adjusted ratios'],
  termDefinitions['Direct standardization method'],
  termDefinitions['Internal standard population'],
  termDefinitions['Condition counts broken down by both age and race'],
  termDefinitions['Population counts broken down by both age and race'],
  termDefinitions['Age-specific rate'],
  termDefinitions['Standard population'],
  termDefinitions['Expected condition counts'],
  termDefinitions['Edge cases'],
]

const AGE_ADJUSTED_RESOURCES = [
  {
    heading: 'Age-Adjustment',
    resources: [
      {
        name: 'County Population by Characteristics',
        url: 'https://www.census.gov/data/tables/time-series/demo/popest/2010s-counties-detail.html',
      },
      {
        name: 'CDC Atlas data tables',
        url: 'https://gis.cdc.gov/grasp/nchhstpatlas/tables.html',
      },
      {
        name: 'CDC Case Surveillance Restricted Access Detailed Data',
        url: 'https://data.cdc.gov/Case-Surveillance/COVID-19-Case-Surveillance-Restricted-Access-Detai/mbd7-r32t',
      },
    ],
  },
]

const AgeAdjustmentLink = () => {
  return (
    <>
      <section id='age-adjusted-ratios'>
        {' '}
        <Helmet>
          <title>Age-Adjustment - Health Equity Tracker</title>
        </Helmet>
        <article className='pb-6'>
          <div className='text-left font-sansText text-altBlack text-small'>
            <HetNotice>
              Age-adjustment is a statistical process applied to rates of
              disease, death, or other health outcomes that correlate with an
              individual's age. Adjusting for age allows for fairer comparison
              between populations, where age might be a confounding risk factor
              and the studied groups have different distributions of individuals
              per age group. By normalizing for age, we can paint a more
              accurate picture of undue burden of disease and death between
              populations.
            </HetNotice>
            <p>
              We have decided to present <HetTerm>age-adjusted ratios</HetTerm>{' '}
              when possible in order to show a more accurate and equitable view
              of the impact on non-White communities in the United States.
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
              , and we present the findings in a distinct, age-adjusted table.
              All of the other data shown on the tracker, including
              visualizations across all topics, are not age-adjusted, or ‘crude
              rates’. Showing non-adjusted data can mask disparities, and we are
              working to expand our analysis to provide a more equitable view of
              the impact to racial and ethnic minorities.
            </p>
            <p>
              We use a <HetTerm>direct standardization method</HetTerm>, with
              the <HetTerm>internal standard population</HetTerm> for each state
              being that state's total population. Finally, the ratios we
              present for each race group is that race's age-adjusted count,
              divided by the age-adjusted count for White, non-Hispanic
              individuals in the same location. Thus, our age-adjusted ratios
              can only be used to compare race groups within each state, and{' '}
              <strong>not</strong> to compare race groups between states. For
              COVID-19 reports, we source the standard population numbers from
              the 2019 population numbers from{' '}
              <a href='https://www.census.gov/data/tables/time-series/demo/popest/2010s-counties-detail.html'>
                County Population by Characteristics
              </a>
              . For HIV reports, the population data is provided along with the
              condition rates from the same{' '}
              <a href='https://gis.cdc.gov/grasp/nchhstpatlas/tables.html'>
                CDC Atlas data tables
              </a>
              .
            </p>
            <h3 id='data-sourcing' className='mt-20 font-medium text-title'>
              Data Sourcing
            </h3>
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
                    <a href='https://data.cdc.gov/Case-Surveillance/COVID-19-Case-Surveillance-Restricted-Access-Detai/mbd7-r32t'>
                      CDC Case Surveillance Restricted Access Detailed Data
                    </a>{' '}
                    for this. It can break down by race and age to ten-year
                    buckets. The age buckets are: <HetTerm>0-9</HetTerm>,{' '}
                    <HetTerm>10-19</HetTerm>, <HetTerm>20-29</HetTerm>,{' '}
                    <HetTerm>30-39</HetTerm>, <HetTerm>40-49</HetTerm>,{' '}
                    <HetTerm>50-59</HetTerm>, <HetTerm>60-69</HetTerm>,{' '}
                    <HetTerm>70-79</HetTerm>, <HetTerm>80+</HetTerm>
                  </li>

                  <li>
                    For HIV, we use the{' '}
                    <a href='https://gis.cdc.gov/grasp/nchhstpatlas/tables.html'>
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
                    <a href='https://www.census.gov/data/tables/time-series/demo/popest/2010s-counties-detail.html'>
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
            <h3 id='algorithm' className='mt-20 font-medium text-title'>
              Algorithm
            </h3>
            <p>
              In order to generate the age-adjusted ratios, we do the following
            </p>
            <ol>
              <li>
                <p>
                  <b>
                    For each race/age combination, calculate the{' '}
                    <HetTerm>age-specific rate</HetTerm>
                  </b>
                </p>
                <FormulaFormat
                  leftSide='Age-Specific Rate'
                  rightSide={[
                    {
                      numerator: '# cases for Race A, Age group 1',
                      denominator: 'Pop. of Race A, Age group 1​',
                    },
                    '* 100',
                  ]}
                />
              </li>

              <li>
                <p>
                  <b>
                    For each age group, calculate the{' '}
                    <HetTerm>standard population</HetTerm>
                  </b>
                </p>
                <FormulaFormat
                  leftSide='Std. Pop. Age group 1'
                  rightSide={[
                    'Pop. of Race A, Age group 1​',
                    ' + ',
                    'Pop. of Race A, Age group 1',
                  ]}
                />
              </li>

              <li>
                <p>
                  <b>
                    Calculate the expected count for each race/age combination:
                  </b>
                </p>
                <p>
                  To do this we multiply the age-specific rate by the location's
                  total population for that age group. The expected condition
                  counts are the number of people of the race group who would
                  have been expected to have this condition if the race group
                  had the same age breakdown as the population as a whole.
                </p>
                <FormulaFormat
                  leftSide='Expected Condition Count'
                  rightSide={[
                    'Age-Specific Rate',
                    ' * ',
                    'Std. Pop. for corresponding Age group',
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
                  If a ratio ends up being less than <b>0.1</b>, we report it on
                  the tracker as <HetTerm>Insufficient Data</HetTerm> to prevent
                  sharing potentially unreliable data.
                </p>
              </li>
            </ol>

            <h3
              id='age-adjustment-examples'
              className='text-left font-light font-serif text-altBlack text-smallestHeader'
            >
              Age-Adjustment Example: HIV Deaths
            </h3>
            <p>
              Here is an example of a single state with two races,{' '}
              <HetTerm>Race A</HetTerm> and <HetTerm>Race B</HetTerm>, with
              three age breakdowns: <HetTerm>0-29</HetTerm>,{' '}
              <HetTerm>30-59</HetTerm>, and <HetTerm>60+</HetTerm>.{' '}
              <HetTerm>Race A</HetTerm> will be the race we divide against to
              obtain our ratios (like <HetTerm>White, Non-Hispanic</HetTerm>
              ), and <HetTerm>Race B</HetTerm> is any other race group.
            </p>
            <table className='m-4 border-collapse border-bgColor border-solid p-1 font-roboto'>
              <thead>
                <tr className='bg-methodologyGreen'>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Race Group
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Age Group
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    HIV Deaths
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Population
                  </td>
                </tr>
              </thead>

              <tbody>
                <tr className='odd:bg-white even:bg-standardInfo'>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Race A
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    0-29
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    50
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    600,000
                  </td>
                </tr>

                <tr className='odd:bg-white even:bg-standardInfo'>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Race A
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    30-59
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    500
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    800,000
                  </td>
                </tr>

                <tr className='odd:bg-white even:bg-standardInfo'>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Race A
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    60+
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    5,000
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    200,000
                  </td>
                </tr>

                <tr className='odd:bg-white even:bg-standardInfo'>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Race B
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    0-29
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    20
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    200,000
                  </td>
                </tr>

                <tr className='odd:bg-white even:bg-standardInfo'>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Race B
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    30-59
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    200
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    300,000
                  </td>
                </tr>

                <tr className='odd:bg-white even:bg-standardInfo'>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Race B
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    60+
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    800
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    60,000
                  </td>
                </tr>
              </tbody>
            </table>

            <h3 className='mt-20 font-medium'>
              1) Calculate the <HetTerm>age-specific HIV death rates</HetTerm>{' '}
              which will be each race/age group's death count divided by its
              population.
            </h3>

            {/* CALCULATE AGE SPECIFIC DEATH RATES TABLE */}
            <table className='m-4 border-collapse border-bgColor border-solid p-1 font-roboto'>
              <thead>
                <tr className='bg-methodologyGreen'>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Race Group
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Age Group
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    HIV Deaths
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Population
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Age-Specific HIV Death Rate
                  </td>
                </tr>
              </thead>

              <tbody>
                <tr className='odd:bg-white even:bg-standardInfo'>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Race A
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    0-29
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    50
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    600,000
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    <div className='text-smallest italic'>(50 / 600,000)</div>
                    <b> = 0.00008333</b>
                  </td>
                </tr>

                <tr className='odd:bg-white even:bg-standardInfo'>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Race A
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    30-59
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    500
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    800,000
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    <div className='text-smallest italic'>(500 / 800,000)</div>
                    <b> = 0.000625</b>
                  </td>
                </tr>

                <tr className='odd:bg-white even:bg-standardInfo'>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Race A
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    60+
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    5,000
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    200,000
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    <div className='text-smallest italic'>
                      (5,000 / 200,000)
                    </div>
                    <b> = 0.025</b>
                  </td>
                </tr>

                <tr className='odd:bg-white even:bg-standardInfo'>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Race B
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    0-29
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    20
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    200,000
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    <div className='text-smallest italic'>(20 / 200,000)</div>
                    <b> = 0.0001</b>
                  </td>
                </tr>

                <tr className='odd:bg-white even:bg-standardInfo'>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Race B
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    30-59
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    200
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    300,000
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    <div className='text-smallest italic'>(200 / 300,000)</div>
                    <b> = 0.00066667</b>
                  </td>
                </tr>

                <tr className='odd:bg-white even:bg-standardInfo'>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Race B
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    60+
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    800
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    60,000
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    <div className='text-smallest italic'>(800 / 60,000)</div>
                    <b> = 0.01333333</b>
                  </td>
                </tr>
              </tbody>
            </table>

            <h3 className='mt-20 font-medium'>
              2) Get the <HetTerm>standard population</HetTerm> per age group,
              which will be the summed population of all race/age groups within
              that age group.
            </h3>

            {/* A + B TABLE */}
            <table className='m-4 border-collapse border-bgColor border-solid p-1 font-roboto'>
              <thead>
                <tr className='bg-methodologyGreen'>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Race Group
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Age Group
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Standard Population
                  </td>
                </tr>
              </thead>

              <tbody>
                <tr className='odd:bg-white even:bg-standardInfo'>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Total (A & B)
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    0-29
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    <div className='text-smallest italic'>
                      600,000 + 200,000
                    </div>
                    <b>= 800,000</b>
                  </td>
                </tr>

                <tr className='odd:bg-white even:bg-standardInfo'>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Total (A & B)
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    30-59
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    <div className='text-smallest italic'>
                      800,000 + 300,000
                    </div>
                    <b>= 1,100,000</b>
                  </td>
                </tr>

                <tr className='odd:bg-white even:bg-standardInfo'>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Total (A & B)
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    60+
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    <div className='text-smallest italic'>200,000 + 60,000</div>
                    <b>= 260,000</b>
                  </td>
                </tr>
              </tbody>
            </table>

            <h3 className='mt-20 font-medium'>
              3) Calculate the expected deaths for each age/race group:
            </h3>
            <p>As noted above, the formula for each row is:</p>
            <FormulaFormat
              leftSide='Expected deaths for each Age/Race group'
              rightSide={[
                {
                  numerator: 'HIV Deaths',
                  denominator: 'Pop.',
                },
                ' * ',
                {
                  numerator: '',
                  denominator: 'Std. Pop. for corresponding Age group',
                },
              ]}
            />

            <table className='m-4 border-collapse border-bgColor border-solid p-1 font-roboto'>
              <thead>
                <tr className='bg-methodologyGreen'>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Race Group
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Age Group
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Age-Specific HIV Death Rate
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Standard Population
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Expected HIV Deaths
                  </td>
                </tr>
              </thead>

              <tbody>
                <tr className='odd:bg-white even:bg-standardInfo'>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Race A
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    0-29
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    0.00008333
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    <div className='text-smallest italic'>for Ages 0-29:</div>
                    800,000
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    <div className='text-smallest italic'>
                      0.00008333 * 800,000
                    </div>
                    <b> = 66.67</b>
                  </td>
                </tr>

                <tr className='odd:bg-white even:bg-standardInfo'>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Race A
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    30-59
                  </td>

                  <td className='border-collapse border-bgColor border-solid p-1'>
                    0.000625
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    <div className='text-smallest italic'>for Ages 30-59:</div>
                    1,100,000
                  </td>

                  <td className='border-collapse border-bgColor border-solid p-1'>
                    <div className='text-smallest italic'>
                      0.000625 * 1,100,000
                    </div>
                    <b> = 687.5</b>
                  </td>
                </tr>

                <tr className='odd:bg-white even:bg-standardInfo'>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Race A
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    60+
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    0.025
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    <div className='text-smallest italic'>for Ages 60+:</div>
                    260,000
                  </td>

                  <td className='border-collapse border-bgColor border-solid p-1'>
                    <div className='text-smallest italic'>0.025 * 260,000</div>
                    <b> = 6,500</b>
                  </td>
                </tr>

                <tr className='odd:bg-white even:bg-standardInfo'>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Race B
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    0-29
                  </td>

                  <td className='border-collapse border-bgColor border-solid p-1'>
                    0.0001
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    <div className='text-smallest italic'>for Ages 0-29:</div>
                    800,000
                  </td>

                  <td className='border-collapse border-bgColor border-solid p-1'>
                    <div className='text-smallest italic'>0.0001 * 800,000</div>
                    <b> = 80</b>
                  </td>
                </tr>

                <tr className='odd:bg-white even:bg-standardInfo'>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Race B
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    30-59
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    0.00066667
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    <div className='text-smallest italic'>for Ages 30-59:</div>
                    1,100,000
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    <div className='text-smallest italic'>
                      0.00066667 * 1,100,000
                    </div>
                    <b> = 733.33</b>
                  </td>
                </tr>

                <tr className='odd:bg-white even:bg-standardInfo'>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Race B
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    60+
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    0.01333333
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    <div className='text-smallest italic'>for Ages 60+:</div>
                    260,000
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    <div className='text-smallest italic'>
                      0.01333333 * 260,000
                    </div>
                    <b> = 3466.67</b>
                  </td>
                </tr>
              </tbody>
            </table>
            <h3 className='mt-20 font-medium'>
              4) For each race, we sum together the expected HIV deaths from
              each of its age groups to calculate the total expected HIV deaths
              for that race:
            </h3>
            <table className='m-4 border-collapse border-bgColor border-solid p-1 font-roboto'>
              <thead>
                <tr className='bg-methodologyGreen'>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Race Group
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Total Expected HIV Deaths
                  </td>
                </tr>
              </thead>

              <tbody>
                <tr className='odd:bg-white even:bg-standardInfo'>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Race A
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    <div className='text-smallest italic'>
                      66.67 + 687.5 + 6,500
                    </div>
                    <b>= 7,254.17</b>
                  </td>
                </tr>
                <tr className='odd:bg-white even:bg-standardInfo'>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Race B
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    <div className='text-smallest italic'>
                      80 + 733.33 + 3466.67
                    </div>
                    <b>= 4,280</b>
                  </td>
                </tr>
              </tbody>
            </table>
            <h3 className='mt-20 font-medium'>
              5) Calculate the age-adjusted death ratio:
            </h3>
            <table className='m-4 border-collapse border-bgColor border-solid p-1 font-roboto'>
              <thead>
                <tr className='bg-methodologyGreen'>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Race Group
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Total Expected HIV Deaths
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Age-Adjusted Death Ratio
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr className='odd:bg-white even:bg-standardInfo'>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Race A
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    7,254.17
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    <div className='text-smallest italic'>
                      7,254.17 / 7,254.17
                    </div>
                    <b>= 1.0×</b>
                  </td>
                </tr>
                <tr className='odd:bg-white even:bg-standardInfo'>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    Race B
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    4,280
                  </td>
                  <td className='border-collapse border-bgColor border-solid p-1'>
                    <div className='text-smallest italic'>4,280 / 7,254.17</div>
                    <b>= 0.6×</b>
                  </td>
                </tr>
              </tbody>
            </table>

            <div className='mt-24 mb-12 flex w-full justify-center'>
              <HetCTABig
                href={EXPLORE_DATA_PAGE_LINK + AGE_ADJUST_HIV_DEATHS_US_SETTING}
                id='age-adjustment-explore'
              >
                <span>Explore age-adjusted ratios →</span>
              </HetCTABig>
            </div>
          </div>
        </article>
      </section>
      <section>
        <KeyTermsAccordion
          id='age-adjustment-key-terms'
          definitionsArray={ageAdjustTerms}
        />
        <Resources
          id='age-adjustment-resources'
          resourceGroups={AGE_ADJUSTED_RESOURCES}
        />
      </section>
    </>
  )
}

export default AgeAdjustmentLink
