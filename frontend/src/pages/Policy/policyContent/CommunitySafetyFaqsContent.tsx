import { dataSourceMetadataMap } from '../../../data/config/MetadataMap'
import { COMMUNITY_SAFETY_DROPDOWNIDS_NO_CHR } from '../../../data/config/MetricConfigCommunitySafety'
import HetButtonSecondary from '../../../styles/HetComponents/HetButtonSecondary'
import HetDivider from '../../../styles/HetComponents/HetDivider'
import HetLaunchLink from '../../../styles/HetComponents/HetLaunchLink'
import HetTerm from '../../../styles/HetComponents/HetTerm'
import HetTextArrowLink from '../../../styles/HetComponents/HetTextArrowLink'
import HetTopicDemographics from '../../../styles/HetComponents/HetTopicDemographics'
import { urlMap } from '../../../utils/externalUrls'
import {
  DATA_COLLECTION_TAB,
  HEALTH_EQUITY_GUIDES_TAB,
} from '../../../utils/internalRoutes'
import { IndentedItem } from '../../FAQs/FaqsPageData'

interface OptionGroupProps {
  title: string
  children: React.ReactNode
}

interface Faq {
  question: string
  answer: React.ReactNode | string
}

const OptionGroup = ({ title, children }: OptionGroupProps) => (
  <div className='my-4'>
    <h3 className='my-0 font-medium text-alt-green text-title'>{title}</h3>
    {children}
  </div>
)

const AgeGroupList = () => (
  <div className='ml-4 flex flex-col justify-start align-start md:flex-row'>
    <div className='my-2 flex w-full flex-col text-small md:grid md:grid-cols-8 md:text-text'>
      <ul className='col-span-2 my-4 list-none pl-0'>
        <li>Ages 0-14</li>
        <li>Ages 15-19</li>
        <li>Ages 20-24</li>
      </ul>
      <Divider />
      <ul className='col-span-2 my-4 list-none pl-0'>
        <li>Ages 25-29</li>
        <li>Ages 30-34</li>
        <li>Ages 35-44</li>
      </ul>
      <Divider />
      <ul className='col-span-2 my-4 list-none pl-0'>
        <li>Ages 45-64</li>
        <li>Ages 65+</li>
      </ul>
    </div>
  </div>
)

const Divider = () => (
  <div className='mx-0 my-2 w-full border border-methodology-green border-t-0 border-r-1.2 border-b-1.2 border-l-0 border-solid md:mx-10 md:my-0 md:w-fit md:border-b-0'></div>
)

const RaceEthnicityOptions = () => (
  <div className='ml-2 flex flex-col justify-start align-start md:flex-row'>
    <div className='my-2 flex w-auto flex-col'>
      <p className='my-0 font-semibold text-alt-black text-text'>Races</p>
      <ul className='list-none pl-1 text-small'>
        <li>Asian</li>
        <li>Black or African American</li>
        <li>Hawaiian Native/Pacific Islander</li>
        <li>Indigenous</li>
        <li>Individuals of an unrepresented race</li>
        <li>Individuals of more than one race</li>
        <li>White</li>
      </ul>
    </div>
    <Divider />
    <div className='flex flex-col'>
      <p className='my-0 font-semibold text-alt-black text-text'>Ethnicities</p>
      <ul className='list-none pl-1 text-small'>
        <li>Hispanic/Latino</li>
      </ul>
    </div>
  </div>
)

function DataDescription() {
  return (
    <>
      <p className='mb-0 pb-0'>
        If the data is available, users can filter the datasets' demographics by
        age, sex, race and ethnicity, and city-size.
      </p>
      <div className='flex flex-col gap-0'>
        <p className='mb-0 pb-0'>
          Currently, all of our gun violence datasets include national- and
          state-level data.
        </p>
        <HetTopicDemographics
          topicIds={[...COMMUNITY_SAFETY_DROPDOWNIDS_NO_CHR]}
          datasourceMetadata={dataSourceMetadataMap.cdc_wisqars}
        />
        <OptionGroup title='Age Group Options'>
          <p className='my-0 py-0'>
            Source data from the CDC is available in 5-year increments and
            single-year groups. We have combined these into larger groupings
            that highlight at-risk groups while allowing our visualizations to
            be effective.
          </p>
          <AgeGroupList />
        </OptionGroup>
        <OptionGroup title='Sex Options'>
          <p className='my-0 py-0'>
            Data can be filtered for male and female demographics.
          </p>
        </OptionGroup>
        <OptionGroup title='Race and Ethnicity Options'>
          <RaceEthnicityOptions />
        </OptionGroup>
        <OptionGroup title='City Size Options'>
          <p className='my-0 py-0'>
            Data can be filtered for metropolitan and non-metropolitan (e.g.
            rural) city sizes.
          </p>
        </OptionGroup>
      </div>
    </>
  )
}

export const communitySafetyFaqs: Faq[] = [
  {
    question: 'How does the HET define gun violence fatalities?',
    answer: (
      <>
        We derive our definitions from the CDC WISQARS Definitions Fatal Injury
        Intent Categories.
        <HetLaunchLink
          label={`CDC WISQARS Definitions`}
          href={urlMap.wisqarsDefinitions}
        />
        <div>
          <HetTextArrowLink
            link={DATA_COLLECTION_TAB}
            linkText={'Learn about our data collection process'}
          />
        </div>
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
        The primary source of our gun violence data is the CDC's WISQARS dataset{' '}
        <HetLaunchLink
          label={`CDC WISQARS Definitions`}
          href={dataSourceMetadataMap.cdc_wisqars.data_source_link}
        />
        , which offers a wide range of information on gun-related injuries and
        fatal incidents. This dataset helps provide a holistic perspective on
        the effects of gun-related violence.
      </>
    ),
  },
  {
    question: 'What types of injuries are covered in the dataset?',
    answer: (
      <>
        <p>
          The dataset includes data on gun-related fatalities, which further
          categorizes gun deaths among adults as:
        </p>
        <IndentedItem label={'Gun Homicides (Black Men-specific)'} />
        <IndentedItem label={'Gun Homicides'} />
        <IndentedItem label={'Gun Suicides'} />
        <p>
          Our dataset on <HetTerm>youth-related gun violence</HetTerm>{' '}
          specifically categorizes fatalities as:
        </p>
        <IndentedItem label={'Gun Deaths (Children, 0-17)'} />
        <IndentedItem label={'Gun Deaths (Young adults, 18-25)'} />
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
    answer: <DataDescription />,
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
        <p>
          The instructional video series offer guidance on how to effectively
          use the Health Equity Tracker. These short, digestible videos focus on
          utilizing gun violence data to demonstrate efficient navigation of the
          platform.
        </p>
        <div className='flex justify-center'>
          <HetButtonSecondary href={HEALTH_EQUITY_GUIDES_TAB}>
            Watch our How-To Series
          </HetButtonSecondary>
        </div>
        <HetDivider className='my-8' />

        <p>
          In addition to covering our community safety topics, you can find
          quick insights and tips across a variety of our featured health topics
          on our YouTube Shorts channel.
        </p>
        <div className='flex justify-center'>
          <HetTextArrowLink
            link={urlMap.hetYouTubeShorts}
            linkText={'Visit our Health Equity Tracker YouTube channel'}
          />
        </div>
      </>
    ),
  },
]
