import { Helmet } from 'react-helmet-async'
import GlossaryTerm from '../methodologyComponents/GlossaryTerm'
import Resources from '../methodologyComponents/Resources'
import {
  AIAN_RESOURCES,
  API_RESOURCES,
  COVID_RESOURCES,
  COVID_VACCINATION_RESOURCES,
  ECONOMIC_EQUITY_RESOURCES,
  EQUITY_INDEX_RESOURCES,
  HISP_RESOURCES,
  HIV_RESOURCES,
  MENTAL_HEALTH_RESOURCES,
  PDOH_RESOURCES,
  RESOURCES,
} from '../methodologyContent/ResourcesData'
import { termDefinitions } from '../methodologyContent/TermDefinitions'

function GlossaryLink() {
  return (
    <section id='health-equity-terms'>
      <article>
        <Helmet>
          <title>Glossary - Health Equity Tracker</title>
        </Helmet>

        <GlossaryTerm topic={''} definitionItems={termDefinitions} />

        <Resources resourceGroups={[RESOURCES]} id='health-equity-resources' />
        <Resources
          resourceGroups={[EQUITY_INDEX_RESOURCES]}
          id='equity-index-resources'
        />
        <Resources
          resourceGroups={[ECONOMIC_EQUITY_RESOURCES]}
          id='economic-equity-resources'
        />
        <Resources
          resourceGroups={[MENTAL_HEALTH_RESOURCES]}
          id='mental-health-resources'
        />
        <Resources resourceGroups={[COVID_RESOURCES]} id='covid-resources' />
        <Resources
          resourceGroups={[COVID_VACCINATION_RESOURCES]}
          id='covid-vaccination-resources'
        />
        <Resources resourceGroups={[HIV_RESOURCES]} id='hiv-resources' />
        <Resources resourceGroups={[AIAN_RESOURCES]} id='aian-resources' />
        <Resources resourceGroups={[API_RESOURCES]} id='api-resources' />
        <Resources resourceGroups={[HISP_RESOURCES]} id='hisp-resources' />
        <Resources resourceGroups={[PDOH_RESOURCES]} id='pdoh-resources' />
      </article>
    </section>
  )
}
export default GlossaryLink
