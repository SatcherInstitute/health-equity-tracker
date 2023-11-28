import { Alert, AlertTitle } from '@mui/material'
import { Helmet } from 'react-helmet-async'
import { GLOSSARY_LINK } from '../../../utils/internalRoutes'
import { parseDescription } from '../methodologyComponents/GlossaryTerm'

interface DataItem {
  topic: string
  definitions: Array<{
    key: string
    path?: string
    description: string
    resource?: string
    considerations?: Array<{
      title: string
      points: string[]
    }>
  }>
}

const raceDefinitions: DataItem[] = [
  {
    topic: 'Races and Ethnicities',
    definitions: [
      {
        key: 'All',
        path: '#all',
        description: 'Any race or ethnicity, including unknown race/ethnicity.',
        considerations: [
          {
            title: 'General Considerations',
            points: [
              'Some states and datasets use unique race/ethnicity groupings that do not correspond directly with the categories used by the U.S. Census.',
              'There are no required or standardized race and ethnicity categories for data collection across state and local jurisdictions.',
              'Neither disability nor mental health status is collected with most data sources.',
            ],
          },
        ],
      },
      {
        key: 'American Indian and Alaska Native (NH)',
        path: '#aian_nh',
        description:
          'A person having origins in any of the original peoples of North and South America (including Central America), who maintains tribal affiliation or community attachment, and who is not Hispanic/Latino.',
        resource: GLOSSARY_LINK + '#aian-resources',
        considerations: [
          {
            title: 'Political Determinants of Health',
            points: [
              'The composite race group for women in legislative office includes American Indian & Alaska Native.',
            ],
          },
          {
            title: 'General Considerations',
            points: [
              'For the state level, the ACS 2019 estimation is used for the American Indian and Alaska Native demographic.',
              'Many states do not record data for the American Indian and Alaska Native racial categories, often grouping these individuals into other categories.',
            ],
          },
        ],
      },
      {
        key: 'Asian (NH)',
        path: '#api_nh',
        description:
          'A person having origins in any of the original peoples of the Far East, Southeast Asia, or the Indian subcontinent including, for example, Cambodia, China, India, Japan, Korea, Malaysia, Pakistan, the Philippine Islands, Thailand, and Vietnam, and who is not Hispanic/Latino.',
        resource: GLOSSARY_LINK + '#api-resources',
        considerations: [
          {
            title: 'General Considerations',
            points: [
              'For the state level, the population counts for the Asian demographic at the state level are provided by the Kaiser Family Foundation.',
              'The Kaiser Family Foundation only collects population data for the Asian demographic, limiting their per 100k metrics at the state level.',
            ],
          },
          {
            title: 'Chronic Diseases',
            points: [
              'The Asian category includes cases previously classified as "Asian/Pacific Islander" under the pre-1997 Office of Management and Budget (OMB) race/ethnicity classification system when querying HIV prevalence',
            ],
          },
          {
            title: 'Political Determinants of Health',
            points: [
              'The composite race group for women in legislative office includes Asian & Pacific Islander.',
              'The Center for American Women in Politics (CAWP) dataset classifies Asian American & Pacific Islander (Women) differently from U.S. Census categories.',
            ],
          },
        ],
      },
      {
        key: 'Black or African American (NH)',
        path: '#black_nh',
        description:
          'A person having origins in any of the Black racial groups of Africa, and who is not Hispanic/Latino.',
        considerations: [
          {
            title: 'General Considerations',
            points: [
              'The Kaiser Family Foundation provides population estimates for the Black demographic at the state level.',
            ],
          },
          {
            title: 'COVID-19',
            points: [
              `‘Percent of vaccinated’ metrics for Black women are sourced from the ACS 5-year estimates.`,
            ],
          },
          {
            title: 'Political Determinants of Health',
            points: [
              'Historical intersectional representation data, such as the percent of U.S. Congress members identified as black women since 1915, is sourced from the open-source @unitedstates project.',
            ],
          },
        ],
      },
      {
        key: 'Hispanic/Latino',
        path: '#hispanic',
        description: 'Any race(s), Hispanic/Latino.',
        resource: GLOSSARY_LINK + '#hisp-resources',
        considerations: [
          {
            title: 'General Considerations',
            points: [
              'Generally, all race/ethnicities on the tracker include Hispanic/Latino unless otherwise specified.',
              'Individuals who identify as Hispanic/Latino may not be recorded in their respective race category in certain datasets.',
            ],
          },
          {
            title: 'HIV',
            points: [
              'The race and ethnicity of individuals prescribed PrEP includes the Hispanic/Latino category.',
            ],
          },
        ],
      },
      {
        key: 'Middle Eastern / North African (MENA)',
        path: '#mena',
        description:
          'Race/ethnicity grouping collected by CAWP but not currently collected by the U.S. Census.',
        considerations: [
          {
            title: 'General Considerations',
            points: [
              'The U.S. Census currently does not collect population data for the MENA demographic.',
              'MENA individuals are counted by the ACS as White.',
            ],
          },
          {
            title: 'Political Determinants of Health',
            points: [
              'The Center for American Women in Politics (CAWP) dataset classifies Middle Eastern & North African (Women) differently from U.S. Census categories.',
            ],
          },
        ],
      },
      {
        key: 'Native Hawaiian or Other Pacific Islander (NH)',
        path: '#nhpi_nh',
        description:
          'A person having origins in any of the original peoples of Hawaii, Guam, Samoa, or other Pacific Islands and who is not Hispanic/Latino.',
        considerations: [
          {
            title: 'General Considerations',
            points: [
              'For the state level, the ACS 2019 estimation is used for the Native Hawaiian and Pacific Islander demographic.',
              `‘Percent of vaccinated’ metrics for Native Hawaiian and Pacific Islander are sourced from the ACS 5-year estimates.`,
              'Many states do not record data for the Native Hawaiian and Pacific Islander racial categories, often grouping these individuals into other categories.',
            ],
          },
        ],
      },
      {
        key: 'NH',
        path: '#nh',
        description: `Not Hispanic/Latino. To promote inclusion, we replace the source data labels 'Multiracial' with 'Two or more races,' and 'Some other' with 'Unrepresented'.`,
      },
      {
        key: 'Unrepresented race (NH)',
        path: '#other_nonstandard_nh',
        description:
          'A single race not tabulated by the CDC, not of Hispanic/Latino ethnicity. Individuals not identifying as one of the distinct races listed in the source data, or multiracial individuals, are grouped together as “Some other race”. This is a problem as it obscures racial identity for many individuals. In our effort to take transformative action towards achieving health equity the Satcher Health Leadership Institute has decided to rename this category to highlight it as a health equity issue. For PrEP coverage, Unrepresented race (NH) is used to recognize individuals who do not identify as part of the Black, White, or Hispanic ethnic or racial groups.',
      },
      {
        key: 'Two or more races (NH)',
        path: '#multi_or_other_standard',
        description:
          'Combinations of two or more of the following race categories: "White," "Black or African American," American Indian or Alaska Native," "Asian," Native Hawaiian or Other Pacific Islander," or "Some Other Race", and who are not Hispanic/Latino.',
      },
      {
        key: 'Two or more races & Unrepresented race (NH)',
        path: '#multi_or_other_standard_nh',
        description:
          'People who are either multiple races or a single race not represented by the data source’s categorization, and who are not Hispanic/Latino.',
        considerations: [
          {
            title: 'General Considerations',
            points: [
              'The presence of "Other" within a dataset can change the classification of certain individuals.',
              `Missing data: There isn't enough data to accurately calculate subpopulation rates by age, sex, and race/ethnicity for the Census Island Areas (US territories other than Puerto Rico).`,
            ],
          },
          {
            title: 'HIV',
            points: [
              `The race and ethnicity of individuals prescribed PrEP includes the "Other" category.`,
            ],
          },
        ],
      },
      {
        key: 'White (NH)',
        path: '#white',
        description:
          'A person having origins in any of the original peoples of Europe, the Middle East, or North Africa, and who is not Hispanic/Latino.',
        considerations: [
          {
            title: 'Chronic Diseases',
            points: [
              'For the state level, the population counts for the Asian demographic at the state level are provided by the Kaiser Family Foundation.',
              'The Kaiser Family Foundation only collects population data for the Asian demographic, limiting their per 100k metrics at the state level.',
              'The Asian category includes cases previously classified as "Asian/Pacific Islander" under the pre-1997 Office of Management and Budget (OMB) race/ethnicity classification system when querying HIV prevalence.',
              'The composite race group for women in legislative office includes Asian & Pacific Islander.',
              'The Center for American Women in Politics (CAWP) dataset classifies Asian American & Pacific Islander (Women) differently from U.S. Census categories.',
            ],
          },
        ],
      },
    ],
  },
]

const RacesAndEthnicitiesLink = () => {
  return (
    <section id='#races-and-ethnicities'>
      <article>
        <Helmet>
          <title>Races and Ethnicities - Health Equity Tracker</title>
        </Helmet>
        <h2 className='sr-only'>Races and Ethnicities</h2>
        <h3 className='font-sansTitle text-title' id='#data-gaps'>
          Addressing Data Gaps Stemming from Structural Inequities
        </h3>
        <p>
          Health inequities arise from deep-rooted issues of structural racism
          and oppression, often resulting in gaps in data collection. We strive
          to present the most comprehensive reports based on the best available
          data.
        </p>

        <p>
          However, we acknowledge these limitations, especially in areas like
          the Census Island Areas (US territories excluding Puerto Rico), where
          detailed subpopulation rates by age, sex, and race/ethnicity are
          scarce.
        </p>

        <p>
          Our ongoing efforts aim to bridge these data gaps, ensuring more
          informed and effective health policies across the United States.
        </p>
        <p>
          The combined race/ethnicity groups shown on the tracker can be hard to
          understand, partially due to non-standard race/ethnicity breakdowns
          across data sources.
        </p>
        <p>
          <Alert severity='info' role='note'>
            <AlertTitle>
              Dataset Definitions and Contextual Variances
            </AlertTitle>
            <p>
              Understanding race and ethnicity classifications within our
              tracker requires a nuanced approach. Generally, we include
              Hispanic/Latino in all race/ethnicity categories, unless stated
              otherwise.
            </p>
            <p>
              However, it's crucial to recognize that the precise definition of
              a race or ethnicity is{' '}
              <strong>
                intrinsically tied to the context of the specific dataset
              </strong>{' '}
              from which it originates.
            </p>
            <p>
              For instance, the inclusion of an "Other" category can influence
              how individuals are categorized, potentially affecting
              distinctions like "Asian" vs. "Other".
            </p>
          </Alert>
        </p>
        {raceDefinitions.map((item) => {
          return (
            <div id={item.topic} key={item.topic}>
              {item.definitions.map((def) => {
                return (
                  <div
                    className='mt-0 flex flex-col items-start'
                    id={def.path}
                    key={def.key}
                  >
                    <h3>{def.key}</h3>
                    <figure className='mt-0 flex flex-col items-start gap-3'>
                      <p className='m-0 italic text-alt-black'>
                        {parseDescription(def.description)}
                      </p>
                      {def.considerations && def.considerations.length > 0 && (
                        <div>
                          <h4 className='m-0 mb-4 text-alt-black'>
                            Data Limitations and Specific Considerations
                          </h4>
                          {def.considerations.map((consideration) => (
                            <div key={consideration.title}>
                              <h5>{consideration.title}</h5>
                              {consideration.points.map((point, idx) => (
                                <p key={idx}>{point}</p>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                      {def.resource && (
                        <a
                          href={def.resource}
                          className='font-sansTitle  font-medium leading-lhNormal text-alt-green no-underline'
                        >
                          Explore {def.key} resources →
                        </a>
                      )}
                    </figure>
                  </div>
                )
              })}
            </div>
          )
        })}
      </article>
    </section>
  )
}

export default RacesAndEthnicitiesLink
