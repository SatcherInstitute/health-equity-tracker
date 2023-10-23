import styles from '../methodologyComponents/MethodologyPage.module.scss'
import {
  AGE_ADJUSTMENT_LINK,
  RESOURCES_TAB_LINK,
} from '../../../utils/internalRoutes'
import {
  sourceAcquisitionData,
  sourcesDefinitionsArray,
} from '../methodologyContent/SourcesDefinitions'
import KeyTerms from '../methodologyComponents/KeyTerms'
import { urlMap } from '../../../utils/externalUrls'
import { parseDescription } from '../methodologyComponents/DataTable'

const SourcesLink = () => {
  const { title, description, links, listItems, nestedListItems } =
    sourceAcquisitionData

  return (
    <section>
      <article>
        <h2 className={styles.ScreenreaderTitleHeader}>{title}</h2>

        <KeyTerms definitionsArray={sourcesDefinitionsArray} />

        <p>{parseDescription(description)}</p>

        <h3 id="#data-sources">Data Sources</h3>
        <p>{parseDescription(listItems[0])}</p>

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

        <h3 id="#dataset-limitations">Dataset Limitations</h3>
        <p>{listItems[3]}</p>

        <h3 id="#updates-and-revisions">Updates and Revisions</h3>
        <p>{listItems[4]}</p>

        <h3 id="#stakeholder-engagement">Stakeholder Engagement</h3>
        <p>{listItems[5]}</p>

        <h3 id="#references-and-citations">References and Citations</h3>
        <p>{parseDescription(listItems[6])}</p>

        <h3 id="#contact-information">Contact Information</h3>
        <p>{parseDescription(listItems[7])}</p>

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
