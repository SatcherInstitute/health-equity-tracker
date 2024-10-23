import DatasetList from '../policyComponents/DatasetList'
import { datasets } from './DataCollectionContent'

export const communitySafetyFaqs = [
  {
    question: 'How does the HET define gun violence fatalities?',
    answer: (
      <>
        We derive our definitions from the{' '}
        <a
          href='https://www.cdc.gov/injury/wisqars/fatal_help/definitions_fatal.html#%205.1%20Definitions%20for%20Mortality%20(Fatal%20Injury)%20Reports'
          target='_blank'
          rel='noopener noreferrer'
        >
          CDC WISQARS Definitions
        </a>{' '}
        Fatal Injury Intent Categories.
      </>
    ),
  },
  {
    question:
      'What is the purpose of integrating gun violence data into the Health Equity Tracker?',
    answer: (
      <>
        The integration of gun violence data aims to seamlessly incorporate
        comprehensive statistics related to gun-related injuries into the Health
        Equity Tracker platform. This initiative enables users to explore and
        understand the full spectrum of gun-related incidents and their impacts.
      </>
    ),
  },
  {
    question: 'What is the main source of the gun violence data?',
    answer: (
      <>
        The primary source of our gun violence data is the CDC's WISQARS
        dataset, which offers a wide range of information on gun-related
        injuries and fatal incidents. This dataset helps provide a holistic
        perspective on the effects of gun-related violence.
      </>
    ),
  },
  {
    question: 'What types of injuries are covered in the dataset?',
    answer: (
      <>
        The dataset includes data on gun-related fatalities. Fatal injuries are
        further categorized into:
        <ul>
          <li>Gun Deaths (Children, 0-17)</li>
          <li>Gun Deaths (Young adults, 18-25)</li>
          <li>Gun Homicides (Black Men-specific)</li>
          <li>Gun Homicides</li>
          <li>Gun Suicides</li>
        </ul>
      </>
    ),
  },
  {
    question: 'At what geographic levels is the gun violence data available?',
    answer: <>Data is available at both national and state levels.</>,
  },
  {
    question: 'What time period does the data cover?',
    answer: (
      <>
        The dataset covers data from the years 2001 to 2021 without race
        information, and from 2018 to 2021 with single race information.
      </>
    ),
  },
  {
    question: 'What demographic details can users filter by in the dataset?',
    answer: (
      <>
        <p className='pb-0 mb-0'>
          Currently, all of our gun violence datasets include national- and
          state-level data.
        </p>
        <DatasetList datasets={datasets} />
        <p>
          Additionally, (if the data is available) users can filter the
          datasets' demographics by:
        </p>
        <p className='pt-0 mt-0'>
          <strong>Age Groups:</strong> Source data from the CDC is available in
          5-year increments and single-year groups. We have combined these into
          larger groupings that highlight at-risk groups while allowing our
          visualizations to be effective.
        </p>
        <div className='w-full grid grid-cols-8'>
          <ul className='list-none my-4 col-span-2'>
            <li>Ages 0-14</li>
            <li>Ages 15-19</li>
            <li>Ages 20-24</li>
          </ul>
          <div className='border border-solid border-l-0 border-t-0 border-b-0 border-r-1.2 w-1.2 border-methodologyGreen pr-10 w-fit'></div>
          <ul className='list-none my-4 col-span-2'>
            <li>Ages 25-29</li>
            <li>Ages 30-34</li>
            <li>Ages 35-44</li>
          </ul>
          <div className='border border-solid border-l-0 border-t-0 border-b-0 border-r-1.2 w-1.2 border-methodologyGreen pr-10 w-fit'></div>
          <ul className='list-none my-4 col-span-2'>
            <li>Ages 45-64</li>
            <li>Ages 65+</li>
          </ul>
        </div>
        <p>
          <strong>Sex:</strong> Data can be filtered for male and female
          demographics.
        </p>
        <p>
          <strong>Race and Ethnicity Options:</strong>
        </p>
        <div className='w-full flex flex-wrap justify-evenly'>
          <div className='flex flex-col'>
            <p className='py-0 my-0 font-sansTitle text-text font-medium'>
              Races
            </p>

            <ul className='list-none'>
              <li>Asian</li>
              <li>Black or African American</li>
              <li>Hawaiian Native/Pacific Islander</li>
              <li>Indigenous</li>
              <li>Individuals of an unrepresented race</li>
              <li>Individuals of more than one race</li>
              <li>White</li>
            </ul>
          </div>
          <div className='border border-solid border-l-0 border-t-0 border-b-0 border-r-1.2 w-1.2 border-methodologyGreen pr-10 w-fit'></div>
          <div className='flex flex-col'>
            <p className='py-0 my-0 font-sansTitle text-text font-medium'>
              Ethnicities
            </p>
            <ul className='list-none'>
              <li>Hispanic/Latino</li>
            </ul>
          </div>
        </div>
      </>
    ),
  },
  {
    question: 'How is youth-related violence addressed in the data?',
    answer: (
      <>
        <p>
          Our dataset on youth-related gun violence specifically addresses gun
          deaths among two age groups: <strong>children (0-17)</strong> and{' '}
          <strong>young adults (18-25)</strong>.
        </p>
        <p>
          For both age groups, the data is broken down by race and ethnicity,
          providing insights into the racial and ethnic disparities that may
          exist in gun-related deaths.
        </p>
        <p>
          However, the dataset does not currently include other potential
          breakdowns, such as gender, socioeconomic status, or geographic
          classification (metropolitan vs. non-metropolitan).
        </p>
      </>
    ),
  },
  {
    question: 'What can we expect from the instructional video series?',
    answer: (
      <>
        The upcoming instructional video series will offer clear, concise
        guidance on how to effectively use the Health Equity Tracker. These
        short, digestible videos focus on utilizing gun violence data to
        demonstrate efficient navigation of the platform. Additionally, you can
        find quick insights and tips on our YouTube Shorts channel{' '}
        <a
          href='https://www.youtube.com/@healthequitytracker/shorts'
          target='_href'
        >
          here
        </a>
        .
      </>
    ),
  },
]
