import { Alert, Card } from '@mui/material'
import DataTable from '../methodologyComponents/DataTable'
import styles from '../methodologyComponents/MethodologyPage.module.scss'
import ConditionVariable from '../methodologyContent/ConditionVariable'
import Resources from '../methodologyComponents/Resources'
import {
  RESOURCES,
  PDOH_RESOURCES,
  EQUITY_INDEX_RESOURCES,
  AIAN_RESOURCES,
  API_RESOURCES,
  HISP_RESOURCES,
  MENTAL_HEALTH_RESOURCES,
  COVID_RESOURCES,
  COVID_VACCINATION_RESOURCES,
  ECONOMIC_EQUITY_RESOURCES,
  HIV_RESOURCES,
} from '../../WhatIsHealthEquity/ResourcesData'
import { Helmet } from 'react-helmet-async'
import MissingDataAlert from '../../../cards/ui/MissingDataAlert'
import DataAlertError from '../methodologyContent/DataAlertError'
import { missingIslandAreaPopulationDataArray } from '../../DataCatalog/methodologyContent/missingDataBlurbs'
// TODO: missing and misidentified people + missing population data

interface DataItem {
  topic: string
  definitions: Array<{
    key: string
    description: string
  }>
  path: string
}

const raceDefinitions: DataItem[] = [
  {
    topic: 'Races and Ethnicities',
    path: '',
    definitions: [
      {
        key: 'All',
        description: 'Any race or ethnicity, including unknown race/ethnicity.',
      },
      {
        key: 'American Indian and Alaska Native (NH)',
        description:
          'A person having origins in any of the original peoples of North and South America (including Central America), who maintains tribal affiliation or community attachment, and who is not Hispanic/Latino.',
      },
      {
        key: 'Asian (NH)',
        description:
          'A person having origins in any of the original peoples of the Far East, Southeast Asia, or the Indian subcontinent including, for example, Cambodia, China, India, Japan, Korea, Malaysia, Pakistan, the Philippine Islands, Thailand, and Vietnam, and who is not Hispanic/Latino.',
      },
      {
        key: 'Black or African American (NH)',
        description:
          'A person having origins in any of the Black racial groups of Africa, and who is not Hispanic/Latino.',
      },
      {
        key: 'Hispanic/Latino',
        description: 'Any race(s), Hispanic/Latino.',
      },
      {
        key: 'Middle Eastern / North African (MENA)',
        description:
          'Race/ethnicity grouping collected by CAWP but not currently collected by the U.S. Census.',
      },
      {
        key: 'Native Hawaiian or Other Pacific Islander (NH)',
        description:
          'A person having origins in any of the original peoples of Hawaii, Guam, Samoa, or other Pacific Islands and who is not Hispanic/Latino.',
      },
      {
        key: 'NH',
        description: `Not Hispanic/Latino. To promote inclusion, we replace the source data labels 'Multiracial' with 'Two or more races,' and 'Some other' with 'Unrepresented'.`,
      },
      {
        key: 'Unrepresented race (NH)',
        description:
          'A single race not tabulated by the CDC, not of Hispanic/Latino ethnicity. Individuals not identifying as one of the distinct races listed in the source data, or multiracial individuals, are grouped together as “Some other race”. This is a problem as it obscures racial identity for many individuals. In our effort to take transformative action towards achieving health equity the Satcher Health Leadership Institute has decided to rename this category to highlight it as a health equity issue. For PrEP coverage, Unrepresented race (NH) is used to recognize individuals who do not identify as part of the Black, White, or Hispanic ethnic or racial groups.',
      },
      {
        key: 'Two or more races (NH)',
        description:
          'Combinations of two or more of the following race categories: "White," "Black or African American," American Indian or Alaska Native," "Asian," Native Hawaiian or Other Pacific Islander," or "Some Other Race", and who are not Hispanic/Latino.',
      },
      {
        key: 'Two or more races & Unrepresented race (NH)',
        description:
          'People who are either multiple races or a single race not represented by the data source’s categorization, and who are not Hispanic/Latino.',
      },
      {
        key: 'White (NH)',
        description:
          'A person having origins in any of the original peoples of Europe, the Middle East, or North Africa, and who is not Hispanic/Latino.',
      },
    ],
  },
]

const RacesAndEthnicitiesLink = () => {
  return (
    <section id="#races-and-ethnicities">
      <article>
        <Helmet>
          <title>Races and Ethnicities - Health Equity Tracker</title>
        </Helmet>
        <h2 className={styles.ScreenreaderTitleHeader}>
          Races and Ethnicities
        </h2>
        <p>
          The combined race/ethnicity groups shown on the tracker can be hard to
          understand, partially due to non-standard race/ethnicity breakdowns
          across data sources. Generally, all race/ethnicities on the tracker
          include Hispanic/Latino unless otherwise specified.
        </p>
        <p>
          <Alert severity="info" role="note">
            Note that the complete definition of a race/ethnicity can only be
            understood <strong>in the context of a particular dataset</strong>{' '}
            and how it classifies race/ethnicity (e.g. the presence of "Other"
            within a dataset changes who might be classified as "Asian" vs.
            "Other").
          </Alert>
          <br />
          We include a few example groups and definitions below.
          <br />
        </p>

        <ConditionVariable definitionsArray={raceDefinitions} />
        <DataAlertError alertsArray={missingIslandAreaPopulationDataArray} />
        <Resources
          id={'#hisp-resources-races'}
          resourceGroups={[HISP_RESOURCES]}
        />
        <Resources
          id={'#aian-resources-races'}
          resourceGroups={[AIAN_RESOURCES]}
        />
        <Resources
          id={'#api-resources-races'}
          resourceGroups={[API_RESOURCES]}
        />
      </article>
    </section>
  )
}

export default RacesAndEthnicitiesLink
