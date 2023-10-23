import {
  AGE_ADJUSTMENT_LINK,
  CONTACT_TAB_LINK,
  DATA_CATALOG_PAGE_LINK,
  RESOURCES_TAB_LINK,
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
    { label: 'Age-adjustment methodology', url: `${AGE_ADJUSTMENT_LINK}` },
    { label: 'GitHub', url: 'urlMap.hetGitHub' },
    { label: 'Resources', url: `${RESOURCES_TAB_LINK}` },
    { label: 'Contact Us', url: `${CONTACT_TAB_LINK}` },
  ],
  listItems: [
    'All data in the Health Equity Tracker is sourced from reputable and public databases, including the Centers for Disease Control and Prevention (CDC), U.S Census Bureau, Kaiser Family Foundation, and several others. A comprehensive list of our data sources, along with relevant details, can be found in our [data catalog](https://healthequitytracker.org/datacatalog).',
    'Our data analysis aims to provide insights into health disparities across various demographic groups. Age-adjustment methodology is employed to ensure to illustrate the disproportionate impact of morbidity and mortality among different races and ethnic groups throughout the U.S.in comparison to the white(non-Hispanic) population.',
    'The Health Equity Tracker employs a range of visualization techniques to present data in an intuitive and user-friendly manner. This includes charts, graphs, and interactive visualizations tailored to the specific type of data being presented.',
    'While we strive for accuracy, some datasets may have inherent limitations, including gaps, potential biases, or uncertainties. We transparently communicate these limitations whenever relevant.',
    'Data sources are continuously monitored for updates. The Health Equity Tracker ensures that all visualizations and datasets are refreshed in line with the latest available data.',
    'We value the input of various stakeholders, including health professionals, community leaders, and the general public, in shaping the content and presentation of our tracker.',
    'All our data sources are duly cited, ensuring transparency and credibility. A comprehensive list of references can be found in our [resources](https://healthequitytracker.org/resources) section.',
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
