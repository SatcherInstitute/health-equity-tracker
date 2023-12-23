import { NEW_AGE_ADJUSTMENT_LINK } from '../../../utils/internalRoutes'
import { sourceAcquisitionData } from '../methodologyContent/SourcesDefinitions'
import { parseDescription } from '../methodologyComponents/GlossaryTerm'
import { Helmet } from 'react-helmet-async'

const SourcesLink = () => {
  const { title, description, listItems, nestedListItems } =
    sourceAcquisitionData

  return (
    <section id='#data-sources'>
      <article>
        <Helmet>
          <title>Data Sources - Health Equity Tracker</title>
        </Helmet>
        <h2 className='sr-only'>{title}</h2>
        <div>
          <p>{parseDescription(description)}</p>

          <h3 className='font-sansTitle text-title'>Data Sources</h3>
          <p>{parseDescription(listItems[0])}</p>

          <h3 className='font-sansTitle text-title' id='#data-collection'>
            Data Collection
          </h3>
          <ul>
            {nestedListItems[0].sub.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h3 className='font-sansTitle text-title' id='#data-processing'>
            Data Processing
          </h3>

          <ul>
            <li>{nestedListItems[1].sub[0]}</li>
            <li>
              Transformation: Graphic visualizations reflect
              <b>crude rates</b>
              (non-age-adjusted) presented in various formats, such as
              <b>cases per 100k</b>, <b>percent rate</b>, <b>percent share</b>,
              or as an <b>index score</b>.
            </li>
            <li>{nestedListItems[1].sub[2]}</li>
          </ul>

          <h3 className='font-sansTitle text-title' id='#data-analysis'>
            Data Analysis
          </h3>
          <p>{listItems[1]}</p>
          <ul>
            <li>
              Where data are readily available, calculations are made to present
              age-adjusted ratios in separate tables. To learn more, please view
              our{' '}
              <a href={NEW_AGE_ADJUSTMENT_LINK}>age-adjustment methodology</a>.
            </li>
          </ul>

          <h3
            className='font-sansTitle text-title'
            id='#visualization-techniques'
          >
            Visualization Techniques
          </h3>
          <p>{listItems[2]}</p>

          <h3 className='font-sansTitle text-title' id='#dataset-limitations'>
            Dataset Limitations
          </h3>
          <p>{listItems[3]}</p>

          <h3 className='font-sansTitle text-title' id='#updates-and-revisions'>
            Updates and Revisions
          </h3>
          <p>{listItems[4]}</p>

          <h3
            className='font-sansTitle text-title'
            id='#stakeholder-engagement'
          >
            Stakeholder Engagement
          </h3>
          <p>{listItems[5]}</p>

          <h3
            className='font-sansTitle text-title'
            id='#references-and-citations'
          >
            References and Citations
          </h3>
          <p>{parseDescription(listItems[6])}</p>

          <h3 className='font-sansTitle text-title' id='#contact-information'>
            Contact Information
          </h3>
          <p>{parseDescription(listItems[7])}</p>
        </div>
      </article>
    </section>
  )
}

export default SourcesLink
