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
import { Helmet } from 'react-helmet-async'
import DefinitionTooltip from '../methodologyComponents/DefinitionTooltip'
import { definitionsGlossary } from '../methodologyContent/DefinitionGlossary'
import {
  crudeRatesTooltip,
  percentRateTooltip,
  percentShareTooltip,
  indexScoreTooltip,
  totalCasesPer100kPeopleTooltip,
} from '../methodologyContent/TooltipLibrary'

const SourcesLink = () => {
  const { title, description, links, listItems, nestedListItems } =
    sourceAcquisitionData

  return (
    <section id="#data-sources">
      <article>
        <Helmet>
          <title>Data Sources - Health Equity Tracker</title>
        </Helmet>
        <h2 className={styles.ScreenreaderTitleHeader}>{title}</h2>
        <div>
          <p>{parseDescription(description)}</p>

          <h3>Data Sources</h3>
          <p>{parseDescription(listItems[0])}</p>

          <h3 id="#data-collection">Data Collection</h3>
          <ul>
            {nestedListItems[0].sub.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h3 id="#data-processing">Data Processing</h3>

          <ul>
            <li>{nestedListItems[1].sub[0]}</li>
            <li>
              Transformation: Graphic visualizations reflect
              {crudeRatesTooltip}
              (non-age-adjusted) presented in various formats, such as
              {totalCasesPer100kPeopleTooltip}, {percentRateTooltip},{' '}
              {percentShareTooltip}, or as an {indexScoreTooltip}.
            </li>
            <li>{nestedListItems[1].sub[2]}</li>
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
        </div>
      </article>
    </section>
  )
}

export default SourcesLink
