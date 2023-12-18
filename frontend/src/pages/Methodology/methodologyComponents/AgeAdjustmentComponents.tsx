import { Link } from 'react-router-dom'
import {
  EXPLORE_DATA_PAGE_LINK,
  AGE_ADJUST_COVID_DEATHS_US_SETTING,
  AGE_ADJUST_HIV_DEATHS_US_SETTING,
  AGE_ADJUST_COVID_HOSP_US_SETTING,
} from '../../../utils/internalRoutes'
import {
  DataSourcingConfig,
  AlgorithmConfig,
  type AgeAdjustmentConfigType,
} from '../methodologyContent/AgeAdjustmentContent'

export default function AgeAdjustmentIntro() {
  return (
    <>
      <p>
        We have decided to present <b>age-adjusted ratios</b> when possible in
        order to show a more accurate and equitable view of the impact on
        non-White communities in the United States.
      </p>
      <p>
        As of{' '}
        {new Date().toLocaleString('default', {
          month: 'long',
          year: 'numeric',
        })}
        {', '}we are able to calculate these age-adjusted ratios for{' '}
        <Link to={EXPLORE_DATA_PAGE_LINK + AGE_ADJUST_HIV_DEATHS_US_SETTING}>
          HIV deaths
        </Link>
        {', '}
        <Link to={EXPLORE_DATA_PAGE_LINK + AGE_ADJUST_COVID_DEATHS_US_SETTING}>
          COVID-19 deaths
        </Link>
        {' and '}
        <Link to={EXPLORE_DATA_PAGE_LINK + AGE_ADJUST_COVID_HOSP_US_SETTING}>
          COVID-19 hospitalizations
        </Link>
        , and we present the findings in a distinct, age-adjusted table. All of
        the other data shown on the tracker, including visualizations across all
        topics, are not age-adjusted, or ‘crude rates’. Showing non-adjusted
        data can mask disparities, and we are working to expand our analysis to
        provide a more equitable view of the impact to racial and ethnic
        minorities.
      </p>
      <p>
        We use a <b>direct standardization method</b>, with the{' '}
        <b>internal standard population</b> for each state being that state's
        total population. Finally, the ratios we present for each race group is
        that race's age-adjusted count, divided by the age-adjusted count for
        White, non-Hispanic individuals in the same location. Thus, our
        age-adjusted ratios can only be used to compare race groups within each
        state, and <b>not</b> to compare race groups between states. For
        COVID-19 reports, we source the standard population numbers from the
        2019 population numbers from{' '}
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
    </>
  )
}

export const DataSourcingSection = () => {
  return (
    <>
      <h4 className='mt-20 font-sansText text-text font-medium'>
        Data Sourcing
      </h4>
      <p>
        In order to do an age-adjustment, we needed the following pieces of
        information:
      </p>
      {/*  */}
      <AgeAdjustmentList config={DataSourcingConfig} />
    </>
  )
}
export const AlgorithmSection = () => {
  return (
    <>
      <h4 className='mt-20 font-sansText text-text font-medium'>Algorithm</h4>
      <p>In order to generate the age-adjusted ratios, we do the following</p>

      <AgeAdjustmentList config={AlgorithmConfig} />
    </>
  )
}

const AgeAdjustmentList = ({
  config,
}: {
  config: AgeAdjustmentConfigType[]
}) => {
  return (
    <>
      <ol>
        {config.map((o, i) => (
          <li key={o.topic}>
            <p>
              <b>{o.topic}</b>
            </p>
            {o.subList && (
              <ul>
                {o.subList.map((subItem, subIndex) => (
                  <li key={subIndex}>{subItem.subDescription}</li>
                ))}
              </ul>
            )}
            {o.description && <p>{o.description}</p>}
            {o.snippet && (
              <pre className='mx-1 mb-8 mt-1 overflow-x-auto whitespace-pre-wrap break-words border-solid border-bg-color bg-explore-bg-color p-1 text-smallest'>
                {o.snippet}
              </pre>
            )}
          </li>
        ))}
      </ol>
    </>
  )
}
