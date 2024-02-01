import {
  NEW_AGE_ADJUSTMENT_LINK,
  CONTACT_TAB_LINK,
  DATA_CATALOG_PAGE_LINK,
} from '../../../utils/internalRoutes'
import { metricDefinitionsArray } from './MetricsDefinitions'

interface SourceAcquisitionData {
  title: string
  description: string
  links: Array<{
    label: string
    url: string
  }>
  listItems: string[]
  nestedListItems: Array<{
    main: string
    sub: string[]
  }>
}

export const sourceAcquisitionData: SourceAcquisitionData = {
  title: 'Source Acquisition',
  description:
    'The Health Equity Tracker is committed to providing accurate, transparent, and up-to-date information on health equity issues. This section elaborates on how we acquire, standardize, and present our data.',
  links: [
    { label: 'Data Catalog', url: `${DATA_CATALOG_PAGE_LINK}` },
    { label: 'Age-adjustment methodology', url: `${NEW_AGE_ADJUSTMENT_LINK}` },
    { label: 'GitHub', url: 'urlMap.hetGitHub' },
    { label: 'Contact Us', url: `${CONTACT_TAB_LINK}` },
  ],
  listItems: [
    'All data in the Health Equity Tracker is sourced from reputable and public databases, including the Centers for Disease Control and Prevention (CDC), U.S Census Bureau, Kaiser Family Foundation, and several others. A comprehensive list of our data sources, along with relevant details, can be found in our [data catalog](https://healthequitytracker.org/datacatalog).',
    'Our data analysis aims to provide insights into health disparities across various demographic groups. Age-adjustment methodology is employed to ensure to illustrate the disproportionate impact of morbidity and mortality among different races and ethnic groups throughout the U.S.in comparison to the white(non-Hispanic) population.',
    'The Health Equity Tracker employs a range of visualization techniques to present data in an intuitive and user-friendly manner. This includes charts, graphs, and interactive visualizations tailored to the specific type of data being presented.',
    'While we strive for accuracy, some datasets may have inherent limitations, including gaps, potential biases, or uncertainties. We transparently communicate these limitations whenever relevant.',
    'Data sources are continuously monitored for updates. The Health Equity Tracker ensures that all visualizations and datasets are refreshed in line with the latest available data.',
    'We value the input of various stakeholders, including health professionals, community leaders, and the general public, in shaping the content and presentation of our tracker.',
    `The entire Health Equity Tracker codebase is publicly available and
    open-source; contributions are welcome via [Github](https://github.com/SatcherInstitute/health-equity-tracker). The Health Equity Tracker is a testament to our commitment to promoting health equity and justice. We believe in the power of data to drive positive change, and we invite the community to engage with our open-source platform. For any queries, feedback, or suggestions regarding our data acquisition and presentation, please [contact us](https://healthequitytracker.org/contact).`,
  ],
  nestedListItems: [
    {
      main: 'Data Collection',
      sub: [
        'Methods: Data are retrieved from publicly sourced application programming interfaces (APIs) and manual downloads. These methods ensure that we have the most recent and relevant data.',
        'Quality Assurance: Sources are refreshed upon receiving update notifications to ensure data accuracy and timeliness.',
      ],
    },
    {
      main: 'Data Processing',
      sub: [
        'Cleaning: We process raw data to remove any inconsistencies, duplicates, or irrelevant information.',
        'Transformation: Graphic visualizations reflect crude rates (non-age-adjusted) presented in various formats, such as per 100k, percent rate, percent share, or as an index score.',
        'Integration: Where data are available, we calculate age-adjusted ratios. These ratios help illustrate the disproportionate impact of morbidity and mortality among different races and ethnic groups in the U.S. compared to the white (non-Hispanic) population.',
      ],
    },
  ],
}

export const sourcesDefinitionsArray = [
  {
    topic: metricDefinitionsArray[0].topic,
    path: '',
    definitions: [
      {
        key: metricDefinitionsArray[0].definitions[0].key,
        description: metricDefinitionsArray[0].definitions[0].description,
      },
      {
        key: metricDefinitionsArray[0].definitions[1].key,
        description: metricDefinitionsArray[0].definitions[1].description,
      },
      {
        key: metricDefinitionsArray[0].definitions[2].key,
        description: metricDefinitionsArray[0].definitions[2].description,
      },
    ],
  },
  {
    topic: 'Crude rates',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description:
          'They are useful for providing a basic understanding of health outcomes but may not provide an accurate picture of disparities when age distributions differ significantly among groups.',
      },
      {
        key: 'Measurement Definition',
        description:
          'These rates represent the number of cases or events per unit of population without accounting for age differences. ',
      },
    ],
  },
  {
    topic: metricDefinitionsArray[1].topic,
    path: '',
    definitions: [
      {
        key: metricDefinitionsArray[1].definitions[0].key,
        description: metricDefinitionsArray[1].definitions[0].description,
      },
      {
        key: metricDefinitionsArray[1].definitions[1].key,
        description: metricDefinitionsArray[1].definitions[1].description,
      },
    ],
  },
  {
    topic: 'Percent rate',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description:
          'It is often used to compare the prevalence or incidence of a health condition relative to the total population size, enabling straightforward comparisons across different demographic groups or regions.',
      },
      {
        key: 'Measurement Definition',
        description:
          'A percent rate, in health equity data visualization, is a measure that expresses a particular metric as a percentage of a given population.',
      },
    ],
  },
  {
    topic: 'Percent share',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description:
          'In health equity data visualization, it helps highlight the relative importance of different population groups in terms of health outcomes or disparities.',
      },
      {
        key: 'Measurement Definition',
        description: `Percent share represents the proportion of a specific subgroup's contribution to a total metric, often expressed as a percentage.`,
      },
    ],
  },
  {
    topic: 'Index score',
    path: '',
    definitions: [
      {
        key: 'Health Equity Significance',
        description:
          'An index score is a composite measure used to summarize and compare multiple indicators or metrics related to health equity or justice.',
      },
      {
        key: 'Measurement Definition',
        description:
          'It provides a single numerical value that reflects the overall status or level of equity in a given context, facilitating easy comparisons and policy assessments.',
      },
    ],
  },
]

export const missingDataArray = [
  {
    topic: 'Missing Data',
    path: '',
    id: '',
    definitions: [
      {
        key: 'Missing population data for Census Island Areas',
        description: `Population data for Northern Mariana Islands, Guam,
        American Samoa, and the U.S. Virgin Islands are not
        reported in the ACS five year estimates; in these territories, for
        current and time-series based population figures back to 2016, we
        incorporate the 2020 Decennial Island Areas report. For time-series data
        from 2009-2015, we incorporate the 2010 release of the Decennial report.
        Note: The NH, or Non-Hispanic race groups are only provided by the
        Decennial report for VI but not the other Island Areas. As the
        overall number of Hispanic-identifying people is very low in these
        Island Areas (hence the Census not providing these race groups), we use
        the ethnicity-agnostic race groups (e.g.
        Black or African American) even though the condition data may use
        Non-Hispanic race groups (e.g. Black or African American (NH))`,
      },
      {
        key: 'Missing and suppressed COVID data',
        description: ` For COVID-19 related reports, this tracker uses disaggregated,
        individual [case level data reported by states, territories, and other
          jurisdictions to the CDC](urlMap.cdcCovidRestricted). Many of these case records are insufficiently disaggregated, report an
        unknown hospitalization and/or death status, or otherwise fail to
        provide a complete picture of COVID-19 and its overall impact.`,
      },
      {
        key: 'Missing COVID-19 vaccination data',
        description: `The CDC's county-level vaccine dataset only
        provides vaccination figures for the All group, but does not
        include any demographic disaggregation. Because state-reported population categories
        do not always coincide with the categories reported by the census, we
        rely on the Kaiser Family Foundation population tabulations for
        state-reported population categories, which only include population
        numbers for Black, White, Asian, and
        Hispanic. ‘Percent of vaccinated’ metrics for
        Native Hawaiian and Pacific Islander, and
        American Indian and Alaska Native are shown with a population
        comparison metric from the ACS 5-year estimates, while
        Unrepresented race is shown without any population comparison
        metric.`,
      },
      {
        key: 'Missing data for women in legislative office',
        description: `The Center for American Women in Politics (CAWP) dataset uses unique
        race/ethnicity groupings that do not correspond directly with the
        categories used by the U.S. Census. For this reason,
        Middle Eastern & North African (Women),
        Asian American & Pacific Islander (Women), and
        Native American, Alaska Native, & Native Hawaiian (Women) are
        presented without corresponding population comparison metrics. We are currently unable to locate reliable data on state legislature
        totals, by state, by year prior to 1983. For that reason, we cannot
        calculate rates of representation historically before that year.`,
      },
      {
        key: 'Missing data for HIV deaths, diagnoses, and prevalence',
        description: `County-level data is suppressed when the population denominator is
        less than 100, the total case count is between 1–4 cases, or when
        querying HIV or AIDS deaths. To protect personal privacy, prevent revealing information that might
        identify specific individuals, and ensure the reliability of
        statistical estimates, small data values may not be available in some
        circumstances. There isn't enough data to accurately calculate subpopulation rates by
        age, sex, and race/ethnicity for the Census Island Areas (US
        territories other than Puerto Rico). As a result, the analysis or
        report will not provide detailed information about these specific
        groups in those regions. The Asian category includes cases previously classified as
        "Asian/Pacific Islander" under the pre-1997 Office of Management and
        Budget (OMB) race/ethnicity classification system when querying HIV
        prevalence.`,
      },
      {
        key: 'PrEP Coverage and Prescriptions',
        description: `State-level and county-level PrEP data are not available for race and
        ethnicity. The race and ethnicity of individuals prescribed PrEP are only
        available for less than 40% of all people prescribed PrEP and are
        limited to four categories: White, Black, Hispanic/Latino, and Other. PrEP coverage data are suppressed at any level if the number of
        persons prescribed PrEP is suppressed, the estimated number of persons
        with indications for PrEP (PreEP-eligible population) is suppressed,
        or if the number of persons prescribed PrEP is less than 40.`,
      },
      {
        key: 'Medicare Administration Data',
        description: `The Medicare source files did not include information
        on gender or sexual orientation. Although we can display rates for those who are
        eligible due to disability generally, we can not represent disparities
        associated with specific physical or mental disabilities. Unfortunately,
        there are crucial data missing in the Medicare FFS (Fee-For-Service)
        data, such as the impacts of racism and discrimination on health
        outcomes and adherence to medicines. To protect patient privacy, all data
        representing 1-10 people were suppressed.`,
      },
      {
        key: `Missing America's Health Rankings data`,
        description: `Population data: AHR does not have population data available
        for: preventable hospitalizations, voter participation, and
        non-medical drug use. We have chosen not to show any percent share
        metrics for the measures without population data because the source
        only provides the metrics as rates. Without population data, it is
        difficult to accurately calculate percent share measures, which could
        potentially result in misleading data.`,
      },
    ],
  },
]
