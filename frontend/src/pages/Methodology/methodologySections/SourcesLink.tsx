import styles from '../methodologyComponents/MethodologyPage.module.scss'
import { urlMap } from '../../../utils/externalUrls'
import {
  AGE_ADJUSTMENT_LINK,
  CONTACT_TAB_LINK,
  DATA_CATALOG_PAGE_LINK,
  RESOURCES_TAB_LINK,
} from '../../../utils/internalRoutes'
import DatasetTable, { dataCatalog } from '../methodologyContent/DatasetTable'
import DataTable from '../methodologyComponents/DataTable'
// TODO: data catalog link
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

const sourceAcquisitionData: SourceAcquisitionData = {
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
    'All data in the Health Equity Tracker is sourced from reputable and public databases, including the Centers for Disease Control and Prevention (CDC), U.S Census Bureau, Kaiser Family Foundation, and several others. A comprehensive list of our data sources, along with relevant details, can be found in our data catalog.',
    'Our data analysis aims to provide insights into health disparities across various demographic groups. Age-adjustment methodology is employed to ensure to illustrate the disproportionate impact of morbidity and mortality among different races and ethnic groups throughout the U.S.in comparison to the white(non - Hispanic) population',
    'The Health Equity Tracker employs a range of visualization techniques to present data in an intuitive and user-friendly manner. This includes charts, graphs, and interactive visualizations tailored to the specific type of data being presented.',
    'While we strive for accuracy, some datasets may have inherent limitations, including gaps, potential biases, or uncertainties. We transparently communicate these limitations whenever relevant.',
    'Data sources are continuously monitored for updates. The Health Equity Tracker ensures that all visualizations and datasets are refreshed in line with the latest available data.',
    'We value the input of various stakeholders, including health professionals, community leaders, and the general public, in shaping the content and presentation of our tracker.',
    'All our data sources are duly cited, ensuring transparency and credibility.',
    'The Health Equity Tracker is a testament to our commitment to promoting health equity and justice. We believe in the power of data to drive positive change, and we invite the community to engage with our open-source platform. For any queries, feedback, or suggestions regarding our data acquisition and presentation, please contact us.',
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

const SourcesLink = () => {
  const { title, description, links, listItems, nestedListItems } =
    sourceAcquisitionData

  return (
    <section>
      <article>
        <h2 className={styles.ScreenreaderTitleHeader}>{title}</h2>

        <p>{description}</p>

        <h3 id="#data-sources">Data Sources</h3>
        <p>{listItems[0]}</p>

        <h3 id="#data-collection">Data Collection</h3>
        <ul>
          {nestedListItems[0].sub.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h3 id="#data-processing">Data Processing</h3>

        <ul>
          {nestedListItems[1].sub.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h3 id="#data-analysis">Data Analysis</h3>
        <p>{listItems[1]}</p>
        <ul>
          <li>
            Where data are readily available, calculations are made to present
            age-adjusted ratios in separate tables. To learn more, please view
            our{' '}
            <a href={`${AGE_ADJUSTMENT_LINK}`}>age-adjustment methodology</a>.
          </li>
        </ul>

        <h3 id="#visualization-techniques">Visualization Techniques</h3>
        <p>{listItems[2]}</p>
        <ul>
          <li>
            Graphic visualizations reflect crude rates (non-age-adjusted), as
            either <b>per 100k</b>, <b>percent rate</b>, <b>percent share</b>,
            or as an <b>index score</b>.
          </li>
        </ul>

        <h3 id="#dataset-limitations">Dataset Limitations</h3>
        <p>{listItems[3]}</p>

        <h3 id="#updates-and-revisions">Updates and Revisions</h3>
        <p>{listItems[4]}</p>

        <h3 id="#stakeholder-engagement">Stakeholder Engagement</h3>
        <p>{listItems[5]}</p>

        <h3 id="#references-and-citations">References and Citations</h3>
        <p>{listItems[6]}</p>
        <ul>
          <li>
            A comprehensive list of references can be found in our{' '}
            <a href={`${RESOURCES_TAB_LINK}`}>resources</a> section.
          </li>
        </ul>

        <h3 id="#contact-information">Contact Information</h3>
        <p>{listItems[7]}</p>
        <ul>
          <li>
            The entire Health Equity Tracker codebase is publicly available and
            open-source; contributions are welcome via{' '}
            <a href={`${urlMap.hetGitHub}`}>GitHub</a>.
          </li>
        </ul>

        <h3 id="#sources-links">Useful Links</h3>
        <ul>
          {links.map((link) => (
            <li key={link.url}>
              <a href={link.url}>{link.label}</a>
            </li>
          ))}
        </ul>
      </article>
    </section>
  )
}

export default SourcesLink
