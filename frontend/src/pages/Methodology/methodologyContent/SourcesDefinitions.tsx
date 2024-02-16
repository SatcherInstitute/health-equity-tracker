import {
  NEW_AGE_ADJUSTMENT_LINK,
  CONTACT_TAB_LINK,
  DATA_CATALOG_PAGE_LINK,
} from '../../../utils/internalRoutes'

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
    'All data in the Health Equity Tracker is sourced from reputable and public databases, including the Centers for Disease Control and Prevention (CDC), U.S Census Bureau, Kaiser Family Foundation, and several others. A comprehensive list of our data sources, along with relevant details, can be found in our data catalog.',
    '',
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
