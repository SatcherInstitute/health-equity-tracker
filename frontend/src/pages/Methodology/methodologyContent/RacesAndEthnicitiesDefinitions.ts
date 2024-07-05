import { GLOSSARY_LINK } from '../../../utils/internalRoutes'

export interface DataItem {
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


export const ethnicityDefinitions: DataItem =
{
  topic: 'Ethnicities',
  definitions: [

    {
      key: 'Hispanic/Latino',
      path: '#race-eth-hispanic',
      description: 'Any race(s), Hispanic/Latino.',
      resource: GLOSSARY_LINK + '#hisp-resources',
      considerations: [
        {
          title: 'General Considerations',
          points: [
            'Generally, all race/ethnicity groups on the tracker include Hispanic/Latino individuals, unless otherwise specified as (NH).',
            'Individuals who identify as Hispanic/Latino may not be recorded in their respective race category in certain datasets.',
          ],
        },

      ],
    },


  ],
}

export const raceDefinitions: DataItem =
{
  topic: 'Races',
  definitions: [

    {
      key: 'Indigenous',
      path: '#race-eth-aian',
      description:
        'A person having origins in any of the original peoples of North and South America (including Central America), who maintains tribal affiliation or community attachment. Many of our data sources report this category as “American Indian and Alaska Native”.',
      resource: GLOSSARY_LINK + '#aian-resources',
      considerations: [

        {
          title: 'General Considerations',
          points: [
            'Many states do not record data for “Indigenous” or “American Indian and Alaska Native”, often grouping these individuals into other categories.',
          ],
        },
      ],
    },
    {
      key: 'Asian',
      path: '#race-eth-asian',
      description:
        'A person having origins in any of the original peoples of the Far East, Southeast Asia, or the Indian subcontinent including, for example, Cambodia, China, India, Japan, Korea, Malaysia, Pakistan, the Philippine Islands, Thailand, and Vietnam.',
      resource: GLOSSARY_LINK + '#api-resources',
      considerations: [

        {
          title: 'Chronic Diseases',
          points: [
            'The Asian category often includes cases previously classified as "Asian/Pacific Islander" under the pre-1997 Office of Management and Budget (OMB) race/ethnicity classification system when querying HIV prevalence',
          ],
        },

      ],
    },
    {
      key: 'Native Hawaiian or Other Pacific Islander',
      path: '#race-eth-nhpi',
      description:
        'A person having origins in any of the original peoples of Hawaii, Guam, Samoa, or other Pacific Islands.',
      considerations: [
        {
          title: 'General Considerations',
          points: [
            `‘Percent of vaccinated’ comparison population metrics for Native Hawaiian and Pacific Islander are sourced from the ACS 5-year estimates.`,
            'Many states do not record data for the Native Hawaiian and Pacific Islander racial categories, often grouping these individuals into other categories.',
          ],
        },
      ],
    },
    {
      key: 'Black or African American',
      path: '#race-eth-black',
      description:
        'A person having origins in any of the Black racial groups of Africa.',
    },

    {
      key: 'Unrepresented race',
      path: '#race-eth-other',
      description:
        'A single race not tabulated by the CDC. Individuals not identifying as one of the distinct races listed in the source data are grouped together as “Some other race”. This is a problem as it obscures racial identity for many individuals. In our effort to take transformative action towards achieving health equity the Satcher Health Leadership Institute has decided to rename this category on our reports to highlight it as a health equity issue. For PrEP coverage, Unrepresented race is used to recognize individuals who do not identify as part of the Black, White, or Hispanic ethnic or racial groups.',
    },
    {
      key: 'Two or more races',
      path: '#race-eth-multi',
      description:
        'Combinations of two or more of the following race categories: "White," "Black or African American," American Indian or Alaska Native," "Asian," Native Hawaiian or Other Pacific Islander," or "Some Other Race". We have chosen to use the term "Two or more races" rather than "Multiracial" as some data sources have used.',
    },
    {
      key: 'Two or more races & Unrepresented race',
      path: '#race-eth-multi-or-other',
      description:
        'People who are either multiple races or a single race not represented by the data source’s categorization.',
      considerations: [
        {
          title: 'General Considerations',
          points: [
            'The presence of "Other" within a dataset can change the classification of certain individuals.',
          ],
        },
      ],
    },
    {
      key: 'White',
      path: '#race-eth-white',
      description:
        'A person having origins in any of the original peoples of Europe, the Middle East, or North Africa.',
      considerations: [
        {
          title: 'Chronic Diseases',
          points: [
            'The U.S. Census does not currently collect data on Middle Eastern or North African ethnicity; those individuals have historically been categorized as White and continue to be classified as such. This can obscure important trends in this marginalized population.',
          ],
        },
      ],
    },
  ],
}


export const moreNonStandardDefinitions: DataItem =
{
  topic: 'Additional Groups',
  definitions: [
    {
      key: 'Middle Eastern / North African (MENA)',
      path: '#race-eth-mena',
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

      ],
    },
    {
      key: 'Asian, Native Hawaiian, and Pacific Islander; Asian American & Pacific Islander; Native American, Alaska Native, & Native Hawaiian',
      path: '#race-eth-aian-api',
      description:
        'Various composite groups used primarily by the CAWP dataset to represent non-standard race/ethnicity data reporting.',
      considerations: [
        {
          title: 'General Considerations',
          points: [
            'The U.S. Census no longer combines Asian and Pacific Islander into a single group.',
          ],
        },

      ],
    },


    {
      key: 'Unknown',
      path: '#race-eth-unknown',
      description: 'Cases of a topic condition that were recorded, but which did not provide complete race/ethnicity information.',
      considerations: [
        {
          title: 'General Considerations',
          points: [
            'For reports that use a rate per 100k, Unknown cannot be represented alongside the known race/ethnicity groups, as the denominator population is always known. However, it is important to understand the percentage of total cases where race/ethnicity is missing, as this may be an important indicator of health inequities and unfair data collection practices.',
          ],
        },
      ],
    },
    {
      key: 'All',
      path: '#race-eth-all',
      description: 'Any race or ethnicity, including cases of a topic with unknown race/ethnicity.',
      considerations: [
        {
          title: 'General Considerations',
          points: [
            'Rates for this group will not always be an average of the other known race groups, since the ALL category includes cases with unknown race/ethnicity.',
            'Though it reflect all people regardless of race/ethnicity, this group might only reflect a specific sub-population in terms of other demographics like age (e.g. for topics that only measure cases among adults).'
          ],
        },
      ],
    },



  ],
}


export const raceAndEthnicitySublinks = [...ethnicityDefinitions.definitions, ...raceDefinitions.definitions, ...moreNonStandardDefinitions.definitions].map((item) => ({
  label: item.key,
  path: item?.path ?? '',
}))